import { prisma } from '../../config/database'
import { generateQuotePdf } from './pdf-quote.service'
import { uploadPdf, isR2Configured } from './r2-upload.service'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://n8n-evolution.aynvvy.easypanel.host'
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || '21go'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''

interface FollowUpInput {
  leadId: string
  /** Enviar PDF anexo (se disponível). Default: true. */
  withPdf?: boolean
  /** Forçar reenvio mesmo que o flag followUpEnviado esteja true. */
  force?: boolean
}

type LeadForFollowUp = {
  id: string
  nome: string
  whatsapp: string | null
  marcaInteresse: string | null
  modeloInteresse: string | null
  placaInteresse: string | null
  cotacaoValor: number | null
  cotacaoPlano: string | null
  anoInteresse: number | null
  valorFipeConsultado: number | null
  email: string | null
  pdfUrl: string | null
}

function buildFollowUpMessage(lead: LeadForFollowUp): string {
  const firstName = lead.nome.split(' ')[0]
  const isMoto =
    (lead.marcaInteresse || '').toLowerCase().includes('moto') ||
    (lead.cotacaoPlano || '').toLowerCase().includes('moto')
  const tipo = isMoto ? 'moto' : 'carro'
  const veiculo =
    lead.modeloInteresse && lead.modeloInteresse !== '(manual)' && lead.modeloInteresse !== '(informado manualmente)'
      ? `${lead.marcaInteresse} ${lead.modeloInteresse} ${lead.anoInteresse || ''}`.trim()
      : tipo === 'moto'
      ? 'sua moto'
      : 'seu carro'
  const placa = lead.placaInteresse || ''
  const valor = lead.cotacaoValor
    ? `R$ ${lead.cotacaoValor.toFixed(2).replace('.', ',')}`
    : null

  const artigo = isMoto ? 'a' : 'o'
  const pronome = isMoto ? 'ela' : 'ele'

  const lines = [
    `Oi *${firstName}*! Tudo bem? 😊`,
    ``,
    `Preparei sua *simulação completa* em PDF d${artigo} *${veiculo}*${placa ? ` — placa *${placa}*` : ''}.`,
    ``,
  ]

  if (valor) {
    lines.push(`Ficou em *${valor}/mês* pra proteger ${pronome} com o plano *${lead.cotacaoPlano}*.`)
    lines.push(``)
  }

  lines.push(
    `Com a *21Go* ${artigo} ${tipo} fica segur${artigo} *a partir de agora*. O valor que apareceu ali? *Não muda, não sobe, sem surpresa*.`,
    ``,
    `Qualquer dúvida me responde por aqui — *estou te acompanhando para fechar hoje* 🚀`,
  )

  return lines.join('\n')
}

/** Formata número brasileiro para o padrão Evolution (55 + DDD + número). */
function formatPhone(whatsapp: string): string {
  const raw = whatsapp.replace(/\D/g, '')
  return raw.startsWith('55') ? raw : `55${raw}`
}

async function sendText(phone: string, text: string) {
  return fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
    body: JSON.stringify({ number: phone, text }),
  })
}

async function sendPdfMedia(phone: string, media: string, caption: string, filename: string) {
  // Evolution API — sendMedia aceita URL pública OU string base64 (sem prefixo data:).
  return fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
    body: JSON.stringify({
      number: phone,
      mediatype: 'document',
      mimetype: 'application/pdf',
      media,
      caption,
      fileName: filename,
    }),
  })
}

interface PdfData {
  /** URL pública (quando R2 está configurado e upload funcionou) */
  url?: string
  /** Buffer em memória — Evolution recebe como base64 (fallback sem R2) */
  buffer?: Buffer
  filename: string
}

/**
 * Garante que o lead tenha PDF disponível (URL R2 ou Buffer em memória).
 * Sempre tenta gerar; só retorna null se faltar dado essencial ou Puppeteer falhar.
 */
