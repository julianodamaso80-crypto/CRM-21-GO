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

async function sendPdfByUrl(phone: string, pdfUrl: string, caption: string, filename: string) {
  // Evolution API — endpoint sendMedia aceita URL pública ou base64.
  return fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
    body: JSON.stringify({
      number: phone,
      mediatype: 'document',
      mimetype: 'application/pdf',
      media: pdfUrl,
      caption,
      fileName: filename,
    }),
  })
}

/**
 * Garante que o lead tenha um pdfUrl. Se não tiver, tenta gerar agora.
 * Retorna a URL ou null em caso de falha.
 */
async function ensurePdfUrl(lead: LeadForFollowUp): Promise<string | null> {
  if (lead.pdfUrl) return lead.pdfUrl
  if (!isR2Configured()) return null
  if (!lead.marcaInteresse || !lead.modeloInteresse || !lead.valorFipeConsultado || !lead.cotacaoPlano || !lead.cotacaoValor) {
    return null
  }
  try {
    const pdf = await generateQuotePdf({
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
    const key = `quotes/${new Date().toISOString().slice(0, 10)}/${lead.id}.pdf`
    const { url } = await uploadPdf(key, pdf, `simulacao-21go-${lead.id}.pdf`)
    await prisma.lead.update({
      where: { id: lead.id },
      data: { pdfUrl: url, pdfGeradoEm: new Date() },
    })
    return url
  } catch (err: any) {
    console.error('[FollowUp] Falha ao gerar PDF sob demanda:', err.message)
    return null
  }
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

    let pdfUrl: string | null = null
    if (input.withPdf !== false) {
      pdfUrl = await ensurePdfUrl(lead as LeadForFollowUp)
    }

    if (pdfUrl) {
      // 1) manda PDF como documento com caption curta
      const firstName = lead.nome.split(' ')[0]
      const caption = `${firstName}, aqui está sua *simulação completa* 21Go 📄`
      await sendPdfByUrl(phone, pdfUrl, caption, `simulacao-21go-${lead.id}.pdf`)
      // 2) em seguida a mensagem completa
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
        pdfEnviado: Boolean(pdfUrl),
        pdfEnviadoEm: pdfUrl ? new Date() : null,
      },
    })

    console.log(`[FollowUp] Enviado para ${lead.nome} (${phone}) — PDF: ${Boolean(pdfUrl)}`)
    return { success: true, leadId: lead.id, phone, pdfUrl }
  } catch (err: any) {
    console.error('[FollowUp] Error:', err.message)
    return { success: false, error: err.message }
  }
}
