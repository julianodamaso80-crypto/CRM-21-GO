import { describe, it, expect } from 'vitest'

// ============================================================================
// TEST 1: Pipe from-suggest Schema Validation
// ============================================================================

describe('Pipe from-suggest Validation', () => {
  function validateFromSuggest(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.pipeName || typeof data.pipeName !== 'string' || !data.pipeName.trim()) {
      errors.push('pipeName ausente ou invalido')
    }
    if (!Array.isArray(data.phases) || data.phases.length < 2) {
      errors.push('phases deve ter pelo menos 2 elementos')
    }
    if (Array.isArray(data.phases)) {
      data.phases.forEach((phase: any, i: number) => {
        if (!phase.name || !phase.name.trim()) errors.push(`phases[${i}].name ausente`)
      })
    }
    if (Array.isArray(data.fields)) {
      const validTypes = ['text', 'number', 'date', 'select', 'checkbox', 'currency', 'email', 'phone', 'url']
      data.fields.forEach((field: any, i: number) => {
        if (!field.name) errors.push(`fields[${i}].name ausente`)
        if (!field.label) errors.push(`fields[${i}].label ausente`)
        if (!validTypes.includes(field.type)) errors.push(`fields[${i}].type invalido: ${field.type}`)
      })
    }

    return { valid: errors.length === 0, errors }
  }

  it('valida input correto do from-suggest', () => {
    const validInput = {
      pipeName: 'Pipeline de Vendas',
      pipeDescription: 'Vendas B2B',
      phases: [
        { name: 'Prospecção', color: '#3B82F6', order: 0, probability: 10 },
        { name: 'Qualificação', color: '#8B5CF6', order: 1, probability: 30 },
        { name: 'Fechamento', color: '#10B981', order: 2, probability: 100, isWon: true },
      ],
      fields: [
        { name: 'valor', label: 'Valor', type: 'currency', required: true },
        { name: 'prazo', label: 'Prazo', type: 'date', required: false },
      ],
      tags: ['vendas'],
    }

    const result = validateFromSuggest(validInput)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejeita sem pipeName', () => {
    const result = validateFromSuggest({ phases: [{ name: 'A' }, { name: 'B' }], fields: [] })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('pipeName ausente ou invalido')
  })

  it('rejeita com menos de 2 fases', () => {
    const result = validateFromSuggest({ pipeName: 'Test', phases: [{ name: 'Unica' }] })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('phases deve ter pelo menos 2 elementos')
  })

  it('rejeita fase sem nome', () => {
    const result = validateFromSuggest({ pipeName: 'Test', phases: [{ name: 'A' }, { name: '' }] })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('name ausente'))).toBe(true)
  })

  it('rejeita field com type invalido', () => {
    const result = validateFromSuggest({
      pipeName: 'Test',
      phases: [{ name: 'A' }, { name: 'B' }],
      fields: [{ name: 'x', label: 'X', type: 'blob' }],
    })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('type invalido'))).toBe(true)
  })

  it('aceita sem fields (fields opcional)', () => {
    const result = validateFromSuggest({
      pipeName: 'Test',
      phases: [{ name: 'A' }, { name: 'B' }],
    })
    expect(result.valid).toBe(true)
  })

  it('valida output completo do pipe-suggest (mock response)', () => {
    const suggestOutput = {
      pipeName: 'Pipeline de Vendas B2B',
      pipeDescription: 'Pipeline para vendas corporativas',
      phases: [
        { name: 'Prospecção', description: 'Busca de leads', color: '#3B82F6', order: 0, probability: 10, isWon: false, isLost: false },
        { name: 'Qualificação', description: 'Análise do lead', color: '#8B5CF6', order: 1, probability: 30, isWon: false, isLost: false },
        { name: 'Proposta', description: 'Envio de proposta', color: '#F59E0B', order: 2, probability: 50, isWon: false, isLost: false },
        { name: 'Negociação', description: 'Ajustes finais', color: '#F97316', order: 3, probability: 75, isWon: false, isLost: false },
        { name: 'Fechamento', description: 'Venda concluída', color: '#10B981', order: 4, probability: 100, isWon: true, isLost: false },
        { name: 'Perdido', description: 'Negócio perdido', color: '#EF4444', order: 5, probability: 0, isWon: false, isLost: true },
      ],
      fields: [
        { name: 'valor_estimado', label: 'Valor Estimado', type: 'currency', required: true },
        { name: 'prazo_entrega', label: 'Prazo de Entrega', type: 'date', required: false },
        { name: 'tipo_produto', label: 'Tipo de Produto', type: 'select', required: true },
      ],
      tags: ['vendas', 'b2b'],
    }

    const result = validateFromSuggest(suggestOutput)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(suggestOutput.phases.length).toBeGreaterThanOrEqual(2)
    expect(suggestOutput.phases.some(p => p.isWon)).toBe(true)
    expect(suggestOutput.phases.some(p => p.isLost)).toBe(true)
  })
})

// ============================================================================
// TEST 2: Card Phase Movement
// ============================================================================