async function ensurePdfData(lead: LeadForFollowUp): Promise<PdfData | null> {
  const filename = `simulacao-21go-${lead.id}.pdf`
  if (lead.pdfUrl) return { url: lead.pdfUrl, filename }
  if (!lead.marcaInteresse || !lead.modeloInteresse || !lead.valorFipeConsultado || !lead.cotacaoPlano || !lead.cotacaoValor) {
    return null
  }
  let pdf: Buffer
  try {
    pdf = await generateQuotePdf({
      nome: lead.nome,
      whatsapp: lead.whatsapp || '',
      email: lead.email,
      placa: lead.placaInteresse,
      marca: lead.marcaInteresse,
      modelo: lead.modeloInteresse,
      ano: lead.anoInteresse ? String(lead.anoInteresse) : '',
      fipe: lead.valorFipeConsultado,
      planoNome: lead.cotacaoPlano,
      mensalidade: lead.cotacaoValor,
      isMoto: (lead.cotacaoPlano || '').toLowerCase().includes('moto'),
    })
  } catch (err: any) {
    console.error('[FollowUp] Falha ao gerar PDF (Puppeteer):', err.message)
    return null
  }

  // Se R2 disponível, sobe e retorna URL (melhor — persistente)
  if (isR2Configured()) {
    try {
      const key = `quotes/${new Date().toISOString().slice(0, 10)}/${lead.id}.pdf`
      const { url } = await uploadPdf(key, pdf, filename)
      await prisma.lead.update({
        where: { id: lead.id },
        data: { pdfUrl: url, pdfGeradoEm: new Date() },
      })
      return { url, filename }
    } catch (err: any) {
      console.warn('[FollowUp] R2 upload falhou, vai cair pro base64:', err.message)
    }
  }

  // Fallback: envia direto via base64 (sem persistência)
  await prisma.lead
    .update({ where: { id: lead.id }, data: { pdfGeradoEm: new Date() } })
    .catch(() => {})
  return { buffer: pdf, filename }
}

/**
 * Envia follow-up (ou envio imediato). Se `withPdf` estiver habilitado e o PDF
 * estiver disponível, manda o PDF como documento (Evolution sendMedia) com
 * caption curta e um segundo sendText com a mensagem completa.
 */
export async function sendFollowUp(input: FollowUpInput) {
  if (!EVOLUTION_API_KEY) {
    console.warn('[FollowUp] Evolution API key não configurada, skip')
    return { success: false, error: 'Evolution API not configured' }
  }

  try {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } })
    if (!lead) return { success: false, error: 'Lead not found' }
    if (!lead.whatsapp) return { success: false, error: 'Lead sem whatsapp' }

    if (!input.force && (lead.etapaFunil === 'convertido' || lead.followUpEnviado)) {
      return { success: false, error: 'Lead already converted or followed up' }
    }

    const phone = formatPhone(lead.whatsapp)
    const message = buildFollowUpMessage(lead as LeadForFollowUp)

    let pdfData: PdfData | null = null
    if (input.withPdf !== false) {
      pdfData = await ensurePdfData(lead as LeadForFollowUp)
    }

    if (pdfData) {
      const firstName = lead.nome.split(' ')[0]
      const caption = `${firstName}, aqui está sua *simulação completa* 21Go 📄`
      const media = pdfData.url ?? (pdfData.buffer as Buffer).toString('base64')
      await sendPdfMedia(phone, media, caption, pdfData.filename)
      await sendText(phone, message)
    } else {
      // Fallback: só mensagem de texto
      await sendText(phone, message)
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        followUpEnviado: true,
        followUpData: new Date(),
        etapaFunil: 'followup_enviado',
        pdfEnviado: Boolean(pdfData),
        pdfEnviadoEm: pdfData ? new Date() : null,
      },
    })

    console.log(`[FollowUp] Enviado para ${lead.nome} (${phone}) — PDF: ${pdfData ? (pdfData.url ? 'url' : 'base64') : 'no'}`)
    return { success: true, leadId: lead.id, phone, pdfSent: Boolean(pdfData) }
  } catch (err: any) {
    console.error('[FollowUp] Error:', err.message)
    return { success: false, error: err.message }
  }
}
