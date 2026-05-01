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
  carroApp: boolean
  leilao: string | null
  seguroAtual: string | null
}

function buildReengajamentoMessage(lead: LeadForFollowUp): string {
  const firstName = lead.nome.split(' ')[0]
  const isMoto =
    (lead.marcaInteresse || '').toLowerCase().includes('moto') ||
    (lead.cotacaoPlano || '').toLowerCase().includes('moto')
  const tipo = isMoto ? 'moto' : 'carro'
  const veiculo =
    lead.modeloInteresse && lead.modeloInteresse !== '(manual)' && lead.modeloInteresse !== '(informado manualmente)'
      ? `${lead.marcaInteresse} ${lead.modeloInteresse}`.trim()
      : tipo === 'moto'
      ? 'sua moto'
      : 'seu carro'

  return [
    `Oi *${firstName}*! Tudo bem? 😊`,
    ``,
    `Vi que você fez a simulação d${isMoto ? 'a' : 'o'} *${veiculo}* há pouco. Ficou alguma dúvida sobre os benefícios?`,
  ].join('\n')
}

/** Lead caiu na lista de exclusao do site — sem cotacao automatica, precisa de
 *  consultor pra cotar manualmente. */
function isExcludedLead(lead: LeadForFollowUp): boolean {
  return (lead.cotacaoPlano || '').toUpperCase() === 'EXCLUIDO'
}

