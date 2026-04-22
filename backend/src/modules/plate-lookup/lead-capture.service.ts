import { prisma } from '../../config/database'
import { generateQuotePdf } from './pdf-quote.service'
import { uploadPdf, isR2Configured } from './r2-upload.service'
import { scheduleFollowUp } from './quote-queue'

interface PublicLeadInput {
  // Dados do formulário
  nome: string
  whatsapp: string
  email?: string
  placa?: string
  leilao?: 'nao' | 'leilao' | 'remarcado'

  // Dados do veículo
  marca?: string
  modelo?: string
  ano?: string
  cor?: string
  valorFipe?: number

  // Plano selecionado
  plano?: string
  valorMensal?: number

  // Tracking
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  gclid?: string
  fbclid?: string
  fbp?: string
  fbc?: string
}

/**
 * Gera PDF, faz upload no R2 e retorna URL. Nunca lança — erros são logados.
 */
async function buildAndUploadPdf(
  leadId: string,
  input: PublicLeadInput,
): Promise<string | null> {
  if (!isR2Configured()) {
    console.warn('[LeadCapture] R2 não configurado — PDF não será gerado')
    return null
  }
  if (!input.marca || !input.modelo || !input.valorFipe || !input.plano || !input.valorMensal) {
    // Sem dados suficientes para PDF completo
    return null
  }
  try {
    const pdf = await generateQuotePdf({
      nome: input.nome,
      whatsapp: input.whatsapp,
      email: input.email || null,
      placa: input.placa || null,
      marca: input.marca,
      modelo: input.modelo,
      ano: input.ano || '',
      cor: input.cor || null,
      fipe: input.valorFipe,
      planoNome: input.plano,
      mensalidade: input.valorMensal,
      isMoto: (input.plano || '').toLowerCase().includes('moto'),
    })
    const key = `quotes/${new Date().toISOString().slice(0, 10)}/${leadId}.pdf`
    const filename = `simulacao-21go-${leadId}.pdf`
    const { url } = await uploadPdf(key, pdf, filename)
    return url
  } catch (err: any) {
    console.error('[LeadCapture] Falha ao gerar/subir PDF:', err.message)
    return null
  }
}

export async function createPublicLead(input: PublicLeadInput, ip?: string, userAgent?: string) {
  const companyId = process.env.DEFAULT_COMPANY_ID

  if (!companyId) {
    return { success: false, error: 'Serviço indisponível no momento.' }
  }

  if (!input.nome || !input.whatsapp) {
    return { success: false, error: 'Nome e WhatsApp são obrigatórios.' }
  }

  try {
    const placa = input.placa ? input.placa.toUpperCase() : null

    const existing = await prisma.lead.findFirst({
      where: placa
        ? { companyId, whatsapp: input.whatsapp, placaInteresse: placa }
        : { companyId, whatsapp: input.whatsapp, placaInteresse: null, marcaInteresse: input.marca || null, modeloInteresse: input.modelo || null },
    })

    let leadId: string
    let action: 'updated' | 'created'

    if (existing) {
      const updated = await prisma.lead.update({
        where: { id: existing.id },
        data: {
          nome: input.nome,
          email: input.email || existing.email,
          valorFipeConsultado: input.valorFipe || existing.valorFipeConsultado,
          cotacaoValor: input.valorMensal || existing.cotacaoValor,
          cotacaoPlano: input.plano || existing.cotacaoPlano,
          cotacaoEnviada: true,
          cotacaoData: new Date(),
          gclid: input.gclid || existing.gclid,
          fbclid: input.fbclid || existing.fbclid,
          fbp: input.fbp || existing.fbp,
          fbc: input.fbc || existing.fbc,
        },
      })
      leadId = updated.id
      action = 'updated'
    } else {
      const lead = await prisma.lead.create({
        data: {
          companyId,
          nome: input.nome,
          whatsapp: input.whatsapp,
          email: input.email || null,
          telefone: input.whatsapp,

          placaInteresse: placa,
          marcaInteresse: input.marca || null,
          modeloInteresse: input.modelo || null,
          anoInteresse: input.ano ? parseInt(input.ano) || null : null,

          valorFipeConsultado: input.valorFipe || null,
          cotacaoValor: input.valorMensal || null,
          cotacaoPlano: input.plano || null,
          cotacaoEnviada: true,
          cotacaoData: new Date(),

          qualificadoPor: 'site',
          scoreQualificacao: 50,
          etapaFunil: 'cotacao_enviada',
          status: 'lead',

          origem: input.utmSource ? `${input.utmSource}_${input.utmMedium || 'direct'}` : 'site_organico',
          utmSource: input.utmSource || null,
          utmMedium: input.utmMedium || null,
          utmCampaign: input.utmCampaign || null,
          utmContent: input.utmContent || null,
          utmTerm: input.utmTerm || null,

          gclid: input.gclid || null,
          fbclid: input.fbclid || null,
          fbp: input.fbp || null,
          fbc: input.fbc || null,
          ipAddress: ip || null,
          userAgent: userAgent || null,
        },
      })
      leadId = lead.id
      action = 'created'
    }

    // Fora do fluxo crítico: gera PDF + agenda follow-up em paralelo (fire-and-forget)
    ;(async () => {
      const pdfUrl = await buildAndUploadPdf(leadId, input)
      if (pdfUrl) {
        await prisma.lead
          .update({
            where: { id: leadId },
            data: { pdfUrl, pdfGeradoEm: new Date() },
          })
          .catch((err) => console.error('[LeadCapture] Falha ao salvar pdfUrl:', err.message))
      }
      await scheduleFollowUp(leadId).catch((err) =>
        console.error('[LeadCapture] Falha ao agendar follow-up:', err.message),
      )
    })()

    return { success: true, leadId, action }
  } catch (err: any) {
    console.error('[LeadCapture] Error:', err.message)
    return { success: false, error: 'Erro ao salvar lead.' }
  }
}
