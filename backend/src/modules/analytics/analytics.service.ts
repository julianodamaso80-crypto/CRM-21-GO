import { prisma } from '../../config/database'

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  source?: string
  campaign?: string
  platform?: string
  pipelineId?: string
  groupBy?: string
  metric?: string
  granularity?: string
  sortBy?: string
}

export class AnalyticsService {
  /**
   * Helper: constroi filtro de data para queries
   */
  private buildDateFilter(filters: AnalyticsFilters): { gte?: Date; lte?: Date } {
    const dateFilter: { gte?: Date; lte?: Date } = {}

    if (filters.startDate) {
      dateFilter.gte = new Date(filters.startDate)
    }
    if (filters.endDate) {
      dateFilter.lte = new Date(filters.endDate)
    }

    // Default: ultimos 30 dias se nenhuma data fornecida
    if (!filters.startDate && !filters.endDate) {
      dateFilter.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      dateFilter.lte = new Date()
    }

    return dateFilter
  }

  /**
   * Helper: constroi filtro de leads com base nos filtros
   */
  private buildLeadWhere(companyId: string, filters: AnalyticsFilters) {
    const where: any = { companyId }
    const dateFilter = this.buildDateFilter(filters)

    if (dateFilter.gte || dateFilter.lte) {
      where.createdAt = dateFilter
    }
    if (filters.source) {
      where.source = filters.source
    }
    if (filters.campaign) {
      where.campaign = filters.campaign
    }
    if (filters.platform) {
      where.adPlatform = filters.platform
    }

    return where
  }

  /**
   * Visao geral de analytics: metricas principais
   */
  async getOverview(companyId: string, filters: AnalyticsFilters) {
    const dateFilter = this.buildDateFilter(filters)
    const leadWhere = this.buildLeadWhere(companyId, filters)

    // Periodo anterior para calculo de growth
    const periodDuration = (dateFilter.lte?.getTime() || Date.now()) - (dateFilter.gte?.getTime() || Date.now() - 30 * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date((dateFilter.gte?.getTime() || Date.now() - 30 * 24 * 60 * 60 * 1000) - periodDuration)
    const previousPeriodEnd = dateFilter.gte || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalLeads,
      newLeadsThisPeriod,
      previousPeriodLeads,
      convertedLeads,
      wonDeals,
      previousWonDeals,
    ] = await Promise.all([
      prisma.lead.count({ where: { companyId } }),
      prisma.lead.count({ where: leadWhere }),
      prisma.lead.count({
        where: {
          companyId,
          createdAt: { gte: previousPeriodStart, lte: previousPeriodEnd },
          ...(filters.source ? { source: filters.source } : {}),
          ...(filters.campaign ? { campaign: filters.campaign } : {}),
          ...(filters.platform ? { adPlatform: filters.platform } : {}),
        },
      }),
      prisma.lead.count({
        where: {
          ...leadWhere,
          convertedAt: { not: null },
        },
      }),
      prisma.deal.findMany({
        where: {
          companyId,
          status: 'won',
          actualCloseDate: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
        },
        select: { value: true },
      }),
      prisma.deal.findMany({
        where: {
          companyId,
          status: 'won',
          actualCloseDate: { gte: previousPeriodStart, lte: previousPeriodEnd },
        },
        select: { value: true },
      }),
    ])

    const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0)
    const previousRevenue = previousWonDeals.reduce((sum, d) => sum + Number(d.value), 0)
    const totalConversions = convertedLeads
    const conversionRate = newLeadsThisPeriod > 0 ? (convertedLeads / newLeadsThisPeriod) * 100 : 0
    const leadsGrowth = previousPeriodLeads > 0
      ? ((newLeadsThisPeriod - previousPeriodLeads) / previousPeriodLeads) * 100
      : 0
    const revenueGrowth = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0
    const avgDealValue = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0

    // Tempo medio de conversao (dias entre lead criado e convertedAt)
    const convertedLeadsData = await prisma.lead.findMany({
      where: {
        ...leadWhere,
        convertedAt: { not: null },
      },
      select: { createdAt: true, convertedAt: true },
    })