/** Formata FIPE em BRL (sem o "R$"). */
function formatFipeBR(value: number | null | undefined): string {
  if (!value) return ''
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Mensagem para veiculos da lista de exclusao. Nao tem PDF; abre conversa
 *  com o consultor pedindo confirmacao dos dados. Sem condicoes especiais
 *  (leilao, carro de app, seguro) — essas vao em outros canais internos. */
function buildExcludedMessage(lead: LeadForFollowUp): string {
  const firstName = lead.nome.split(' ')[0]
  const veiculo =
    lead.modeloInteresse && lead.modeloInteresse !== '(manual)' && lead.modeloInteresse !== '(informado manualmente)'
      ? `${lead.marcaInteresse || ''} ${lead.modeloInteresse} ${lead.anoInteresse || ''}`.trim()
      : (lead.marcaInteresse || 'seu veículo')
  const placa = lead.placaInteresse || ''
  const fipe = formatFipeBR(lead.valorFipeConsultado)
  const whatsapp = lead.whatsapp || ''

  const lines = [
    `Oi *${firstName}*! Tudo bem? 😊`,
    ``,
    `Vi que você fez uma simulação no nosso site, mas o seu veículo precisa de uma *cotação especial*`,
    ``,
    `• Nome: *${lead.nome}*`,
    ...(whatsapp ? [`• WhatsApp: *${whatsapp}*`] : []),
    ...(placa ? [`• Placa: *${placa}*`] : []),
    `• Veículo: *${veiculo}*`,
    ...(fipe ? [`• FIPE: *R$ ${fipe}*`] : []),
    ``,
    ``,
    `Confirma os dados por favor`,
  ]

  return lines.join('\n')
}

function buildFollowUpMessage(lead: LeadForFollowUp): string {
  // Veiculos da lista de exclusao: mensagem especifica (sem PDF / "simulacao completa")
  if (isExcludedLead(lead)) return buildExcludedMessage(lead)

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
  const artigo = isMoto ? 'a' : 'o'

  // Vai como CAPTION do PDF (1 mensagem so) pra evitar muitas mensagens
  // seguidas e risco de bloqueio do chip pelo whatsapp.
  return [
    `Oi *${firstName}*! Tudo bem? 😊`,
    ``,
    `Me chamo Letycia e estou aqui para dar sequência no seu atendimento.`,
    ``,
    `Preparei sua *simulação completa* em PDF d${artigo} *${veiculo}*${placa ? `, placa *${placa}*` : ''}.`,
    ``,
    `Ficou com alguma dúvida que eu possa te ajudar? Se sim, qual dúvida?`,
  ].join('\n')
}

/** Formata número brasileiro para o padrão Evolution (55 + DDD + número). */
function formatPhone(whatsapp: string): string {
  const raw = whatsapp.replace(/\D/g, '')
  return raw.startsWith('55') ? raw : `55${raw}`
}

async function sendText(phone: string, text: string) {
  const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`
  console.log('[FollowUp] sendText →', phone, '(', text.length, 'chars )')
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
    body: JSON.stringify({ number: phone, text }),
  })
  const body = await res.text().catch(() => '')
  console.log('[FollowUp] sendText resp:', res.status, body.slice(0, 300))
  if (!res.ok) throw new Error(`sendText falhou ${res.status}: ${body.slice(0, 200)}`)
  return res
}

async function sendPdfMedia(phone: string, media: string, caption: string, filename: string) {
  const url = `${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE}`
  const isUrl = media.startsWith('http')
  console.log('[FollowUp] sendPdfMedia →', phone, isUrl ? `URL=${media.slice(0, 80)}` : `base64=${media.length} chars`, 'file=', filename)
  const res = await fetch(url, {
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
  const body = await res.text().catch(() => '')
  console.log('[FollowUp] sendPdfMedia resp:', res.status, body.slice(0, 300))
  if (!res.ok) throw new Error(`sendPdfMedia falhou ${res.status}: ${body.slice(0, 200)}`)
  return res
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
  if (lead.pdfUrl) {
    console.log('[FollowUp] Reusando pdfUrl existente:', lead.pdfUrl)
    return { url: lead.pdfUrl, filename }
  }
  const missing: string[] = []
  if (!lead.marcaInteresse) missing.push('marcaInteresse')
  if (!lead.modeloInteresse) missing.push('modeloInteresse')
  if (!lead.valorFipeConsultado) missing.push('valorFipeConsultado')
  if (!lead.cotacaoPlano) missing.push('cotacaoPlano')
  if (!lead.cotacaoValor) missing.push('cotacaoValor')
  if (missing.length) {
    console.warn('[FollowUp] Lead sem dados pra gerar PDF — faltam:', missing.join(', '))
    return null
  }
  let pdf: Buffer
  try {
    console.log('[FollowUp] Gerando PDF para lead', lead.id)
    pdf = await generateQuotePdf({
      nome: lead.nome,
      whatsapp: lead.whatsapp || '',
      email: lead.email,
      placa: lead.placaInteresse,
      marca: lead.marcaInteresse!,
      modelo: lead.modeloInteresse!,
      ano: lead.anoInteresse ? String(lead.anoInteresse) : '',
      fipe: lead.valorFipeConsultado!,
      planoNome: lead.cotacaoPlano!,
      mensalidade: lead.cotacaoValor!,
      isMoto: (lead.cotacaoPlano || '').toLowerCase().includes('moto'),
      carroApp: lead.carroApp,
      leilao: lead.leilao,
      seguroAtual: lead.seguroAtual,
    })
    console.log('[FollowUp] PDF buffer ok —', pdf.length, 'bytes')
  } catch (err: any) {
    console.error('[FollowUp] Falha ao gerar PDF (Puppeteer):', err.message, err.stack)
    return null
  }

  // Se R2 disponível, sobe e retorna URL (melhor — persistente)
  if (isR2Configured()) {
    try {
      const key = `quotes/${new Date().toISOString().slice(0, 10)}/${lead.id}.pdf`
      console.log('[FollowUp] Subindo PDF para R2:', key)
      const { url } = await uploadPdf(key, pdf, filename)
      console.log('[FollowUp] R2 ok:', url)
      await prisma.lead.update({
        where: { id: lead.id },
        data: { pdfUrl: url, pdfGeradoEm: new Date() },
      })
      return { url, filename }
    } catch (err: any) {
      console.warn('[FollowUp] R2 upload falhou, vai cair pro base64:', err.message)
    }
  } else {
    console.log('[FollowUp] R2 não configurado — usando base64')
  }

  // Fallback: envia direto via base64 (sem persistência)
  await prisma.lead
    .update({ where: { id: lead.id }, data: { pdfGeradoEm: new Date() } })
    .catch(() => {})
  return { buffer: pdf, filename }
}

/**
 * Envia follow-up (ou envio imediato). Se `withPdf` estiver habilitado e o
 * PDF estiver disponível, manda 1 ÚNICA mensagem: PDF + texto completo
 * como caption. Se nao houver PDF (ex: veiculo excluido), manda so texto.
 */
export async function sendFollowUp(input: FollowUpInput) {
  console.log('[FollowUp] === START ===', JSON.stringify({ leadId: input.leadId, withPdf: input.withPdf, force: input.force }))
  if (!EVOLUTION_API_KEY) {
    console.warn('[FollowUp] Evolution API key não configurada, skip')
    return { success: false, error: 'Evolution API not configured' }
  }

  try {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId } })
    if (!lead) return { success: false, error: 'Lead not found' }
    if (!lead.whatsapp) return { success: false, error: 'Lead sem whatsapp' }

    console.log('[FollowUp] Lead carregado:', JSON.stringify({
      id: lead.id, nome: lead.nome, etapaFunil: lead.etapaFunil,
      followUpEnviado: lead.followUpEnviado, pdfEnviado: lead.pdfEnviado,
      hasMarca: !!lead.marcaInteresse, hasPlano: !!lead.cotacaoPlano,
      hasFipe: !!lead.valorFipeConsultado, hasValor: !!lead.cotacaoValor,
    }))

    if (!input.force && (lead.etapaFunil === 'convertido' || lead.followUpEnviado)) {
      console.warn('[FollowUp] BLOQUEADO — etapaFunil=', lead.etapaFunil, 'followUpEnviado=', lead.followUpEnviado, '(use force:true pra reenviar)')
      return { success: false, error: 'Lead already converted or followed up' }
    }

    // DEBOUNCE GLOBAL POR WHATSAPP — regra dura contra spam
    // Se o MESMO WhatsApp já recebeu follow-up nas últimas 24h (em QUALQUER lead),
    // não envia de novo. Protege contra o caso Ramon: cliente faz 2 cotações com
    // carros diferentes e o sistema cria 2 leads — sem isso ele recebe 2 PDFs.
    if (!input.force) {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentSent = await prisma.lead.findFirst({
        where: {
          whatsapp: lead.whatsapp,
          followUpEnviado: true,
          followUpData: { gte: cutoff },
          id: { not: lead.id },
        },
        select: { id: true, followUpData: true },
      })
      if (recentSent) {
        console.warn('[FollowUp] BLOQUEADO (debounce 24h) — whatsapp', lead.whatsapp,
          'recebeu follow-up no lead', recentSent.id, 'em', recentSent.followUpData?.toISOString())
        // Marca este lead como "já enviado" pra evitar re-tentativas em cascata
        await prisma.lead.update({
          where: { id: lead.id },
          data: { followUpEnviado: true, followUpData: new Date() },
        }).catch(() => {})
        return { success: false, error: 'Debounce 24h por whatsapp' }
      }
    }

    const phone = formatPhone(lead.whatsapp)
    const message = buildFollowUpMessage(lead as LeadForFollowUp)

    let pdfData: PdfData | null = null
    if (input.withPdf !== false) {
      pdfData = await ensurePdfData(lead as LeadForFollowUp)
    }

    if (pdfData) {
      // Manda PDF + mensagem completa como CAPTION (1 mensagem so) pra evitar
      // muitas mensagens seguidas (risco de bloqueio do chip pelo whatsapp).
      const media = pdfData.url ?? (pdfData.buffer as Buffer).toString('base64')
      await sendPdfMedia(phone, media, message, pdfData.filename)
    } else {
      // Fallback: só mensagem de texto (ex: lead excluido, sem PDF)
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

/* ─────────────────────────────────────────────────────────────────────────
 * REENGAJAMENTO automático — 5 min após follow-up
 *
 * Se o cliente não clicou em "Contratar pelo WhatsApp" e não respondeu,
 * manda uma mensagem leve perguntando se ficou alguma dúvida.
 * ───────────────────────────────────────────────────────────────────────── */

const REENGAJAMENTO_DELAY_MS = 5 * 60 * 1000 // mínimo: 5 minutos após follow-up
const REENGAJAMENTO_JANELA_MAX_MS = 15 * 60 * 1000 // máximo: 15 minutos — depois disso, cancela (janela de oportunidade perdida, vendedor provavelmente já pegou)

/**
 * Verifica se o lead respondeu via WhatsApp depois do follow-up.
 * Busca inbound do cliente no conversation do lead.
 */
async function leadRespondeuAposFollowUp(leadId: string, since: Date): Promise<boolean> {
  const inbound = await prisma.message.findFirst({
    where: {
      direction: 'inbound',
      createdAt: { gte: since },
      conversation: { leadId },
    },
    select: { id: true },
  })
  return Boolean(inbound)
}

export async function sendReengajamento(leadId: string) {
  // DESATIVADO — após o envio inicial (PDF + mensagem), o bot NÃO envia
  // mais nenhuma mensagem. O reengajamento automático foi removido.
  console.log(`[Reengajamento] DESATIVADO — ignorando lead ${leadId}`)
  // Marca como enviado pra que o worker não tente de novo
  await prisma.lead.update({
    where: { id: leadId },
    data: { reengajamentoEnviado: true, reengajamentoData: new Date() },
  }).catch(() => {})
  return { success: false, error: 'Reengajamento desativado' }
}

/**
 * Inicia o worker que processa reengajamentos pendentes.
 * DESATIVADO — após o envio inicial (PDF + mensagem), o bot NÃO envia
 * mais nenhuma mensagem. Qualquer interação posterior é feita pelo
 * atendente humano. O reengajamento automático foi desativado para
 * evitar que o bot envie mensagem depois que o cliente já respondeu.
 */
export function startReengajamentoWorker() {
  console.log('[Reengajamento] Worker DESATIVADO — bot envia apenas a mensagem inicial com PDF')
  // No-op: reengajamento automático removido por decisão de negócio.
}

export function stopReengajamentoWorker() {
  // No-op: worker já desativado.
}

