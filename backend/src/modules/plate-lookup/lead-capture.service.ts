import { prisma } from '../../config/database'

interface PublicLeadInput {
  // Dados do formulário
  nome: string
  whatsapp: string
  email?: string
  placa: string
  leilao?: 'nao' | 'leilao' | 'remarcado'

  // Dados do veículo
  marca?: string
  modelo?: string
  ano?: string
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

  if (!input.nome || !input.whatsapp || !input.placa) {
    return { success: false, error: 'Nome, WhatsApp e placa são obrigatórios.' }
  }

  try {
    const existing = await prisma.lead.findFirst({
      where: {
        companyId,
        whatsapp: input.whatsapp,
        placaInteresse: input.placa.toUpperCase(),
      },
    })

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
          // Atualizar tracking se disponível
          gclid: input.gclid || existing.gclid,
          fbclid: input.fbclid || existing.fbclid,
          fbp: input.fbp || existing.fbp,
          fbc: input.fbc || existing.fbc,
        },
      })
      return { success: true, leadId: updated.id, action: 'updated' }
    }

    const lead = await prisma.lead.create({
      data: {
        companyId,
        nome: input.nome,
        whatsapp: input.whatsapp,
        email: input.email || null,
        telefone: input.whatsapp,

        placaInteresse: input.placa.toUpperCase(),
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

        // Tracking avançado
        gclid: input.gclid || null,
        fbclid: input.fbclid || null,
        fbp: input.fbp || null,
        fbc: input.fbc || null,
        ipAddress: ip || null,
        userAgent: userAgent || null,
      },
    })

    return { success: true, leadId: lead.id, action: 'created' }
  } catch (err: any) {
    console.error('[LeadCapture] Error:', err.message)
    return { success: false, error: 'Erro ao salvar lead.' }
  }
}
