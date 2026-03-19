import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { aiService } from '../services/ai.service'

// === Knowledge Bases ===

export function useKnowledgeBases() {
  return useQuery({
    queryKey: ['ai', 'knowledge-bases'],
    queryFn: () => aiService.listKnowledgeBases(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiService.createKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'knowledge-bases'] })
      toast.success('Base de conhecimento criada!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar base de conhecimento')
    },
  })
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiService.deleteKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai'] })
      toast.success('Base de conhecimento excluida!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir')
    },
  })
}

// === Documents ===

export function useKnowledgeDocuments(kbId: string) {
  return useQuery({
    queryKey: ['ai', 'documents', kbId],
    queryFn: () => aiService.listDocuments(kbId),
    enabled: !!kbId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ kbId, file, collectionName }: { kbId: string; file: File; collectionName: string }) =>
      aiService.uploadDocument(kbId, file, collectionName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai'] })
      toast.success('Documento enviado para processamento!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar documento')
    },
  })
}

export function useIngestText() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ collectionName, content, sourceName }: { collectionName: string; content: string; sourceName: string }) =>
      aiService.ingestText(collectionName, content, sourceName),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['ai'] })
      toast.success(`Texto ingerido! ${data.chunks_created} chunks criados.`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ingerir texto')
    },
  })
}

export function useIngestURL() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ collectionName, url, sourceName }: { collectionName: string; url: string; sourceName?: string }) =>
      aiService.ingestURL(collectionName, url, sourceName),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['ai'] })
      toast.success(`URL ingerida! ${data.chunks_created} chunks criados.`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ingerir URL')
    },
  })
}

export function useIngestCRM() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ collectionName, dataType }: { collectionName: string; dataType: string }) =>
      aiService.ingestCRM(collectionName, dataType),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['ai'] })
      toast.success(`Dados CRM importados! ${data.chunks_created} chunks criados.`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao importar dados CRM')
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiService.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai'] })
      toast.success('Documento excluido!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir documento')
    },
  })
}

// === Agents ===

export function useAIAgents() {
  return useQuery({
    queryKey: ['ai', 'agents'],
    queryFn: () => aiService.listAgents(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAIAgent(id: string) {
  return useQuery({
    queryKey: ['ai', 'agents', id],
    queryFn: () => aiService.getAgent(id),
    enabled: !!id,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiService.createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'agents'] })
      toast.success('Agente criado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar agente')
    },
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      aiService.updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'agents'] })
      toast.success('Agente atualizado!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar agente')
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: aiService.deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'agents'] })
      toast.success('Agente excluido!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir agente')
    },
  })
}

// === Pipe Builder ===

export function usePipeSuggest() {
  return useMutation({
    mutationFn: aiService.pipeSuggest,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar sugestao de pipe')
    },
  })
}

// === Query (Chat) ===

export function useAIQuery() {
  return useMutation({
    mutationFn: aiService.query,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao consultar IA')
    },
  })
}

// === Analytics ===

export function useAIStats() {
  return useQuery({
    queryKey: ['ai', 'analytics', 'stats'],
    queryFn: () => aiService.getStats(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAIRecentQueries(limit: number = 50) {
  return useQuery({
    queryKey: ['ai', 'analytics', 'queries', limit],
    queryFn: () => aiService.getRecentQueries(limit),
    staleTime: 1000 * 60,
  })
}
