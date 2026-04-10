import { prisma } from '../../config/database'
import { sendMetaCAPI } from './integrations/meta-capi'
import { sendGoogleAdsConversion } from './integrations/google-ads'

interface ConvertInput {
  valorCompra: number
  produtoComprado: string
}

export async function convertLead(leadId: string, input: ConvertInput) {
  if (!input.valorCompra || !input.produtoComprado) {
    return { success: false, error: 'valorCompra e produtoComprado são obrigatórios.' }
  }

  try {
    // Buscar o lead (com filtro multi-tenant)
    const lead = await prisma.lead.findFirst({ where: { id: leadId, companyId: 'company-21go' } })
    if (!lead) {
      return { success: false, error: 'Lead não encontrado.' }
    }

    if (lead.status === 'cliente_ativo') {
      return { success: false, error: 'Lead já foi convertido.' }
    }

    // Atualizar status pra cliente_ativo
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'cliente_ativo',
        etapaFunil: 'fechado',
        valorCompra: input.valorCompra,
        produtoComprado: input.produtoComprado,
        dataConversao: new Date(),
      },
    })

    // Disparar conversões offline em background (não bloqueia a resposta)
    dispatchOfflineConversions(updated).catch(err => {
      console.error('[ConvertLead] Error dispatching offline conversions:', err.message)
    })

    return {
      success: true,
      leadId: updated.id,
      status: 'cliente_ativo',
      message: 'Lead convertido. Conversões offline sendo enviadas.',
    }
  } catch (err: any) {
    console.error('[ConvertLead] Error:', err.message)
    return { success: false, error: 'Erro ao converter lead.' }
  }
}

async function dispatchOfflineConversions(lead: any) {
  const results: Record<string, unknown> = {}

  // 1. Meta CAPI — Purchase event
  if (lead.fbp || lead.fbc || lead.fbclid || lead.email) {
    try {
      const metaResult = await sendMetaCAPI({
        eventName: 'Purchase',
        eventTime: Math.floor(Date.now() / 1000),
        value: lead.valorCompra,
        currency: 'BRL',
        email: lead.email,
        phone: lead.whatsapp || lead.telefone,
        fbp: lead.fbp,
        fbc: lead.fbc,
        fbclid: lead.fbclid,
        sourceUrl: 'https://21go.site/cotacao',
        ip: lead.ipAddress,
        userAgent: lead.userAgent,
      })

      await prisma.lead.update({
        where: { id: lead.id },
        data: { metaCapiSent: true, metaCapiSentAt: new Date() },
      })
      results.metaCapi = metaResult
      console.log('[ConvertLead] Meta CAPI Purchase sent for lead:', lead.id)
    } catch (err: any) {
      console.error('[ConvertLead] Meta CAPI error:', err.message)
      results.metaCapi = { error: err.message }
    }
  }

  // 2. Google Ads Offline Conversion
  if (lead.gclid) {
    try {
      const googleResult = await sendGoogleAdsConversion({
        gclid: lead.gclid,
        conversionValue: lead.valorCompra,
        conversionTime: new Date().toISOString(),
      })

      await prisma.lead.update({
        where: { id: lead.id },
        data: { googleAdsSent: true, googleAdsSentAt: new Date() },
      })
      results.googleAds = googleResult
      console.log('[ConvertLead] Google Ads conversion sent for lead:', lead.id)
    } catch (err: any) {
      console.error('[ConvertLead] Google Ads error:', err.message)
      results.googleAds = { error: err.message }
    }
  }

  return results
}
