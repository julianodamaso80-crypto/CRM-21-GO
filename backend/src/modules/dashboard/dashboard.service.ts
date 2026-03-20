import { prisma } from '../../config/database'

export class DashboardService {
  async getStats(companyId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // --- Associados ---
    const [
      contactsTotal,
      contactsWithEmail,
      contactsWithPhone,
      contactsRecent,
    ] = await Promise.all([
      prisma.associado.count({ where: { companyId } }),
      prisma.associado.count({
        where: { companyId, email: { not: null } },
      }),
      prisma.associado.count({
        where: { companyId, telefone: { not: null } },
      }),
      prisma.associado.count({
        where: {
          companyId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ])

    // --- Pipes & Cards ---
    const [totalPipes, totalCards, activeCards, doneCards] = await Promise.all([
      prisma.pipe.count({ where: { companyId } }),
      prisma.card.count({ where: { companyId } }),
      prisma.card.count({ where: { companyId, status: 'active' } }),
      prisma.card.count({ where: { companyId, status: 'done' } }),
    ])

    // --- Pipes Summary ---
    const pipes = await prisma.pipe.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: { cards: true },
        },
      },
    })

    const pipesSummary = await Promise.all(
      pipes.map(async (pipe) => {
        const activeCount = await prisma.card.count({
          where: { companyId, pipeId: pipe.id, status: 'active' },
        })
        return {
          id: pipe.id,
          name: pipe.name,
          color: pipe.color,
          totalCards: pipe._count.cards,
          activeCards: activeCount,
        }
      })
    )

    // --- Phase Distribution ---
    const phases = await prisma.phase.findMany({
      where: { companyId },
      select: {
        name: true,
        color: true,
        _count: {
          select: { cards: true },
        },
      },
    })

    const phaseDistribution = phases.map((phase) => ({
      phaseName: phase.name,
      phaseColor: phase.color,
      count: phase._count.cards,
    }))

    // --- AI Stats ---
    const [totalDocuments, totalAgents] = await Promise.all([
      prisma.knowledgeDocument.count({
        where: {
          knowledgeBase: { companyId },
        },
      }),
      prisma.aIAgent.count({ where: { companyId } }),
    ])

    // --- Recent Cards ---
    const recentCardsRaw = await prisma.card.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        pipe: {
          select: { name: true },
        },
        currentPhase: {
          select: { name: true, color: true },
        },
      },
    })

    const recentCards = recentCardsRaw.map((card) => ({
      id: card.id,
      title: card.title,
      status: card.status,
      pipeName: card.pipe.name,
      phaseName: card.currentPhase.name,
      phaseColor: card.currentPhase.color,
      createdAt: card.createdAt,
    }))

    // --- Cards by Day (last 7 days) ---
    const cardsByDay: Array<{ date: string; created: number; completed: number }> = []

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)
      dayStart.setDate(dayStart.getDate() - i)

      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const [created, completed] = await Promise.all([
        prisma.card.count({
          where: {
            companyId,
            createdAt: { gte: dayStart, lte: dayEnd },
          },
        }),
        prisma.card.count({
          where: {
            companyId,
            completedAt: { gte: dayStart, lte: dayEnd },
          },
        }),
      ])

      cardsByDay.push({
        date: dayStart.toISOString().split('T')[0],
        created,
        completed,
      })
    }

    return {
      contacts: {
        total: contactsTotal,
        withEmail: contactsWithEmail,
        withPhone: contactsWithPhone,
        recentCount: contactsRecent,
      },
      pipes: {
        totalPipes,
        totalCards,
        activeCards,
        doneCards,
      },
      pipesSummary,
      phaseDistribution,
      ai: {
        totalQueries: 0,
        totalDocuments,
        totalAgents,
      },
      recentCards,
      cardsByDay,
    }
  }
}
