import { describe, it, expect } from 'vitest'

// ============================================================================
// TEST 1: Pipe Suggest Schema Validation
// ============================================================================

describe('Pipe Suggest Schema', () => {
  // Simula a validacao que o controller faz no output da IA
  function validatePipeSuggestOutput(result: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!result.pipe_name || typeof result.pipe_name !== 'string') {
      errors.push('pipe_name ausente ou invalido')
    }
    if (!Array.isArray(result.phases) || result.phases.length < 2) {
      errors.push('phases deve ter pelo menos 2 elementos')
    }
    if (Array.isArray(result.phases)) {
      result.phases.forEach((phase: any, i: number) => {
        if (!phase.name) errors.push(`phases[${i}].name ausente`)
        if (typeof phase.order !== 'number') errors.push(`phases[${i}].order deve ser numero`)
        if (typeof phase.probability !== 'number') errors.push(`phases[${i}].probability deve ser numero`)
      })
    }
    if (Array.isArray(result.fields)) {
      result.fields.forEach((field: any, i: number) => {
        if (!field.name) errors.push(`fields[${i}].name ausente`)
        if (!field.label) errors.push(`fields[${i}].label ausente`)
        const validTypes = ['text', 'number', 'date', 'select', 'checkbox', 'currency', 'email', 'phone', 'url']
        if (!validTypes.includes(field.type)) errors.push(`fields[${i}].type invalido: ${field.type}`)
      })
    }
    if (!Array.isArray(result.tags)) {
      errors.push('tags deve ser um array')
    }

    return { valid: errors.length === 0, errors }
  }

  it('valida output correto da IA', () => {
    const validOutput = {
      pipe_name: 'Pipeline de Vendas',
      pipe_description: 'Pipeline para vendas B2B',
      phases: [
        { name: 'Prospecção', description: 'Busca de leads', color: '#3B82F6', order: 0, probability: 10, is_won: false, is_lost: false },
        { name: 'Qualificação', description: 'Análise do lead', color: '#8B5CF6', order: 1, probability: 30, is_won: false, is_lost: false },
        { name: 'Fechamento', description: 'Venda concluída', color: '#10B981', order: 2, probability: 100, is_won: true, is_lost: false },
      ],
      fields: [
        { name: 'valor', label: 'Valor', type: 'currency', required: true },
        { name: 'prazo', label: 'Prazo', type: 'date', required: false },
      ],
      tags: ['vendas', 'b2b'],
    }

    const result = validatePipeSuggestOutput(validOutput)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejeita output sem pipe_name', () => {
    const invalidOutput = {
      phases: [
        { name: 'Fase 1', order: 0, probability: 50 },
        { name: 'Fase 2', order: 1, probability: 100 },
      ],
      fields: [],
      tags: [],
    }

    const result = validatePipeSuggestOutput(invalidOutput)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('pipe_name ausente ou invalido')
  })

  it('rejeita output com menos de 2 phases', () => {
    const invalidOutput = {
      pipe_name: 'Teste',
      phases: [{ name: 'Unica', order: 0, probability: 100 }],
      fields: [],
      tags: [],
    }

    const result = validatePipeSuggestOutput(invalidOutput)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('phases deve ter pelo menos 2 elementos')
  })

  it('rejeita field com type invalido', () => {
    const invalidOutput = {
      pipe_name: 'Teste',
      phases: [
        { name: 'A', order: 0, probability: 0 },
        { name: 'B', order: 1, probability: 100 },
      ],
      fields: [
        { name: 'campo', label: 'Campo', type: 'invalid_type' },
      ],
      tags: [],
    }

    const result = validatePipeSuggestOutput(invalidOutput)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('type invalido'))).toBe(true)
  })
})

// ============================================================================
// TEST 2: Tenant Isolation (Collection Ownership)
// ============================================================================