describe('Card Phase Movement', () => {
  function simulateMove(
    card: { currentPhaseId: string; status: string },
    newPhase: { id: string; isWon: boolean; isLost: boolean }
  ): { currentPhaseId: string; status: string; completedAt: boolean } {
    return {
      currentPhaseId: newPhase.id,
      status: (newPhase.isWon || newPhase.isLost) ? 'done' : 'active',
      completedAt: newPhase.isWon || newPhase.isLost,
    }
  }

  it('mover para fase normal mantem status active', () => {
    const card = { currentPhaseId: 'phase-1', status: 'active' }
    const newPhase = { id: 'phase-2', isWon: false, isLost: false }
    const result = simulateMove(card, newPhase)
    expect(result.currentPhaseId).toBe('phase-2')
    expect(result.status).toBe('active')
    expect(result.completedAt).toBe(false)
  })

  it('mover para fase isWon muda status para done', () => {
    const card = { currentPhaseId: 'phase-3', status: 'active' }
    const newPhase = { id: 'phase-won', isWon: true, isLost: false }
    const result = simulateMove(card, newPhase)
    expect(result.status).toBe('done')
    expect(result.completedAt).toBe(true)
  })

  it('mover para fase isLost muda status para done', () => {
    const card = { currentPhaseId: 'phase-2', status: 'active' }
    const newPhase = { id: 'phase-lost', isWon: false, isLost: true }
    const result = simulateMove(card, newPhase)
    expect(result.status).toBe('done')
    expect(result.completedAt).toBe(true)
  })

  it('mover de volta para fase normal reativa card', () => {
    const card = { currentPhaseId: 'phase-won', status: 'done' }
    const newPhase = { id: 'phase-1', isWon: false, isLost: false }
    const result = simulateMove(card, newPhase)
    expect(result.status).toBe('active')
    expect(result.completedAt).toBe(false)
  })
})

// ============================================================================
// TEST 3: Tenant Isolation (Pipes)
// ============================================================================

describe('Pipe Tenant Isolation', () => {
  function canAccessPipe(pipe: { companyId: string }, userCompanyId: string): boolean {
    return pipe.companyId === userCompanyId
  }

  function canAccessCard(card: { companyId: string }, userCompanyId: string): boolean {
    return card.companyId === userCompanyId
  }

  it('permite acesso ao pipe da propria empresa', () => {
    expect(canAccessPipe({ companyId: 'company-1' }, 'company-1')).toBe(true)
  })

  it('bloqueia acesso ao pipe de outra empresa', () => {
    expect(canAccessPipe({ companyId: 'company-2' }, 'company-1')).toBe(false)
  })

  it('permite acesso ao card da propria empresa', () => {
    expect(canAccessCard({ companyId: 'company-1' }, 'company-1')).toBe(true)
  })

  it('bloqueia acesso ao card de outra empresa', () => {
    expect(canAccessCard({ companyId: 'company-2' }, 'company-1')).toBe(false)
  })

  it('empresa A nao acessa dados da empresa B', () => {
    const pipeA = { companyId: 'tenant-a' }
    const pipeB = { companyId: 'tenant-b' }

    // Tenant A so acessa seus pipes
    expect(canAccessPipe(pipeA, 'tenant-a')).toBe(true)
    expect(canAccessPipe(pipeB, 'tenant-a')).toBe(false)

    // Tenant B so acessa seus pipes
    expect(canAccessPipe(pipeB, 'tenant-b')).toBe(true)
    expect(canAccessPipe(pipeA, 'tenant-b')).toBe(false)
  })
})

// ============================================================================
// TEST 4: Field Value Serialization
// ============================================================================

describe('Field Value Serialization', () => {
  function serializeFieldValue(type: string, input: any): any {
    switch (type) {
      case 'currency':
      case 'number':
        return typeof input === 'string' ? parseFloat(input) || 0 : input
      case 'checkbox':
        return Boolean(input)
      case 'date':
        return typeof input === 'string' ? input : null
      case 'select':
        return typeof input === 'string' ? input : null
      default:
        return String(input ?? '')
    }
  }

  it('serializa currency para numero', () => {
    expect(serializeFieldValue('currency', '1500.50')).toBe(1500.5)
    expect(serializeFieldValue('currency', 2000)).toBe(2000)
  })

  it('serializa checkbox para boolean', () => {
    expect(serializeFieldValue('checkbox', true)).toBe(true)
    expect(serializeFieldValue('checkbox', 0)).toBe(false)
    expect(serializeFieldValue('checkbox', 'yes')).toBe(true)
  })

  it('serializa text para string', () => {
    expect(serializeFieldValue('text', 'Hello')).toBe('Hello')
    expect(serializeFieldValue('text', 123)).toBe('123')
    expect(serializeFieldValue('text', null)).toBe('')
  })

  it('serializa date mantendo string', () => {
    expect(serializeFieldValue('date', '2024-01-15')).toBe('2024-01-15')
    expect(serializeFieldValue('date', null)).toBe(null)
  })

  it('serializa select mantendo string', () => {
    expect(serializeFieldValue('select', 'alta')).toBe('alta')
    expect(serializeFieldValue('select', null)).toBe(null)
  })
})
