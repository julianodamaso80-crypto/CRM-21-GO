import { api } from '../lib/api'
import type {
  KnowledgeBase,
  KnowledgeDocument,
  AIAgent,
  CreateKnowledgeBaseRequest,
  CreateAgentRequest,
  UpdateAgentRequest,
  AIQueryResponse,
  AIAnalyticsStats,
  AIQueryLog,
  PipeSuggestRequest,
  PipeSuggestResponse,
} from '../../../shared/types'

export const aiService = {
  // === Knowledge Bases ===
  async listKnowledgeBases(): Promise<KnowledgeBase[]> {
    const { data } = await api.get('/ai/knowledge-bases')
    return data
  },

  async createKnowledgeBase(body: CreateKnowledgeBaseRequest): Promise<KnowledgeBase> {
    const { data } = await api.post('/ai/knowledge-bases', body)
    return data
  },

  async deleteKnowledgeBase(id: string): Promise<void> {
    await api.delete(`/ai/knowledge-bases/${id}`)
  },

  // === Documents ===
  async listDocuments(kbId: string): Promise<KnowledgeDocument[]> {
    const { data } = await api.get(`/ai/knowledge-bases/${kbId}/documents`)
    return data
  },

  async uploadDocument(_kbId: string, file: File, collectionName: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('collection_name', collectionName)
    const { data } = await api.post('/ai/ingest/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async ingestText(collectionName: string, content: string, sourceName: string): Promise<any> {
    const { data } = await api.post('/ai/ingest/text', {
      collection_name: collectionName,
      content,
      source_name: sourceName,
    })
    return data
  },

  async ingestURL(collectionName: string, url: string, sourceName?: string): Promise<any> {
    const { data } = await api.post('/ai/ingest/url', {
      collection_name: collectionName,
      url,
      source_name: sourceName,
    })
    return data
  },

  async ingestCRM(collectionName: string, dataType: string): Promise<any> {
    const { data } = await api.post('/ai/ingest/crm', {
      collection_name: collectionName,
      data_type: dataType,
    })
    return data
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/ai/documents/${id}`)
  },

  // === Agents ===
  async listAgents(): Promise<AIAgent[]> {
    const { data } = await api.get('/ai/agents')
    return data
  },

  async getAgent(id: string): Promise<AIAgent> {
    const { data } = await api.get(`/ai/agents/${id}`)
    return data
  },

  async createAgent(body: CreateAgentRequest): Promise<AIAgent> {
    const { data } = await api.post('/ai/agents', body)
    return data
  },

  async updateAgent(id: string, body: UpdateAgentRequest): Promise<AIAgent> {
    const { data } = await api.put(`/ai/agents/${id}`, body)
    return data
  },

  async deleteAgent(id: string): Promise<void> {
    await api.delete(`/ai/agents/${id}`)
  },

  // === Query ===
  async query(body: { query: string; collectionName: string; agentId?: string; agent_config?: any }): Promise<AIQueryResponse> {
    const { data } = await api.post('/ai/query', {
      query: body.query,
      collection_name: body.collectionName,
      agent_config: body.agent_config,
    })
    return data
  },

  // === Pipe Builder ===
  async pipeSuggest(body: PipeSuggestRequest): Promise<PipeSuggestResponse> {
    const { data } = await api.post('/ai/pipe-suggest', body)
    return data
  },

  // === Analytics ===
  async getStats(): Promise<AIAnalyticsStats> {
    const { data } = await api.get('/ai/analytics/stats')
    return data
  },

  async getRecentQueries(limit: number = 50): Promise<AIQueryLog[]> {
    const { data } = await api.get('/ai/analytics/queries', { params: { limit } })
    return data
  },
}
