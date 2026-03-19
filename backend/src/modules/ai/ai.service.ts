import { prisma } from '../../config/database'
import { AppError } from '../../utils/app-error'

// ============================================================================
// DTOs
// ============================================================================

export interface CreateKnowledgeBaseDTO {
  name: string
  description?: string
}

export interface CreateAgentDTO {
  name: string
  description?: string
  provider: string
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt: string
  type?: string
  knowledgeBaseId?: string
  allowedScopes?: string[]
  canCreateLeads?: boolean
  canUpdateLeads?: boolean
  canCreateDeals?: boolean
  canTransferToHuman?: boolean
}

export interface UpdateAgentDTO extends Partial<CreateAgentDTO> {}

export interface QueryLogDTO {
  agentId?: string
  query: string
  response: string
  context?: any
  provider: string
  model: string
  tokensUsed?: number
  latencyMs?: number
  source?: string
}

// ============================================================================
// SERVICE
// ============================================================================

export class AIService {
  // === Knowledge Bases ===

  async listKnowledgeBases(companyId: string) {
    return prisma.knowledgeBase.findMany({
      where: { companyId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { documents: true, agents: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getKnowledgeBaseById(id: string, companyId: string) {
    const kb = await prisma.knowledgeBase.findFirst({
      where: { id, companyId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        agents: true,
      },
    })

    if (!kb) {
      throw new AppError('Base de conhecimento nao encontrada', 404, 'NOT_FOUND')
    }

    return kb
  }

  async createKnowledgeBase(companyId: string, data: CreateKnowledgeBaseDTO) {
    const id = crypto.randomUUID()
    const collectionName = `kb_${companyId}_${id}`

    return prisma.knowledgeBase.create({
      data: {
        id,
        companyId,
        name: data.name,
        description: data.description,
        collectionName,
      },
    })
  }

  async deleteKnowledgeBase(id: string, companyId: string) {
    const kb = await prisma.knowledgeBase.findFirst({
      where: { id, companyId },
    })

    if (!kb) {
      throw new AppError('Base de conhecimento nao encontrada', 404, 'NOT_FOUND')
    }

    await prisma.knowledgeBase.delete({ where: { id } })
    return { success: true, collectionName: kb.collectionName }
  }

  // === Knowledge Base Lookup ===

  async findKBByCollection(collectionName: string, companyId: string) {
    return prisma.knowledgeBase.findFirst({
      where: { collectionName, companyId },
    })
  }

  // === Knowledge Documents ===

  async listDocuments(knowledgeBaseId: string, companyId: string) {
    // Validar que a KB pertence a empresa
    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, companyId },
    })

    if (!kb) {
      throw new AppError('Base de conhecimento nao encontrada', 404, 'NOT_FOUND')
    }

    return prisma.knowledgeDocument.findMany({
      where: { knowledgeBaseId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createDocument(
    knowledgeBaseId: string,
    companyId: string,
    data: {
      name: string
      sourceType: string
      sourceUrl?: string
      sourceContent?: string
      fileName?: string
      fileSize?: number
      mimeType?: string
      filePath?: string
    }
  ) {
    const kb = await prisma.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, companyId },
    })

    if (!kb) {
      throw new AppError('Base de conhecimento nao encontrada', 404, 'NOT_FOUND')
    }

    return prisma.knowledgeDocument.create({
      data: {
        knowledgeBaseId,
        status: 'processing',
        ...data,
      },
    })
  }

  async findDocumentByHash(knowledgeBaseId: string, contentHash: string) {
    return prisma.knowledgeDocument.findFirst({
      where: {
        knowledgeBaseId,
        processingMeta: {
          path: ['content_hash'],
          equals: contentHash,
        },
      },
    })
  }

  async getDocumentForCascade(id: string, companyId: string) {
    const doc = await prisma.knowledgeDocument.findFirst({
      where: { id },
      include: { knowledgeBase: { select: { companyId: true, collectionName: true } } },
    })
    if (!doc || doc.knowledgeBase.companyId !== companyId) return null
    return {
      id: doc.id,
      chunkCount: doc.chunkCount,
      collectionName: doc.knowledgeBase.collectionName,
    }
  }

  async updateDocumentStatus(
    id: string,
    status: string,
    chunkCount?: number,
    errorMessage?: string
  ) {
    return prisma.knowledgeDocument.update({
      where: { id },
      data: {
        status,
        chunkCount: chunkCount ?? undefined,
        errorMessage: errorMessage ?? undefined,
        processedAt: status === 'completed' ? new Date() : undefined,
      },
    })
  }

  async deleteDocument(id: string, companyId: string) {
    const doc = await prisma.knowledgeDocument.findFirst({
      where: { id },
      include: { knowledgeBase: true },
    })

    if (!doc || doc.knowledgeBase.companyId !== companyId) {
      throw new AppError('Documento nao encontrado', 404, 'NOT_FOUND')
    }

    await prisma.knowledgeDocument.delete({ where: { id } })
    return { success: true, knowledgeBaseId: doc.knowledgeBaseId }
  }

  // === AI Agents ===

  async listAgents(companyId: string) {
    return prisma.aIAgent.findMany({
      where: { companyId },
      include: {
        knowledgeBase: {
          select: { id: true, name: true, collectionName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getAgentById(id: string, companyId: string) {
    const agent = await prisma.aIAgent.findFirst({
      where: { id, companyId },
      include: {
        knowledgeBase: {
          select: { id: true, name: true, collectionName: true, documentCount: true, chunkCount: true },
        },
      },
    })

    if (!agent) {
      throw new AppError('Agente nao encontrado', 404, 'NOT_FOUND')
    }

    return agent
  }

  async createAgent(companyId: string, data: CreateAgentDTO) {
    return prisma.aIAgent.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        provider: data.provider,
        model: data.model,
        temperature: data.temperature ?? 0.7,
        maxTokens: data.maxTokens ?? 1000,
        systemPrompt: data.systemPrompt,
        type: data.type ?? 'internal',
        knowledgeBaseId: data.knowledgeBaseId,
        allowedScopes: data.allowedScopes ?? [],
        canCreateLeads: data.canCreateLeads ?? false,
        canUpdateLeads: data.canUpdateLeads ?? false,
        canCreateDeals: data.canCreateDeals ?? false,
        canTransferToHuman: data.canTransferToHuman ?? true,
      },
      include: {
        knowledgeBase: {
          select: { id: true, name: true, collectionName: true },
        },
      },
    })
  }

  async updateAgent(id: string, companyId: string, data: UpdateAgentDTO) {
    const agent = await prisma.aIAgent.findFirst({
      where: { id, companyId },
    })

    if (!agent) {
      throw new AppError('Agente nao encontrado', 404, 'NOT_FOUND')
    }

    return prisma.aIAgent.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.provider !== undefined && { provider: data.provider }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.temperature !== undefined && { temperature: data.temperature }),
        ...(data.maxTokens !== undefined && { maxTokens: data.maxTokens }),
        ...(data.systemPrompt !== undefined && { systemPrompt: data.systemPrompt }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.knowledgeBaseId !== undefined && { knowledgeBaseId: data.knowledgeBaseId }),
        ...(data.allowedScopes !== undefined && { allowedScopes: data.allowedScopes }),
        ...(data.canCreateLeads !== undefined && { canCreateLeads: data.canCreateLeads }),
        ...(data.canUpdateLeads !== undefined && { canUpdateLeads: data.canUpdateLeads }),
        ...(data.canCreateDeals !== undefined && { canCreateDeals: data.canCreateDeals }),
        ...(data.canTransferToHuman !== undefined && { canTransferToHuman: data.canTransferToHuman }),
      },
      include: {
        knowledgeBase: {
          select: { id: true, name: true, collectionName: true },
        },
      },
    })
  }

  async deleteAgent(id: string, companyId: string) {
    const agent = await prisma.aIAgent.findFirst({
      where: { id, companyId },
    })

    if (!agent) {
      throw new AppError('Agente nao encontrado', 404, 'NOT_FOUND')
    }

    await prisma.aIAgent.delete({ where: { id } })
    return { success: true }
  }

  // === Query Logs ===

  async logQuery(companyId: string, data: QueryLogDTO) {
    return prisma.aIQueryLog.create({
      data: {
        companyId,
        agentId: data.agentId,
        query: data.query,
        response: data.response,
        context: data.context,
        provider: data.provider,
        model: data.model,
        tokensUsed: data.tokensUsed,
        latencyMs: data.latencyMs,
        source: data.source ?? 'internal',
      },
    })
  }

  async getAnalyticsStats(companyId: string) {
    const [totalQueries, totalDocuments, totalKnowledgeBases, totalAgents, avgLatency] =
      await Promise.all([
        prisma.aIQueryLog.count({ where: { companyId } }),
        prisma.knowledgeDocument.count({
          where: { knowledgeBase: { companyId } },
        }),
        prisma.knowledgeBase.count({ where: { companyId } }),
        prisma.aIAgent.count({ where: { companyId } }),
        prisma.aIQueryLog.aggregate({
          where: { companyId },
          _avg: { latencyMs: true },
        }),
      ])

    return {
      totalQueries,
      totalDocuments,
      totalKnowledgeBases,
      totalAgents,
      avgResponseTime: avgLatency._avg.latencyMs ?? 0,
      queriesByDay: [],
    }
  }

  async getRecentQueries(companyId: string, limit: number = 50) {
    return prisma.aIQueryLog.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        agent: {
          select: { id: true, name: true },
        },
      },
    })
  }
}