    const avgTimeToConvert = convertedLeadsData.length > 0
      ? convertedLeadsData.reduce((sum, l) => {
          const diff = (l.convertedAt!.getTime() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          return sum + diff
        }, 0) / convertedLeadsData.length
      : 0

    // Lead velocity (leads por dia no periodo)
    const periodDays = Math.max(1, periodDuration / (1000 * 60 * 60 * 24))
    const leadVelocity = newLeadsThisPeriod / periodDays

    // Custo por lead
    const totalSpend = await prisma.campaignCost.aggregate({
      where: {
        companyId,
        date: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
        ...(filters.platform ? { platform: filters.platform } : {}),
        ...(filters.campaign ? { campaignName: filters.campaign } : {}),
      },
      _sum: { spend: true },
    })
    const costPerLead = newLeadsThisPeriod > 0
      ? Number(totalSpend._sum.spend || 0) / newLeadsThisPeriod
      : 0

    // Top source e campaign
    const topSourceResult = await prisma.lead.groupBy({
      by: ['source'],
      where: leadWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    })
    const topSource = topSourceResult.length > 0 ? topSourceResult[0].source : null

    const topCampaignResult = await prisma.lead.groupBy({
      by: ['campaign'],
      where: { ...leadWhere, campaign: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    })
    const topCampaign = topCampaignResult.length > 0 ? topCampaignResult[0].campaign : null

    return {
      totalLeads,
      newLeadsThisPeriod,
      leadsGrowth: Math.round(leadsGrowth * 100) / 100,
      totalConversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      avgDealValue: Math.round(avgDealValue * 100) / 100,
      avgTimeToConvert: Math.round(avgTimeToConvert * 10) / 10,
      leadVelocity: Math.round(leadVelocity * 10) / 10,
      costPerLead: Math.round(costPerLead * 100) / 100,
      topSource,
      topCampaign,
    }
  }

  /**
   * Analise por fonte de origem dos leads
   */
  async getSources(companyId: string, filters: AnalyticsFilters) {
    const leadWhere = this.buildLeadWhere(companyId, filters)

    const sourcesGrouped = await prisma.lead.groupBy({
      by: ['source'],
      where: leadWhere,
      _count: { id: true },
    })

    const data = await Promise.all(
      sourcesGrouped.map(async (group) => {
        const converted = await prisma.lead.count({
          where: {
            ...leadWhere,
            source: group.source,
            convertedAt: { not: null },
          },
        })

        const wonDeals = await prisma.deal.findMany({
          where: {
            companyId,
            status: 'won',
            contact: {
              leads: {
                some: { source: group.source, companyId },
              },
            },
          },
          select: { value: true },
        })

        const revenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0)
        const conversionRate = group._count.id > 0 ? (converted / group._count.id) * 100 : 0
        const avgValue = wonDeals.length > 0 ? revenue / wonDeals.length : 0

        return {
          source: group.source,
          leads: group._count.id,
          converted,
          conversionRate: Math.round(conversionRate * 100) / 100,
          revenue: Math.round(revenue * 100) / 100,
          avgValue: Math.round(avgValue * 100) / 100,
          trend: 0, // Placeholder para calculo de tendencia
        }
      })
    )

    // Ordenar por leads desc
    data.sort((a, b) => b.leads - a.leads)

    const totals = {
      leads: data.reduce((sum, d) => sum + d.leads, 0),
      converted: data.reduce((sum, d) => sum + d.converted, 0),
      revenue: Math.round(data.reduce((sum, d) => sum + d.revenue, 0) * 100) / 100,
    }

    return { data, totals }
  }

  /**
   * Analise por campanha
   */
  async getCampaigns(companyId: string, filters: AnalyticsFilters) {
    const dateFilter = this.buildDateFilter(filters)

    // Buscar custos de campanha
    const campaignCosts = await prisma.campaignCost.groupBy({
      by: ['campaignName', 'platform'],
      where: {
        companyId,
        date: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
        ...(filters.platform ? { platform: filters.platform } : {}),
        ...(filters.campaign ? { campaignName: filters.campaign } : {}),
      },
      _sum: { spend: true },
    })

    const data = await Promise.all(
      campaignCosts.map(async (cost) => {
        // Leads desta campanha
        const leads = await prisma.lead.count({
          where: {
            companyId,
            campaign: cost.campaignName,
            createdAt: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
          },
        })

        // Conversoes desta campanha
        const conversions = await prisma.lead.count({
          where: {
            companyId,
            campaign: cost.campaignName,
            convertedAt: { not: null },
            createdAt: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
          },
        })

        // Revenue desta campanha (deals won de leads desta campanha)
        const wonDeals = await prisma.deal.findMany({
          where: {
            companyId,
            status: 'won',
            contact: {
              leads: {
                some: { campaign: cost.campaignName, companyId },
              },
            },
          },
          select: { value: true },
        })

        const spend = Number(cost._sum.spend || 0)
        const revenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0)
        const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0
        const cpl = leads > 0 ? spend / leads : 0
        const cpa = conversions > 0 ? spend / conversions : 0

        return {
          campaign: cost.campaignName,
          platform: cost.platform,
          leads,
          conversions,
          spend: Math.round(spend * 100) / 100,
          revenue: Math.round(revenue * 100) / 100,
          roi: Math.round(roi * 100) / 100,
          cpl: Math.round(cpl * 100) / 100,
          cpa: Math.round(cpa * 100) / 100,
        }
      })
    )

