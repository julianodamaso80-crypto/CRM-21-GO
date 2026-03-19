import { FastifyRequest, FastifyReply } from 'fastify'
import { AIService } from './ai.service'
import { AppError } from '../../utils/app-error'
import { env } from '../../config/env'

const aiService = new AIService()

/** Valida que collection_name pertence a empresa do usuario (multi-tenant Fastify-level). */
function validateCollectionOwnership(collectionName: string, companyId: string) {
  if (!collectionName) {
    throw new AppError('collection_name obrigatorio', 400, 'BAD_REQUEST')
  }
  const expectedPrefix = `kb_${companyId}_`
  if (!collectionName.startsWith(expectedPrefix)) {
    throw new AppError('Acesso negado: collection nao pertence a sua empresa', 403, 'FORBIDDEN')
  }
}

export class AIController {
  // === Health Check ===

  async healthCheck(_request: FastifyRequest, reply: FastifyReply) {
    const checks: Record<string, any> = {
      fastify: { status: 'ok' },
      prisma: { status: 'unknown' },
      pythonService: { status: 'unknown' },
      overall: 'unknown',
    }

    // 1) Prisma
    try {
      const { prisma } = await import('../../config/database')
      await prisma.$queryRaw`SELECT 1`
      const kbCount = await prisma.knowledgeBase.count()
      const agentCount = await prisma.aIAgent.count()
      const docCount = await prisma.knowledgeDocument.count()
      checks.prisma = {
        status: 'ok',
        counts: { knowledgeBases: kbCount, agents: agentCount, documents: docCount },
      }
    } catch (err: any) {
      checks.prisma = { status: 'error', detail: err.message }
    }

    // 2) Python AI Service
    const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`${aiServiceUrl}/health`, { signal: controller.signal })
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        checks.pythonService = { status: 'ok', ...data }
      } else {
        checks.pythonService = { status: 'error', httpStatus: res.status }
      }
    } catch (err: any) {
      checks.pythonService = {
        status: 'unreachable',
        detail: err.name === 'AbortError' ? 'timeout (5s)' : err.message,
        url: aiServiceUrl,
      }
    }

    // Overall
    const allOk = checks.prisma.status === 'ok' && checks.pythonService.status === 'ok'
    const anyError = checks.prisma.status === 'error' || checks.pythonService.status === 'error'
    checks.overall = allOk ? 'ok' : anyError ? 'degraded' : 'partial'

    const httpStatus = checks.overall === 'ok' ? 200 : 503
    return reply.status(httpStatus).send(checks)
  }

  // === Knowledge Bases ===

  async listKnowledgeBases(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const knowledgeBases = await aiService.listKnowledgeBases(user.companyId)
    return reply.send(knowledgeBases)
  }

  async createKnowledgeBase(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const data = request.body as { name: string; description?: string }
    const kb = await aiService.createKnowledgeBase(user.companyId, data)
    return reply.status(201).send(kb)
  }

  async deleteKnowledgeBase(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const result = await aiService.deleteKnowledgeBase(id, user.companyId)

    // Deletar collection no Python service
    try {
      await fetch(`${(env as any).AI_SERVICE_URL}/api/collections/${result.collectionName}`, {
        method: 'DELETE',
        headers: { Authorization: request.headers.authorization! },
      })
    } catch {
      // Log mas nao falha se Python service estiver offline
    }

    return reply.send(result)
  }

  // === Documents ===

  async listDocuments(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { kbId } = request.params as { kbId: string }
    const documents = await aiService.listDocuments(kbId, user.companyId)
    return reply.send(documents)
  }

  async deleteDocument(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }

    // Buscar documento antes de deletar para cascade no ChromaDB
    const doc = await aiService.getDocumentForCascade(id, user.companyId)
    const result = await aiService.deleteDocument(id, user.companyId)

    // Cascade: deletar chunks no ChromaDB
    if (doc) {
      try {
        const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'
        await fetch(`${aiServiceUrl}/api/documents`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: request.headers.authorization!,
          },
          body: JSON.stringify({
            collection_name: doc.collectionName,
            document_id: doc.id,
          }),
        })
      } catch {
        // Log mas nao falha se Python service estiver offline
      }

      // Atualizar stats da KB
      await this._decrementKBStats(doc.collectionName, doc.chunkCount)
    }

    return reply.send(result)
  }

  // === Agents ===

  async listAgents(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const agents = await aiService.listAgents(user.companyId)
    return reply.send(agents)
  }

  async getAgentById(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const agent = await aiService.getAgentById(id, user.companyId)
    return reply.send(agent)
  }

  async createAgent(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const data = request.body as any
    const agent = await aiService.createAgent(user.companyId, data)
    return reply.status(201).send(agent)
  }

  async updateAgent(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const data = request.body as any
    const agent = await aiService.updateAgent(id, user.companyId, data)
    return reply.send(agent)
  }

  async deleteAgent(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const result = await aiService.deleteAgent(id, user.companyId)
    return reply.send(result)
  }

  // === Proxy para Python AI Service ===

  async proxyIngestFile(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const body = request.body as any
    const collectionName = body?.collection_name
    validateCollectionOwnership(collectionName, user.companyId)
    const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'

    // 1. Resolver KB e criar documento no Prisma (status: processing)
    const kb = await aiService.findKBByCollection(collectionName, user.companyId)
    let prismaDoc: any = null
    if (kb) {
      prismaDoc = await aiService.createDocument(kb.id, user.companyId, {
        name: body?.source_name || body?.file?.name || 'Upload',
        sourceType: 'pdf',
        fileName: body?.file?.name,
      })
    }

    // 2. Proxy para Python (com document_id do Prisma)
    const response = await fetch(`${aiServiceUrl}/api/ingest/file`, {
      method: 'POST',
      headers: { Authorization: request.headers.authorization! },
      body: request.body as any,
    })
    const result = await response.json()

    // 3. Atualizar status do documento no Prisma
    if (prismaDoc) {
      await this._finalizeDocument(prismaDoc.id, result)
      if (result.success && collectionName) {
        await this._updateKBStats(collectionName, result.chunks_created)
      }
    }

    return reply.status(response.status).send(result)
  }

  async proxyIngestText(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const body = request.body as any
    validateCollectionOwnership(body.collection_name, user.companyId)
    const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'

    // 1. Resolver KB e criar documento no Prisma (status: processing)
    const kb = await aiService.findKBByCollection(body.collection_name, user.companyId)
    let prismaDoc: any = null
    if (kb) {
      // Idempotencia: verificar hash do conteudo
      const contentHash = this._hashContent(body.content)
      const existing = await aiService.findDocumentByHash(kb.id, contentHash)
      if (existing) {
        return reply.send({
          success: true,
          document_id: existing.id,
          chunks_created: existing.chunkCount,
          message: 'Documento ja existe (idempotente)',
          content_hash: contentHash,
          idempotent: true,
        })
      }

      prismaDoc = await aiService.createDocument(kb.id, user.companyId, {
        name: body.source_name || 'Texto',
        sourceType: 'text',
        sourceContent: body.content,
      })
    }

    // 2. Proxy para Python (com document_id do Prisma)
    const payload = { ...body, document_id: prismaDoc?.id }
    const response = await fetch(`${aiServiceUrl}/api/ingest/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.authorization!,
      },
      body: JSON.stringify(payload),
    })
    const result = await response.json()

    // 3. Atualizar status do documento no Prisma
    if (prismaDoc) {
      await this._finalizeDocument(prismaDoc.id, result)
      if (result.success) {
        await this._updateKBStats(body.collection_name, result.chunks_created)
      }
    }

    return reply.status(response.status).send(result)
  }

  async proxyIngestURL(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const body = request.body as any
    validateCollectionOwnership(body.collection_name, user.companyId)
    const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'

    // 1. Resolver KB e criar documento no Prisma
    const kb = await aiService.findKBByCollection(body.collection_name, user.companyId)
    let prismaDoc: any = null
    if (kb) {
      // Idempotencia: verificar se URL ja foi ingerida
      const contentHash = this._hashContent(body.url)
      const existing = await aiService.findDocumentByHash(kb.id, contentHash)
      if (existing) {
        return reply.send({
          success: true,
          document_id: existing.id,
          chunks_created: existing.chunkCount,
          message: 'URL ja foi ingerida (idempotente)',
          content_hash: contentHash,
          idempotent: true,
        })
      }

      prismaDoc = await aiService.createDocument(kb.id, user.companyId, {
        name: body.source_name || body.url,
        sourceType: 'url',
        sourceUrl: body.url,
      })
    }

    // 2. Proxy para Python
    const payload = { ...body, document_id: prismaDoc?.id }
    const response = await fetch(`${aiServiceUrl}/api/ingest/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.authorization!,
      },
      body: JSON.stringify(payload),
    })
    const result = await response.json()

    // 3. Atualizar status
    if (prismaDoc) {
      await this._finalizeDocument(prismaDoc.id, result)
      if (result.success) {
        await this._updateKBStats(body.collection_name, result.chunks_created)
      }
    }

    return reply.status(response.status).send(result)
  }

  async proxyIngestCRM(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const body = request.body as any
    validateCollectionOwnership(body.collection_name, user.companyId)
    const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'

    // 1. Criar documento no Prisma
    const kb = await aiService.findKBByCollection(body.collection_name, user.companyId)
    let prismaDoc: any = null
    if (kb) {
      prismaDoc = await aiService.createDocument(kb.id, user.companyId, {
        name: `CRM - ${body.data_type}`,
        sourceType: `crm_${body.data_type}`,
      })
    }

    // 2. Proxy para Python
    const payload = { ...body, document_id: prismaDoc?.id }
    const response = await fetch(`${aiServiceUrl}/api/ingest/crm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.authorization!,
      },
      body: JSON.stringify(payload),
    })
    const result = await response.json()

    // 3. Atualizar status
    if (prismaDoc) {
      await this._finalizeDocument(prismaDoc.id, result)
      if (result.success) {
        await this._updateKBStats(body.collection_name, result.chunks_created)
      }
    }

    return reply.status(response.status).send(result)
  }

  async proxyQuery(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const body = request.body as any
    validateCollectionOwnership(body.collection_name, user.companyId)
    const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'

    const response = await fetch(`${aiServiceUrl}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.authorization!,
      },
      body: JSON.stringify(body),
    })
    const result = await response.json()

    // Log da query no PostgreSQL
    try {
      await aiService.logQuery(user.companyId, {
        agentId: body.agentId,
        query: body.query,
        response: result.answer || '',
        context: result.sources,
        provider: body.agent_config?.provider || 'openai',
        model: body.agent_config?.model || 'gpt-4o-mini',
        tokensUsed: result.tokens_used,
        latencyMs: result.latency_ms,
        source: 'internal',
      })
    } catch {
      // Nao falha se log der erro
    }

    return reply.status(response.status).send(result)
  }

  // === Pipe Builder ===

  async pipeSuggest(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { promptText: string; templateType?: string }
    const aiServiceUrl = (env as any).AI_SERVICE_URL || 'http://localhost:8100'

    if (!body.promptText || body.promptText.trim().length < 10) {
      throw new AppError('promptText deve ter pelo menos 10 caracteres', 400, 'BAD_REQUEST')
    }

    const response = await fetch(`${aiServiceUrl}/api/pipe-suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.authorization!,
      },
      body: JSON.stringify({
        prompt_text: body.promptText,
        template_type: body.templateType || 'custom',
      }),
    })
    const result = await response.json()

    if (!response.ok) {
      throw new AppError(result.detail || 'Erro ao gerar sugestao de pipe', response.status, 'AI_SERVICE_ERROR')
    }

    // Zod-style validation: garantir estrutura minima
    if (!result.pipe_name || !Array.isArray(result.phases) || result.phases.length < 2) {
      throw new AppError('IA retornou estrutura invalida: faltam pipe_name ou phases', 422, 'INVALID_RESPONSE')
    }

    // Normalizar snake_case -> camelCase para frontend
    return reply.send({
      pipeName: result.pipe_name,
      pipeDescription: result.pipe_description || '',
      phases: (result.phases || []).map((p: any) => ({
        name: p.name,
        description: p.description || '',
        color: p.color || '#6B7280',
        order: p.order ?? 0,
        probability: p.probability ?? 0,
        isWon: p.is_won || false,
        isLost: p.is_lost || false,
      })),
      fields: (result.fields || []).map((f: any) => ({
        name: f.name,
        label: f.label,
        type: f.type || 'text',
        required: f.required || false,
        options: f.options || null,
        description: f.description || null,
      })),
      tags: result.tags || [],
    })
  }

  // === Analytics ===

  async getAnalyticsStats(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const stats = await aiService.getAnalyticsStats(user.companyId)
    return reply.send(stats)
  }

  async getRecentQueries(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const query = request.query as any
    const limit = parseInt(query.limit) || 50
    const queries = await aiService.getRecentQueries(user.companyId, limit)
    return reply.send(queries)
  }

  // === Helpers ===

  private async _finalizeDocument(docId: string, result: any) {
    try {
      if (result.success) {
        await aiService.updateDocumentStatus(docId, 'completed', result.chunks_created)
        // Salvar content_hash no processingMeta
        if (result.content_hash) {
          const { prisma } = await import('../../config/database')
          await prisma.knowledgeDocument.update({
            where: { id: docId },
            data: { processingMeta: { content_hash: result.content_hash } },
          })
        }
      } else {
        await aiService.updateDocumentStatus(docId, 'failed', 0, result.message)
      }
    } catch {
      // Nao falha o request principal
    }
  }

  private async _updateKBStats(collectionName: string, newChunks: number) {
    try {
      const { prisma } = await import('../../config/database')
      await prisma.knowledgeBase.update({
        where: { collectionName },
        data: {
          chunkCount: { increment: newChunks },
          documentCount: { increment: 1 },
        },
      })
    } catch {
      // Ignora se KB nao encontrada
    }
  }

  private async _decrementKBStats(collectionName: string, chunkCount: number) {
    try {
      const { prisma } = await import('../../config/database')
      await prisma.knowledgeBase.update({
        where: { collectionName },
        data: {
          chunkCount: { decrement: chunkCount },
          documentCount: { decrement: 1 },
        },
      })
    } catch {
      // Ignora se KB nao encontrada
    }
  }

  private _hashContent(content: string): string {
    const { createHash } = require('crypto')
    return createHash('sha256').update(content.trim().toLowerCase()).digest('hex')
  }
}