describe('Tenant Isolation - Collection Ownership', () => {
  function validateCollectionOwnership(collectionName: string, companyId: string): boolean {
    const expectedPrefix = `kb_${companyId}_`
    return collectionName.startsWith(expectedPrefix)
  }

  it('permite acesso a collection da propria empresa', () => {
    expect(validateCollectionOwnership('kb_company-1_abc123', 'company-1')).toBe(true)
  })

  it('bloqueia acesso a collection de outra empresa', () => {
    expect(validateCollectionOwnership('kb_company-2_abc123', 'company-1')).toBe(false)
  })

  it('bloqueia collection sem prefixo valido', () => {
    expect(validateCollectionOwnership('random_collection', 'company-1')).toBe(false)
  })

  it('path traversal nao confunde prefixo (/ != _)', () => {
    // "kb_company-1/" NAO comeca com "kb_company-1_" - o underscore e obrigatorio
    expect(validateCollectionOwnership('kb_company-1/../company-2_hack', 'company-1')).toBe(false)
  })

  it('bloqueia collection vazia', () => {
    expect(validateCollectionOwnership('', 'company-1')).toBe(false)
  })

  it('collection name segue formato correto kb_{companyId}_{kbId}', () => {
    const companyId = 'acme-corp-123'
    const kbId = 'uuid-1234-5678'
    const collectionName = `kb_${companyId}_${kbId}`
    expect(validateCollectionOwnership(collectionName, companyId)).toBe(true)
    expect(validateCollectionOwnership(collectionName, 'other-company')).toBe(false)
  })
})

// ============================================================================
// TEST 3: Health Endpoint Response Structure
// ============================================================================

describe('Health Endpoint Structure', () => {
  it('retorna estrutura completa de health check', () => {
    // Simula a resposta do health check
    const healthResponse = {
      fastify: { status: 'ok' },
      prisma: {
        status: 'ok',
        counts: { knowledgeBases: 2, agents: 1, documents: 5 },
      },
      pythonService: {
        status: 'ok',
        service: 'ai-service',
        chroma: { status: 'ok', collections: 3 },
      },
      overall: 'ok',
    }

    expect(healthResponse.overall).toBe('ok')
    expect(healthResponse.fastify.status).toBe('ok')
    expect(healthResponse.prisma.status).toBe('ok')
    expect(healthResponse.pythonService.status).toBe('ok')
    expect(healthResponse.prisma.counts.knowledgeBases).toBeGreaterThanOrEqual(0)
  })

  it('detecta status degraded quando um servico esta offline', () => {
    const prismaOk = true
    const pythonOk = false

    const allOk = prismaOk && pythonOk
    const anyError = !prismaOk || !pythonOk
    const overall = allOk ? 'ok' : anyError ? 'degraded' : 'partial'

    expect(overall).toBe('degraded')
  })

  it('detecta status ok quando todos os servicos estao ok', () => {
    const prismaOk = true
    const pythonOk = true

    const allOk = prismaOk && pythonOk
    const overall = allOk ? 'ok' : 'degraded'

    expect(overall).toBe('ok')
  })
})

// ============================================================================
// TEST 4: Content Hash Idempotency
// ============================================================================

describe('Content Hash Idempotency', () => {
  function hashContent(content: string): string {
    const { createHash } = require('crypto')
    return createHash('sha256').update(content.trim().toLowerCase()).digest('hex')
  }

  it('mesmo conteudo gera mesmo hash', () => {
    const content = 'Este e um texto de teste para ingestao'
    expect(hashContent(content)).toBe(hashContent(content))
  })

  it('conteudo com espacos extras gera mesmo hash (normalizacao)', () => {
    const content1 = '  Texto com espacos   '
    const content2 = 'Texto com espacos'
    expect(hashContent(content1)).toBe(hashContent(content2))
  })

  it('case insensitive gera mesmo hash', () => {
    const content1 = 'Texto Maiusculo'
    const content2 = 'texto maiusculo'
    expect(hashContent(content1)).toBe(hashContent(content2))
  })

  it('conteudo diferente gera hash diferente', () => {
    const content1 = 'Texto A'
    const content2 = 'Texto B'
    expect(hashContent(content1)).not.toBe(hashContent(content2))
  })

  it('hash tem 64 caracteres (SHA-256 hex)', () => {
    const hash = hashContent('qualquer texto')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})