    return { data }
  }

  /**
   * Funil de conversao por pipeline/pipe stages
   */
  async getFunnel(companyId: string, filters: AnalyticsFilters) {
    // Buscar pipeline ou pipe
    let stages: Array<{ id: string; name: string; order: number }>

    if (filters.pipelineId) {
      // Tentar como Pipeline primeiro
      const pipelineStages = await prisma.stage.findMany({
        where: { pipelineId: filters.pipelineId },
        select: { id: true, name: true, order: true },
        orderBy: { order: 'asc' },
      })

      if (pipelineStages.length > 0) {
        stages = pipelineStages
      } else {
        // Tentar como Pipe
        const pipePhases = await prisma.phase.findMany({
          where: { pipeId: filters.pipelineId, companyId },
          select: { id: true, name: true, position: true },
          orderBy: { position: 'asc' },
        })
        stages = pipePhases.map((p) => ({
          id: p.id,
          name: p.name,
          order: p.position,
        }))
      }
    } else {
      // Usar primeiro pipe ativo da empresa
      const firstPipe = await prisma.pipe.findFirst({
        where: { companyId, status: 'active' },
        select: { id: true },
      })

      if (firstPipe) {
        const pipePhases = await prisma.phase.findMany({
          where: { pipeId: firstPipe.id, companyId },
          select: { id: true, name: true, position: true },
          orderBy: { position: 'asc' },
        })
        stages = pipePhases.map((p) => ({
          id: p.id,
          name: p.name,
          order: p.position,
        }))
      } else {
        // Fallback: primeiro pipeline
        const firstPipeline = await prisma.pipeline.findFirst({
          where: { companyId },
          select: { id: true },
        })

        if (firstPipeline) {
          const pipelineStages = await prisma.stage.findMany({
            where: { pipelineId: firstPipeline.id },
            select: { id: true, name: true, order: true },
            orderBy: { order: 'asc' },
          })
          stages = pipelineStages
        } else {
          stages = []
        }
      }
    }

    // Contar cards/deals em cada stage
    const funnelStages = await Promise.all(
      stages.map(async (stage, _index) => {
        const count = await prisma.card.count({
          where: { companyId, currentPhaseId: stage.id },
        })

        return {
          name: stage.name,
          count,
          conversionRate: 0,
          dropoffRate: 0,
          avgTime: 0,
        }
      })
    )

    // Calcular taxas de conversao entre stages
    for (let i = 0; i < funnelStages.length; i++) {
      if (i === 0) {
        funnelStages[i].conversionRate = 100
      } else {
        const prevCount = funnelStages[i - 1].count
        funnelStages[i].conversionRate = prevCount > 0
          ? Math.round((funnelStages[i].count / prevCount) * 10000) / 100
          : 0
      }
      funnelStages[i].dropoffRate = Math.round((100 - funnelStages[i].conversionRate) * 100) / 100
    }

    const firstCount = funnelStages.length > 0 ? funnelStages[0].count : 0
    const lastCount = funnelStages.length > 0 ? funnelStages[funnelStages.length - 1].count : 0
    const overallConversion = firstCount > 0
      ? Math.round((lastCount / firstCount) * 10000) / 100
      : 0

    // Encontrar maior dropoff
    let biggestDropoff = ''
    let maxDropoff = 0
    for (const stage of funnelStages) {
      if (stage.dropoffRate > maxDropoff && stage.conversionRate < 100) {
        maxDropoff = stage.dropoffRate
        biggestDropoff = stage.name
      }
    }

    return {
      stages: funnelStages,
      overallConversion,
      biggestDropoff,
      avgCycleTime: 0, // Placeholder
    }
  }

  /**
   * Calculo de Lifetime Value (LTV)
   */
  async getLTV(companyId: string, filters: AnalyticsFilters) {
    const dateFilter = this.buildDateFilter(filters)

    // Buscar todos os deals won agrupados por contact
    const wonDeals = await prisma.deal.findMany({
      where: {
        companyId,
        status: 'won',
        actualCloseDate: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
      },
      select: {
        value: true,
        contactId: true,
        contact: {
          select: {
            leads: {
              select: { source: true, campaign: true },
              take: 1,
            },
          },
        },
      },
    })

    // Agrupar por contact para calcular LTV individual
    const ltvByContact: Record<string, number> = {}
    for (const deal of wonDeals) {
      if (!ltvByContact[deal.contactId]) {
        ltvByContact[deal.contactId] = 0
      }
      ltvByContact[deal.contactId] += Number(deal.value)
    }

    const ltvValues = Object.values(ltvByContact)
    const avgLTV = ltvValues.length > 0
      ? Math.round((ltvValues.reduce((sum, v) => sum + v, 0) / ltvValues.length) * 100) / 100
      : 0

    // Mediana
    const sortedLTV = [...ltvValues].sort((a, b) => a - b)
    const medianLTV = sortedLTV.length > 0
      ? Math.round(sortedLTV[Math.floor(sortedLTV.length / 2)] * 100) / 100
      : 0

    // LTV por fonte
    const sourceMap: Record<string, { total: number; customers: number }> = {}
    for (const deal of wonDeals) {
      const source = deal.contact.leads[0]?.source || 'unknown'
      if (!sourceMap[source]) {
        sourceMap[source] = { total: 0, customers: 0 }
      }
      sourceMap[source].total += Number(deal.value)
      sourceMap[source].customers += 1
    }

    const ltvBySource = Object.entries(sourceMap).map(([source, data]) => ({
      source,
      ltv: Math.round((data.total / data.customers) * 100) / 100,
      customers: data.customers,
    }))

    // LTV por campanha
    const campaignMap: Record<string, { total: number; customers: number }> = {}
    for (const deal of wonDeals) {
      const campaign = deal.contact.leads[0]?.campaign || 'unknown'
      if (!campaignMap[campaign]) {
        campaignMap[campaign] = { total: 0, customers: 0 }
      }
      campaignMap[campaign].total += Number(deal.value)
      campaignMap[campaign].customers += 1
    }

    const ltvByCampaign = Object.entries(campaignMap).map(([campaign, data]) => ({
      campaign,
      ltv: Math.round((data.total / data.customers) * 100) / 100,
      customers: data.customers,
    }))

    return {
      avgLTV,
      medianLTV,
      ltvBySource,
      ltvByCampaign,
      cohorts: [], // Placeholder para analise de cohort futura
    }
  }

  /**
   * Calculo de ROI (Return on Investment)
   */
  async getROI(companyId: string, filters: AnalyticsFilters) {
    const dateFilter = this.buildDateFilter(filters)

    // Total gasto
    const spendByPlatform = await prisma.campaignCost.groupBy({
      by: ['platform'],
      where: {
        companyId,
        date: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
        ...(filters.platform ? { platform: filters.platform } : {}),
      },
      _sum: { spend: true },
    })

    const totalSpend = spendByPlatform.reduce((sum, p) => sum + Number(p._sum.spend || 0), 0)

    // Revenue total
    const wonDeals = await prisma.deal.findMany({
      where: {
        companyId,
        status: 'won',
        actualCloseDate: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
      },
      select: { value: true },
    })

    const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0)
    const overallROI = totalSpend > 0
      ? Math.round(((totalRevenue - totalSpend) / totalSpend) * 10000) / 100
      : 0

    // ROI por plataforma
    const byPlatform = await Promise.all(
      spendByPlatform.map(async (platformCost) => {
        const platformLeads = await prisma.lead.count({
          where: {
            companyId,
            adPlatform: platformCost.platform,
            createdAt: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
          },
        })

        const platformConversions = await prisma.lead.count({
          where: {
            companyId,
            adPlatform: platformCost.platform,
            convertedAt: { not: null },
            createdAt: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
          },
        })

        const platformDeals = await prisma.deal.findMany({
          where: {
            companyId,
            status: 'won',
            contact: {
              leads: {
                some: { adPlatform: platformCost.platform, companyId },
              },
            },
          },
          select: { value: true },
        })

        const spend = Number(platformCost._sum.spend || 0)
        const revenue = platformDeals.reduce((sum, d) => sum + Number(d.value), 0)
        const roi = spend > 0 ? Math.round(((revenue - spend) / spend) * 10000) / 100 : 0

        return {
          platform: platformCost.platform,
          spend: Math.round(spend * 100) / 100,
          leads: platformLeads,
          conversions: platformConversions,
          revenue: Math.round(revenue * 100) / 100,
          roi,
        }
      })
    )

    // ROI por campanha
    const spendByCampaign = await prisma.campaignCost.groupBy({
      by: ['campaignName'],
      where: {
        companyId,
        date: dateFilter.gte || dateFilter.lte ? dateFilter : undefined,
        ...(filters.platform ? { platform: filters.platform } : {}),
        ...(filters.campaign ? { campaignName: filters.campaign } : {}),
      },
      _sum: { spend: true },
    })

    const byCampaign = await Promise.all(
      spendByCampaign.map(async (campaignCost) => {
        const spend = Number(campaignCost._sum.spend || 0)

        const campaignDeals = await prisma.deal.findMany({
          where: {
            companyId,
            status: 'won',
            contact: {
              leads: {
                some: { campaign: campaignCost.campaignName, companyId },
              },
            },
          },
          select: { value: true },
        })

        const revenue = campaignDeals.reduce((sum, d) => sum + Number(d.value), 0)
        const roi = spend > 0 ? Math.round(((revenue - spend) / spend) * 10000) / 100 : 0

        return {
          campaign: campaignCost.campaignName,
          spend: Math.round(spend * 100) / 100,
          revenue: Math.round(revenue * 100) / 100,
          roi,
        }
      })
    )

    return {
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      overallROI,
      byPlatform,
      byCampaign,
    }
  }

  /**
   * Series temporais de metricas
   */
  async getTrends(companyId: string, filters: AnalyticsFilters) {
    const dateFilter = this.buildDateFilter(filters)
    const metric = filters.metric || 'leads'
    const granularity = filters.granularity || 'day'

    const startDate = dateFilter.gte || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = dateFilter.lte || new Date()

    // Gerar datas do periodo
    const dates: Date[] = []
    const current = new Date(startDate)
    while (current <= endDate) {
      dates.push(new Date(current))
      if (granularity === 'week') {
        current.setDate(current.getDate() + 7)
      } else if (granularity === 'month') {
        current.setMonth(current.getMonth() + 1)
      } else {
        current.setDate(current.getDate() + 1)
      }
    }

    const data = await Promise.all(
      dates.map(async (date) => {
        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)

        const dayEnd = new Date(dayStart)
        if (granularity === 'week') {
          dayEnd.setDate(dayEnd.getDate() + 6)
        } else if (granularity === 'month') {
          dayEnd.setMonth(dayEnd.getMonth() + 1)
          dayEnd.setDate(dayEnd.getDate() - 1)
        }
        dayEnd.setHours(23, 59, 59, 999)

        let value = 0
        let label = metric

        if (metric === 'leads') {
          value = await prisma.lead.count({
            where: {
              companyId,
              createdAt: { gte: dayStart, lte: dayEnd },
              ...(filters.source ? { source: filters.source } : {}),
              ...(filters.campaign ? { campaign: filters.campaign } : {}),
            },
          })
          label = 'Leads'
        } else if (metric === 'conversions') {
          value = await prisma.lead.count({
            where: {
              companyId,
              convertedAt: { gte: dayStart, lte: dayEnd },
              ...(filters.source ? { source: filters.source } : {}),
            },
          })
          label = 'Conversions'
        } else if (metric === 'revenue') {
          const deals = await prisma.deal.findMany({
            where: {
              companyId,
              status: 'won',
              actualCloseDate: { gte: dayStart, lte: dayEnd },
            },
            select: { value: true },
          })
          value = Math.round(deals.reduce((sum, d) => sum + Number(d.value), 0) * 100) / 100
          label = 'Revenue'
        } else if (metric === 'cards') {
          value = await prisma.card.count({
            where: {
              companyId,
              createdAt: { gte: dayStart, lte: dayEnd },
            },
          })
          label = 'Cards'
        }

        return {
          date: dayStart.toISOString().split('T')[0],
          value,
          label,
        }
      })
    )

    // Calcular summary
    const values = data.map((d) => d.value)
    const totalDays = Math.max(1, values.length)
    const avgPerDay = Math.round((values.reduce((sum, v) => sum + v, 0) / totalDays) * 100) / 100

    // Tendencia: comparar primeira metade com segunda metade
    const mid = Math.floor(values.length / 2)
    const firstHalfAvg = mid > 0 ? values.slice(0, mid).reduce((s, v) => s + v, 0) / mid : 0
    const secondHalfAvg = values.length - mid > 0 ? values.slice(mid).reduce((s, v) => s + v, 0) / (values.length - mid) : 0

    let trend: 'up' | 'down' | 'stable' = 'stable'
    const trendPercentage = firstHalfAvg > 0
      ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 10000) / 100
      : 0

    if (trendPercentage > 5) trend = 'up'
    else if (trendPercentage < -5) trend = 'down'

    return {
      data,
      summary: {
        avgPerDay,
        trend,
        trendPercentage,
      },
    }
  }
}
