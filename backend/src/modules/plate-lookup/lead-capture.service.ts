import { prisma } from '../../config/database'
import { scheduleFollowUp } from './quote-queue'
import { sendFollowUp } from './lead-followup.service'

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
          // Cliente refez cotação → libera novo envio de PDF/follow-up
          followUpEnviado: false,
          pdfEnviado: false,
          pdfUrl: null,
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

    console.log(`[LeadCapture] Lead ${action} id=${leadId} — disparando envio imediato (force:true)`)

    // Fora do fluxo crítico (fire-and-forget):
    //  1) Envia PDF + mensagem IMEDIATAMENTE (cliente acabou de ver a simulação)
    //  2) Agenda follow-up de 5min como BACKUP (worker pula se followUpEnviado=true)
    ;(async () => {
      try {
        const result = await sendFollowUp({ leadId, withPdf: true, force: true })
        if (!result.success) {
          console.warn('[LeadCapture] Envio imediato falhou:', result.error)
        } else {
          console.log('[LeadCapture] Envio imediato OK:', JSON.stringify(result))
        }
      } catch (err: any) {
        console.error('[LeadCapture] Erro no envio imediato:', err.message, err.stack)
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
