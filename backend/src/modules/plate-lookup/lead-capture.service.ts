import { prisma } from '../../config/database'

interface PublicLeadInput {
  // Dados do formulário
  nome: string
  whatsapp: string
  email?: string
  placa: string
  leilao?: 'nao' | 'leilao' | 'remarcado'

  // Dados do veículo (da consulta API Brasil)
  marca?: string
  modelo?: string
  ano?: string
  valorFipe?: number

  // Plano selecionado
  plano?: string
  valorMensal?: number

  // Tracking (click IDs + UTMs do cookie do site)
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  gclid?: string
  fbclid?: string
}

export async function createPublicLead(input: PublicLeadInput) {
  const companyId = process.env.DEFAULT_COMPANY_ID

  if (!companyId) {
    return { success: false, error: 'Serviço indisponível no momento.' }
  }

  if (!input.nome || !input.whatsapp || !input.placa) {
    return { success: false, error: 'Nome, WhatsApp e placa são obrigatórios.' }
  }

  try {
    // Verificar se já existe um lead com esse WhatsApp + placa (evitar duplicatas)
    const existing = await prisma.lead.findFirst({
      where: {
        companyId,
        whatsapp: input.whatsapp,
        placaInteresse: input.placa.toUpperCase(),
      },
    })

    if (existing) {
      // Atualizar o lead existente com dados mais recentes
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
          updatedAt: new Date(),
        },
      })

      return { success: true, leadId: updated.id, action: 'updated' }
    }

    // Criar novo lead
    const lead = await prisma.lead.create({
      data: {
        companyId,
        nome: input.nome,
        whatsapp: input.whatsapp,
        email: input.email || null,
        telefone: input.whatsapp,

        // Veículo
        placaInteresse: input.placa.toUpperCase(),
        marcaInteresse: input.marca || null,
        modeloInteresse: input.modelo || null,
        anoInteresse: input.ano ? parseInt(input.ano) || null : null,

        // Cotação
        valorFipeConsultado: input.valorFipe || null,
        cotacaoValor: input.valorMensal || null,
        cotacaoPlano: input.plano || null,
        cotacaoEnviada: true,
        cotacaoData: new Date(),

        // Qualificação
        qualificadoPor: 'site',
        scoreQualificacao: 50, // Lead quente — fez cotação no site
        etapaFunil: 'cotacao_enviada',

        // Origem / Tracking
        origem: input.utmSource ? `${input.utmSource}_${input.utmMedium || 'direct'}` : 'site_organico',
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
        utmContent: input.utmContent || null,
        utmTerm: input.utmTerm || null,
      },
    })

    return { success: true, leadId: lead.id, action: 'created' }
  } catch (err: any) {
    // Se a tabela não existe ainda, não crashar
    console.error('[LeadCapture] Error:', err.message)
    return { success: false, error: 'Erro ao salvar lead.' }
  }
}
