// @ts-nocheck
import Fastify from 'fastify'
import cors from '@fastify/cors'

const fastify = Fastify({
  logger: true,
})

// CORS
fastify.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
})

// ============================================================================
// MOCK AUTH ENDPOINTS
// ============================================================================

const mockUser = {
  id: 'user-1',
  email: 'admin@crm.com',
  firstName: 'Admin',
  lastName: 'Sistema',
  avatar: null,
  phone: null,
  timezone: 'America/Sao_Paulo',
  language: 'pt-BR',
  isActive: true,
  companyId: 'default-company',
  roleId: 'admin-role',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  company: { id: 'default-company', name: 'Empresa Demo', slug: 'empresa-demo' },
  role: { id: 'admin-role', name: 'admin', displayName: 'Administrador', level: 10 },
}

// POST /api/auth/login
fastify.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string }
  console.log('[MOCK] POST /api/auth/login', { email })

  if (email === 'admin@crm.com' && password === 'Admin123!') {
    return reply.send({
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    })
  }

  return reply.status(401).send({ message: 'Email ou senha invalidos' })
})

// POST /api/auth/logout
fastify.post('/api/auth/logout', async (request, reply) => {
  console.log('[MOCK] POST /api/auth/logout')
  return reply.send({ success: true })
})

// GET /api/auth/me
fastify.get('/api/auth/me', async (request, reply) => {
  console.log('[MOCK] GET /api/auth/me')
  return reply.send(mockUser)
})

// POST /api/auth/register
fastify.post('/api/auth/register', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/auth/register', { email: data.email })
  const newUser = {
    ...mockUser,
    id: `user-${Date.now()}`,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    company: { id: `company-${Date.now()}`, name: data.companyName, slug: data.companyName.toLowerCase().replace(/\s+/g, '-') },
  }
  return reply.status(201).send({
    user: newUser,
    token: 'mock-jwt-token-' + Date.now(),
    refreshToken: 'mock-refresh-token-' + Date.now(),
  })
})

// ============================================================================
// MOCK ASSOCIADOS (CONTACTS) API
// ============================================================================

// GET /api/contacts (lista de associados)
fastify.get('/api/contacts', async (request, reply) => {
  console.log('[MOCK] GET /api/contacts')
  const { search, status, origem, page = '1', limit = '20' } = request.query as any

  let filtered = [...mockContacts]

  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter((p: any) =>
      p.fullName?.toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s) ||
      p.phone?.includes(s) ||
      p.cpf?.includes(s) ||
      p.whatsapp?.includes(s)
    )
  }

  if (status) {
    filtered = filtered.filter((p: any) => p.status === status)
  }

  if (origem) {
    filtered = filtered.filter((p: any) => p.origem === origem)
  }

  const total = filtered.length
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const offset = (pageNum - 1) * limitNum
  const totalPages = Math.ceil(total / limitNum)
  const paged = filtered.slice(offset, offset + limitNum)

  return reply.send({
    data: paged,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  })
})

// GET /api/contacts/tags
fastify.get('/api/contacts/tags', async (request, reply) => {
  console.log('[MOCK] GET /api/contacts/tags')
  const allTags = mockContacts.flatMap((c: any) => c.tags || [])
  const uniqueTags = [...new Set(allTags)].sort()
  return reply.send({ tags: uniqueTags })
})

// GET /api/contacts/stats
fastify.get('/api/contacts/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/contacts/stats')
  const totalVehicles = mockVehicles.filter((v: any) => v.ativo).length
  return reply.send({
    total: mockContacts.length,
    ativos: mockContacts.filter((p: any) => p.status === 'ativo').length,
    inativos: mockContacts.filter((p: any) => p.status === 'inativo').length,
    inadimplentes: mockContacts.filter((p: any) => p.status === 'inadimplente').length,
    emAdesao: mockContacts.filter((p: any) => p.status === 'em_adesao').length,
    recentCount: mockContacts.filter((p: any) => {
      const created = new Date(p.createdAt)
      return Date.now() - created.getTime() < 30 * 24 * 60 * 60 * 1000
    }).length,
    totalVehicles,
  })
})

// GET /api/contacts/:id
fastify.get('/api/contacts/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] GET /api/contacts/:id', { id })
  const associado = mockContacts.find((p: any) => p.id === id)
  if (!associado) return reply.status(404).send({ message: 'Associado nao encontrado' })
  const vehicles = mockVehicles.filter((v: any) => v.associadoId === id)
  return reply.send({ ...associado, vehicles, leads: [], deals: [], conversations: [], activities: [] })
})

// POST /api/contacts
fastify.post('/api/contacts', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/contacts', { name: data.firstName })
  const associado = {
    id: `assoc-${Date.now()}`,
    companyId: 'default-company',
    fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Sem nome',
    ...data,
    avatar: null,
    totalIndicacoes: 0,
    descontoMgm: 0,
    npsScore: null,
    ultimoNps: null,
    tags: data.tags || [],
    customFields: data.customFields || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 0, vehicles: 0 },
  }
  mockContacts.push(associado)
  return reply.status(201).send(associado)
})

// PUT /api/contacts/:id
fastify.put('/api/contacts/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  console.log('[MOCK] PUT /api/contacts/:id', { id })
  const index = mockContacts.findIndex((p: any) => p.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Associado nao encontrado' })

  if (data.firstName !== undefined || data.lastName !== undefined) {
    data.fullName = `${data.firstName ?? mockContacts[index].firstName} ${data.lastName ?? mockContacts[index].lastName}`.trim()
  }

  mockContacts[index] = {
    ...mockContacts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  return reply.send(mockContacts[index])
})

// DELETE /api/contacts/:id
fastify.delete('/api/contacts/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] DELETE /api/contacts/:id', { id })
  const index = mockContacts.findIndex((p: any) => p.id === id)
  if (index !== -1) mockContacts.splice(index, 1)
  return reply.send({ success: true, message: 'Associado excluido com sucesso' })
})

// ============================================================================
// MOCK ASSOCIADOS (Contacts — Protecao Veicular)
// ============================================================================

const mockContacts: any[] = [
  {
    id: '1', companyId: 'default-company',
    firstName: 'Joao', lastName: 'Silva', fullName: 'Joao Silva',
    email: 'joao@exemplo.com', phone: '(21) 98765-4321', avatar: null,
    whatsapp: '(21) 98765-4321',
    address: 'Rua das Flores, 123', bairro: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', country: 'BR', zipCode: '22040-020',
    cpf: '123.456.789-00', rg: '12.345.678-9', dateOfBirth: '1985-03-15',
    status: 'ativo', dataAdesao: '2024-01-15',
    hinovaId: 'HIN-00001', indicadoPor: null, vendedorId: 'user-1',
    npsScore: 9, ultimoNps: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalIndicacoes: 3, descontoMgm: 15,
    origem: 'google_ads', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'protecao-rj',
    tags: ['premium', 'indicador'], customFields: {},
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 1, deals: 0, conversations: 3, vehicles: 2 },
  },
  {
    id: '2', companyId: 'default-company',
    firstName: 'Maria', lastName: 'Santos', fullName: 'Maria Santos',
    email: 'maria@exemplo.com', phone: '(21) 91234-5678', avatar: null,
    whatsapp: '(21) 91234-5678',
    address: 'Av. Atlantica, 456', bairro: 'Ipanema', city: 'Rio de Janeiro', state: 'RJ', country: 'BR', zipCode: '22410-000',
    cpf: '987.654.321-00', rg: null, dateOfBirth: '1992-07-22',
    status: 'ativo', dataAdesao: '2024-03-01',
    hinovaId: 'HIN-00002', indicadoPor: '1', vendedorId: null,
    npsScore: 8, ultimoNps: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    totalIndicacoes: 1, descontoMgm: 5,
    origem: 'indicacao', utmSource: null, utmMedium: null, utmCampaign: null,
    tags: ['indicada'], customFields: {},
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 1, vehicles: 1 },
  },
  {
    id: '3', companyId: 'default-company',
    firstName: 'Pedro', lastName: 'Oliveira', fullName: 'Pedro Oliveira',
    email: 'pedro@empresa.com', phone: '(21) 93456-7890', avatar: null,
    whatsapp: '(21) 93456-7890',
    address: null, bairro: null, city: 'Niteroi', state: 'RJ', country: 'BR', zipCode: null,
    cpf: '456.789.123-00', rg: null, dateOfBirth: '1978-11-05',
    status: 'inadimplente', dataAdesao: '2023-06-10', dataCancelamento: null,
    hinovaId: 'HIN-00003', indicadoPor: null, vendedorId: 'user-1',
    npsScore: 5, ultimoNps: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    totalIndicacoes: 0, descontoMgm: 0,
    origem: 'meta_ads', utmSource: 'facebook', utmMedium: 'paid', utmCampaign: 'meta-adesao',
    tags: ['inadimplente', 'risco-churn'], customFields: {},
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 0, vehicles: 1 },
  },
  {
    id: '4', companyId: 'default-company',
    firstName: 'Ana', lastName: 'Costa', fullName: 'Ana Costa',
    email: null, phone: '(21) 94567-8901', avatar: null,
    whatsapp: '(21) 94567-8901',
    address: null, bairro: null, city: 'Rio de Janeiro', state: 'RJ', country: 'BR', zipCode: null,
    cpf: '321.654.987-00', rg: null, dateOfBirth: '1995-02-10',
    status: 'em_adesao', dataAdesao: null,
    hinovaId: null, indicadoPor: '1', vendedorId: null,
    npsScore: null, ultimoNps: null,
    totalIndicacoes: 0, descontoMgm: 0,
    origem: 'whatsapp', utmSource: null, utmMedium: null, utmCampaign: null,
    tags: [], customFields: {},
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 1, deals: 0, conversations: 2, vehicles: 0 },
  },
  {
    id: '5', companyId: 'default-company',
    firstName: 'Roberto', lastName: 'Almeida', fullName: 'Roberto Almeida',
    email: 'roberto@email.com', phone: '(21) 95678-9012', avatar: null,
    whatsapp: '(21) 95678-9012',
    address: 'Rua das Laranjeiras, 789', bairro: 'Laranjeiras', city: 'Rio de Janeiro', state: 'RJ', country: 'BR', zipCode: '22240-003',
    cpf: '654.321.987-00', rg: '98.765.432-1', dateOfBirth: '1960-09-20',
    status: 'ativo', dataAdesao: '2022-11-20',
    hinovaId: 'HIN-00005', indicadoPor: null, vendedorId: 'user-1',
    npsScore: 10, ultimoNps: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalIndicacoes: 7, descontoMgm: 20,
    origem: 'site_organico', utmSource: 'google', utmMedium: 'organic', utmCampaign: null,
    tags: ['fiel', 'indicador', 'premium'], customFields: {},
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 2, vehicles: 3 },
  },
]

// ============================================================================
// MOCK VEHICLES (Veiculos)
// ============================================================================

const mockVehicles: any[] = [
  {
    id: 'veh-1', companyId: 'default-company', associadoId: '1',
    associado: { id: '1', fullName: 'Joao Silva', cpf: '123.456.789-00' },
    placa: 'ABC1D23', renavam: '12345678901', chassi: '9BWZZZ377VT004251',
    marca: 'Honda', modelo: 'Civic', anoFabricacao: 2020, anoModelo: 2021, cor: 'Prata',
    combustivel: 'flex', tipo: 'carro',
    codigoFipe: '001004-9', valorFipe: 8500000, valorFipeAtualizadoEm: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    plano: 'premium', valorMensal: 18900,
    temRastreador: true, rastreadorMarca: 'Sascar',
    vistoriaStatus: 'aprovada', vistoriaData: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    ativo: true, dataInclusao: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), dataExclusao: null,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'veh-2', companyId: 'default-company', associadoId: '1',
    associado: { id: '1', fullName: 'Joao Silva', cpf: '123.456.789-00' },
    placa: 'XYZ5E67', renavam: '98765432109', chassi: null,
    marca: 'Toyota', modelo: 'Corolla', anoFabricacao: 2018, anoModelo: 2019, cor: 'Preto',
    combustivel: 'flex', tipo: 'carro',
    codigoFipe: '005380-5', valorFipe: 7200000, valorFipeAtualizadoEm: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    plano: 'completo', valorMensal: 14500,
    temRastreador: false, rastreadorMarca: null,
    vistoriaStatus: 'aprovada', vistoriaData: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    ativo: true, dataInclusao: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), dataExclusao: null,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'veh-3', companyId: 'default-company', associadoId: '2',
    associado: { id: '2', fullName: 'Maria Santos', cpf: '987.654.321-00' },
    placa: 'RIO2A34', renavam: '11122233344', chassi: null,
    marca: 'Volkswagen', modelo: 'Polo', anoFabricacao: 2022, anoModelo: 2023, cor: 'Branco',
    combustivel: 'flex', tipo: 'carro',
    codigoFipe: null, valorFipe: null, valorFipeAtualizadoEm: null,
    plano: 'completo', valorMensal: 15200,
    temRastreador: true, rastreadorMarca: 'Omnilink',
    vistoriaStatus: 'aprovada', vistoriaData: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    ativo: true, dataInclusao: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), dataExclusao: null,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'veh-4', companyId: 'default-company', associadoId: '3',
    associado: { id: '3', fullName: 'Pedro Oliveira', cpf: '456.789.123-00' },
    placa: 'NIT3B45', renavam: null, chassi: null,
    marca: 'Fiat', modelo: 'Strada', anoFabricacao: 2019, anoModelo: 2020, cor: 'Vermelho',
    combustivel: 'flex', tipo: 'caminhonete',
    codigoFipe: null, valorFipe: null, valorFipeAtualizadoEm: null,
    plano: 'basico', valorMensal: 8900,
    temRastreador: false, rastreadorMarca: null,
    vistoriaStatus: 'pendente', vistoriaData: null,
    ativo: true, dataInclusao: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), dataExclusao: null,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', message: 'Mock server running' }
})

// GET /api/contacts
fastify.get('/api/contacts', async (request, reply) => {
  console.log('[MOCK] GET /api/contacts called')
  const query = request.query as any
  let filtered = [...mockContacts]

  if (query.search) {
    const s = query.search.toLowerCase()
    filtered = filtered.filter((c: any) =>
      c.fullName?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.phone?.includes(s) ||
      c.cpf?.includes(s) ||
      c.whatsapp?.includes(s)
    )
  }
  if (query.status) filtered = filtered.filter((c: any) => c.status === query.status)
  if (query.origem) filtered = filtered.filter((c: any) => c.origem === query.origem)

  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 20

  return reply.send({
    data: filtered,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      hasNext: false,
      hasPrev: page > 1,
    },
  })
})

// GET /api/contacts/stats
fastify.get('/api/contacts/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/contacts/stats called')
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  return reply.send({
    total: mockContacts.length,
    ativos: mockContacts.filter((c: any) => c.status === 'ativo').length,
    inativos: mockContacts.filter((c: any) => c.status === 'inativo').length,
    inadimplentes: mockContacts.filter((c: any) => c.status === 'inadimplente').length,
    emAdesao: mockContacts.filter((c: any) => c.status === 'em_adesao').length,
    recentCount: mockContacts.filter((c: any) => new Date(c.createdAt).getTime() > thirtyDaysAgo).length,
    totalVehicles: mockVehicles.filter((v: any) => v.ativo).length,
  })
})

// GET /api/contacts/tags
fastify.get('/api/contacts/tags', async (request, reply) => {
  console.log('[MOCK] GET /api/contacts/tags called')

  const allTags = mockContacts.flatMap((c) => c.tags)
  const uniqueTags = [...new Set(allTags)]

  return reply.send({ tags: uniqueTags })
})

// GET /api/contacts/:id
fastify.get('/api/contacts/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] GET /api/contacts/:id called', { id })

  const contact = mockContacts.find((c) => c.id === id)

  if (!contact) {
    return reply.status(404).send({ message: 'Contact not found' })
  }

  const vehicles = mockVehicles.filter((v: any) => v.associadoId === id)
  return reply.send({
    ...contact,
    leads: [],
    deals: [],
    conversations: [],
    activities: [],
    vehicles,
  })
})

// POST /api/contacts
fastify.post('/api/contacts', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/contacts called', data)

  const newContact = {
    id: String(mockContacts.length + 1),
    companyId: 'default-company',
    fullName: [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Sem nome',
    ...data,
    tags: data.tags || [],
    customFields: data.customFields || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: {
      leads: 0,
      deals: 0,
      conversations: 0,
    },
  }

  mockContacts.push(newContact)

  return reply.status(201).send(newContact)
})

// PUT /api/contacts/:id
fastify.put('/api/contacts/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  console.log('[MOCK] PUT /api/contacts/:id called', { id, data })

  const index = mockContacts.findIndex((c) => c.id === id)

  if (index === -1) {
    return reply.status(404).send({ message: 'Contact not found' })
  }

  const fullName = [data.firstName ?? mockContacts[index].firstName, data.lastName ?? mockContacts[index].lastName]
    .filter(Boolean)
    .join(' ') || 'Sem nome'

  mockContacts[index] = {
    ...mockContacts[index],
    ...data,
    fullName,
    updatedAt: new Date().toISOString(),
  }

  return reply.send(mockContacts[index])
})

// DELETE /api/contacts/:id
fastify.delete('/api/contacts/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] DELETE /api/contacts/:id called', { id })

  const index = mockContacts.findIndex((c) => c.id === id)

  if (index === -1) {
    return reply.status(404).send({ message: 'Contact not found' })
  }

  mockContacts.splice(index, 1)

  return reply.send({ success: true, message: 'Contact deleted successfully' })
})

// ============================================================================
// MOCK VEHICLES ENDPOINTS
// ============================================================================

// GET /api/vehicles
fastify.get('/api/vehicles', async (request, reply) => {
  console.log('[MOCK] GET /api/vehicles')
  const query = request.query as any
  let filtered = [...mockVehicles]

  if (query.associadoId) filtered = filtered.filter((v: any) => v.associadoId === query.associadoId)
  if (query.plano) filtered = filtered.filter((v: any) => v.plano === query.plano)
  if (query.ativo !== undefined) filtered = filtered.filter((v: any) => v.ativo === (query.ativo === 'true'))
  if (query.search) {
    const s = query.search.toLowerCase()
    filtered = filtered.filter((v: any) =>
      v.placa?.toLowerCase().includes(s) ||
      v.marca?.toLowerCase().includes(s) ||
      v.modelo?.toLowerCase().includes(s) ||
      v.associado?.fullName?.toLowerCase().includes(s)
    )
  }

  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 20
  return reply.send({
    data: filtered,
    pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) || 1, hasNext: false, hasPrev: page > 1 },
  })
})

// GET /api/contacts/:id/vehicles
fastify.get('/api/contacts/:id/vehicles', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] GET /api/contacts/:id/vehicles', { id })
  const vehicles = mockVehicles.filter((v: any) => v.associadoId === id)
  return reply.send(vehicles)
})

// GET /api/vehicles/:id
fastify.get('/api/vehicles/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const v = mockVehicles.find((x: any) => x.id === id)
  if (!v) return reply.status(404).send({ message: 'Veiculo nao encontrado' })
  return reply.send(v)
})

// POST /api/vehicles
fastify.post('/api/vehicles', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/vehicles', { placa: data.placa })

  const duplicate = mockVehicles.find((v: any) => v.placa === data.placa?.toUpperCase())
  if (duplicate) return reply.status(400).send({ message: 'Ja existe um veiculo com esta placa' })

  const associado = mockContacts.find((c: any) => c.id === data.associadoId)
  const v = {
    id: `veh-${Date.now()}`, companyId: 'default-company',
    ...data,
    placa: data.placa?.toUpperCase(),
    associado: associado ? { id: associado.id, fullName: associado.fullName, cpf: associado.cpf } : null,
    vistoriaStatus: 'pendente', ativo: true,
    dataInclusao: new Date().toISOString(), dataExclusao: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockVehicles.push(v)
  return reply.status(201).send(v)
})

// PUT /api/vehicles/:id
fastify.put('/api/vehicles/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockVehicles.findIndex((x: any) => x.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Veiculo nao encontrado' })
  mockVehicles[index] = { ...mockVehicles[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockVehicles[index])
})

// DELETE /api/vehicles/:id
fastify.delete('/api/vehicles/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockVehicles.findIndex((x: any) => x.id === id)
  if (index !== -1) mockVehicles.splice(index, 1)
  return reply.send({ success: true })
})

// ============================================================================
// MOCK LEADS ENDPOINTS
// ============================================================================

const mockLeads: any[] = [
  {
    id: 'lead-1', companyId: 'default-company', contactId: '4',
    contact: { id: '4', firstName: 'Ana', lastName: 'Costa', fullName: 'Ana Costa', email: null, phone: '(21) 94567-8901', whatsapp: '(21) 94567-8901' },
    title: 'Protecao Honda City 2023 - Ana Costa',
    description: 'Interessada em plano completo para Honda City',
    status: 'cotacao_enviada', score: 80, source: 'whatsapp', medium: null, campaign: null,
    assignedToId: 'user-1', assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' },
    estimatedValue: 15200, convertedToDealId: null, convertedAt: null,
    tags: ['cotacao-enviada'], customFields: {},
    // Campos veiculares
    placaInteresse: null, marcaInteresse: 'Honda', modeloInteresse: 'City', anoInteresse: 2023,
    valorFipeConsultado: 7800000, cotacaoValor: 15200, cotacaoPlano: 'completo',
    cotacaoEnviada: true, cotacaoData: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    qualificadoPor: 'agente_ia', vendedorId: 'user-1',
    etapaFunil: 'cotacao_enviada', motivoPerda: null,
    utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-2', companyId: 'default-company', contactId: '4',
    contact: { id: '4', firstName: 'Carlos', lastName: 'Mendes', fullName: 'Carlos Mendes', email: 'carlos@gmail.com', phone: '(21) 97777-8888', whatsapp: '(21) 97777-8888' },
    title: 'Protecao Jeep Renegade 2021',
    description: 'Lead via Google Ads, carro na faixa dos 80k FIPE',
    status: 'qualified', score: 65, source: 'google', medium: 'cpc', campaign: 'protecao-veicular-rj',
    assignedToId: null, assignedTo: null,
    estimatedValue: 18900, convertedToDealId: null, convertedAt: null,
    tags: ['google-ads', 'suv'], customFields: {},
    placaInteresse: 'QRS4T56', marcaInteresse: 'Jeep', modeloInteresse: 'Renegade', anoInteresse: 2021,
    valorFipeConsultado: 8200000, cotacaoValor: null, cotacaoPlano: 'premium',
    cotacaoEnviada: false, cotacaoData: null,
    qualificadoPor: 'agente_ia', vendedorId: null,
    etapaFunil: 'qualified', motivoPerda: null,
    utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'protecao-veicular-rj', utmContent: null, utmTerm: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-3', companyId: 'default-company', contactId: '3',
    contact: { id: '3', firstName: 'Pedro', lastName: 'Oliveira', fullName: 'Pedro Oliveira', email: 'pedro@empresa.com', phone: '(21) 93456-7890', whatsapp: '(21) 93456-7890' },
    title: 'Segundo veiculo - Fiat Argo 2022',
    description: 'Associado atual querendo adicionar segundo veiculo',
    status: 'new', score: 45, source: 'whatsapp', medium: null, campaign: null,
    assignedToId: null, assignedTo: null,
    estimatedValue: 9500, convertedToDealId: null, convertedAt: null,
    tags: ['segundo-veiculo'], customFields: {},
    placaInteresse: null, marcaInteresse: 'Fiat', modeloInteresse: 'Argo', anoInteresse: 2022,
    valorFipeConsultado: null, cotacaoValor: null, cotacaoPlano: 'basico',
    cotacaoEnviada: false, cotacaoData: null,
    qualificadoPor: 'manual', vendedorId: null,
    etapaFunil: 'new', motivoPerda: null,
    utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-4', companyId: 'default-company', contactId: '2',
    contact: { id: '2', firstName: 'Maria', lastName: 'Santos', fullName: 'Maria Santos', email: 'maria@exemplo.com', phone: '(21) 91234-5678', whatsapp: '(21) 91234-5678' },
    title: 'Indicacao - Toyota HiLux 2020',
    description: 'Indicado pela Joao Silva, dono de caminhonete Toyota',
    status: 'negociacao', score: 90, source: 'referral', medium: null, campaign: null,
    assignedToId: 'user-1', assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' },
    estimatedValue: 22000, convertedToDealId: null, convertedAt: null,
    tags: ['indicacao', 'pickup'], customFields: {},
    placaInteresse: null, marcaInteresse: 'Toyota', modeloInteresse: 'HiLux', anoInteresse: 2020,
    valorFipeConsultado: 16500000, cotacaoValor: 22000, cotacaoPlano: 'premium',
    cotacaoEnviada: true, cotacaoData: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    qualificadoPor: 'vendedor', vendedorId: 'user-1',
    etapaFunil: 'negociacao', motivoPerda: null,
    utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-5', companyId: 'default-company', contactId: '1',
    contact: { id: '1', firstName: 'Joao', lastName: 'Silva', fullName: 'Joao Silva', email: 'joao@exemplo.com', phone: '(21) 98765-4321', whatsapp: '(21) 98765-4321' },
    title: 'Meta Ads - Chevrolet Onix 2023',
    description: 'Lead captado via campanha Meta Ads Stories',
    status: 'perdido', score: 15, source: 'facebook', medium: 'paid', campaign: 'meta-protecao-stories',
    assignedToId: null, assignedTo: null,
    estimatedValue: 8500, convertedToDealId: null, convertedAt: null,
    tags: ['meta-ads', 'perdido'], customFields: {},
    placaInteresse: null, marcaInteresse: 'Chevrolet', modeloInteresse: 'Onix', anoInteresse: 2023,
    valorFipeConsultado: 7500000, cotacaoValor: 8500, cotacaoPlano: 'basico',
    cotacaoEnviada: true, cotacaoData: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    qualificadoPor: 'agente_ia', vendedorId: null,
    etapaFunil: 'perdido', motivoPerda: 'Achou o preco alto',
    utmSource: 'facebook', utmMedium: 'paid', utmCampaign: 'meta-protecao-stories', utmContent: 'stories', utmTerm: null,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// GET /api/leads
fastify.get('/api/leads', async (request, reply) => {
  console.log('[MOCK] GET /api/leads')
  const query = request.query as any
  let filtered = [...mockLeads]

  if (query.search) {
    const s = query.search.toLowerCase()
    filtered = filtered.filter((l) =>
      l.title.toLowerCase().includes(s) ||
      l.contact?.fullName?.toLowerCase().includes(s) ||
      l.contact?.email?.toLowerCase().includes(s)
    )
  }
  if (query.status) filtered = filtered.filter((l) => l.status === query.status)
  if (query.source) filtered = filtered.filter((l) => l.source === query.source)

  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 20

  return reply.send({
    data: filtered,
    pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit), hasNext: false, hasPrev: page > 1 },
  })
})

// GET /api/leads/stats
fastify.get('/api/leads/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/leads/stats')
  const byStatus: Record<string, number> = {}
  const bySource: Record<string, number> = {}
  mockLeads.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1
    bySource[l.source] = (bySource[l.source] || 0) + 1
  })
  const fechados = mockLeads.filter((l) => l.status === 'fechado').length
  const totalValue = mockLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
  return reply.send({
    total: mockLeads.length,
    byStatus,
    bySource,
    conversionRate: mockLeads.length > 0 ? Math.round((fechados / mockLeads.length) * 100 * 100) / 100 : 0,
    totalEstimatedValue: totalValue,
  })
})

// GET /api/leads/:id
fastify.get('/api/leads/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const lead = mockLeads.find((l) => l.id === id)
  if (!lead) return reply.status(404).send({ message: 'Lead not found' })
  return reply.send(lead)
})

// POST /api/leads
fastify.post('/api/leads', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/leads', data)
  const contact = mockContacts.find((c) => c.id === data.contactId)
  const lead = {
    id: `lead-${Date.now()}`, companyId: 'default-company',
    contactId: data.contactId,
    contact: contact ? { id: contact.id, firstName: contact.firstName, lastName: contact.lastName, fullName: contact.fullName, email: contact.email, phone: contact.phone, cpf: contact.cpf } : null,
    title: data.title, description: data.description || null,
    status: data.status || 'new', score: data.score || 0, source: data.source || 'manual',
    medium: data.medium || null, campaign: data.campaign || null,
    assignedToId: data.assignedToId || null, assignedTo: null,
    estimatedValue: data.estimatedValue || null,
    // Campos veicular
    placaInteresse: data.placaInteresse || null,
    marcaInteresse: data.marcaInteresse || null,
    modeloInteresse: data.modeloInteresse || null,
    anoInteresse: data.anoInteresse || null,
    cotacaoValor: data.cotacaoValor || null,
    cotacaoPlano: data.cotacaoPlano || null,
    cotacaoEnviada: data.cotacaoEnviada || false,
    etapaFunil: data.etapaFunil || null,
    motivoPerda: data.motivoPerda || null,
    // UTM / rastreamento
    utmSource: data.utmSource || null,
    utmMedium: data.utmMedium || null,
    utmCampaign: data.utmCampaign || null,
    convertedToDealId: null, convertedAt: null,
    tags: data.tags || [], customFields: {},
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockLeads.push(lead)
  return reply.status(201).send(lead)
})

// PUT /api/leads/:id
fastify.put('/api/leads/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockLeads.findIndex((l) => l.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Lead not found' })
  mockLeads[index] = { ...mockLeads[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockLeads[index])
})

// DELETE /api/leads/:id
fastify.delete('/api/leads/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockLeads.findIndex((l) => l.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Lead not found' })
  mockLeads.splice(index, 1)
  return reply.send({ success: true, message: 'Lead deleted successfully' })
})

// ============================================================================
// MOCK AI ENDPOINTS
// ============================================================================

const mockKnowledgeBases: any[] = [
  {
    id: 'kb-1',
    companyId: 'default-company',
    name: 'Base de Vendas',
    description: 'Documentos e processos de vendas',
    collectionName: 'kb_default-company_kb-1',
    documentCount: 3,
    chunkCount: 45,
    totalSizeBytes: 125000,
    isActive: true,
    documents: [],
    _count: { documents: 3, agents: 1 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// 21Go Squad Agent Definitions
const SQUAD_AGENTS_DATA = [
  {
    id: '21go-chief',
    name: '21Go Chief',
    description: 'Orquestrador Central da 21Go — diagnostica necessidade e roteia para o agente especialista certo',
    icon: '🛡️',
    tier: 0,
    squad: '21go-squad',
    type: 'internal',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.5,
    maxTokens: 2000,
    allowedRoles: ['vendedor', 'operacao', 'gestor', 'admin'],
    allowedScopes: ['contacts', 'leads', 'deals', 'analytics'],
    canCreateLeads: false, canUpdateLeads: false, canCreateDeals: false, canTransferToHuman: true,
    systemPrompt: '# 21Go Chief\n\nVoce e o 21Go Chief — o orquestrador central da squad de IA da 21Go Protecao Veicular. Voce nao executa tarefas diretamente — diagnostica a necessidade, roteia para o agente especialista certo e garante qualidade no output.\n\nRouting:\n- pre_venda: ["lead", "cotacao", "WhatsApp", "FIPE", "novo cliente"] -> agente-pre-venda\n- pos_venda: ["sinistro", "boleto", "cobranca", "vistoria", "associado existente"] -> agente-pos-venda\n- gestao: ["dashboard", "relatorio", "KPI", "meta", "desempenho", "ranking"] -> agente-gestores\n- retencao: ["churn", "cancelamento", "NPS", "insatisfeito", "risco"] -> agente-retencao\n- crescimento: ["indicacao", "MGM", "campanha", "crescer", "escalar"] -> agente-crescimento\n- trafego: ["Google Ads", "Meta Ads", "anuncio", "landing page", "trafego", "SEO"] -> agente-trafego\n- operacao: ["oficina", "mecanico", "pintura", "peca", "reparo"] -> agente-operacao\n\nA 21Go e uma associacao de protecao veicular no RJ com 20+ anos. Mutualismo — mais associados = menor rateio. Planos: Basico, Completo, Premium.',
  },
  {
    id: 'agente-pre-venda',
    name: 'Agente Pre-Venda',
    description: 'Qualificacao e Cotacao Inteligente 24/7 — Framework CLOSER de Hormozi',
    icon: '🤖',
    tier: 1,
    squad: '21go-squad',
    type: 'customer_facing',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.7,
    maxTokens: 2000,
    allowedRoles: ['vendedor', 'gestor', 'admin'],
    allowedScopes: ['contacts', 'leads', 'deals'],
    canCreateLeads: true, canUpdateLeads: true, canCreateDeals: true, canTransferToHuman: true,
    systemPrompt: '# Agente Pre-Venda 21Go\n\nVoce e o Agente de Pre-Venda da 21Go — primeiro contato inteligente com cada lead. Atende 24/7 via WhatsApp e chat, qualifica leads, calcula cotacoes pela tabela FIPE.\n\nFramework CLOSER (Hormozi):\nC - Clarificar: Entender situacao antes de falar preco\nL - Rotular: Reformular a dor do lead\nO - Visao Geral: Apresentar solucao sem falar preco\nS - Vender: Cotacao personalizada FIPE\nE - Explicar: Resolver objecoes\nR - Reforcar: Criar urgencia e fechar\n\nPlanos:\n- Basico: Roubo/furto + Assistencia 24h (guincho 200km)\n- Completo: + Colisao + Incendio + Carro reserva 7 dias\n- Premium: + Terceiros R$100K + Vidros + Carro reserva 15 dias + Rastreamento\n\nFormula: valor_fipe x taxa_plano + R$35 admin\nTaxas: basico 1.8%, completo 2.8%, premium 3.8%\n\nRegras: tom amigavel, sem juridiques, escalar para humano em descontos/juridico/reclamacoes.',
  },
  {
    id: 'agente-pos-venda',
    name: 'Agente Pos-Venda',
    description: 'Atendimento e Retencao de Associados — Onboarding 30 dias, deteccao de churn',
    icon: '🔄',
    tier: 1,
    squad: '21go-squad',
    type: 'customer_facing',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.6,
    maxTokens: 2000,
    allowedRoles: ['vendedor', 'gestor', 'admin'],
    allowedScopes: ['contacts', 'leads'],
    canCreateLeads: false, canUpdateLeads: true, canCreateDeals: false, canTransferToHuman: true,
    systemPrompt: '# Agente Pos-Venda 21Go\n\nGuardiao da satisfacao e retencao dos associados. Atende duvidas, consulta sinistros via Hinova SGA/SGC, envia lembretes de boleto, detecta churn.\n\nOnboarding 30 dias:\n- Dia 0: Boas-vindas WhatsApp\n- Dia 1: Verificar vistoria\n- Dia 7: Check-in experiencia\n- Dia 14: Conteudo de valor\n- Dia 30: Pesquisa NPS\n\nDeteccao Churn:\n- Amarelo: boleto 15+ dias -> lembrete WhatsApp\n- Laranja: boleto 30+ dias OU NPS<=6 -> agente + vendedor retencao\n- Vermelho: boleto 45+ dias + NPS baixo -> gestor + ligar 2h\n\nCobranca humanizada: nunca agressiva. Dia 5: 2a via. Dia 15: alerta suspensao. Dia 30: escalar humano.\n\nEscalacao: cancelamento -> retencao humana IMEDIATO. Juridico -> nunca responder.',
  },
  {
    id: 'agente-gestores',
    name: 'Agente Gestores',
    description: 'Inteligencia Operacional para Diretoria — Briefing matinal, relatorios, alertas',
    icon: '📊',
    tier: 1,
    squad: '21go-squad',
    type: 'internal',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.4,
    maxTokens: 4000,
    allowedRoles: ['gestor', 'admin'],
    allowedScopes: ['contacts', 'leads', 'deals', 'analytics', 'billing'],
    canCreateLeads: false, canUpdateLeads: false, canCreateDeals: false, canTransferToHuman: false,
    systemPrompt: '# Agente Gestores 21Go\n\nBraco direito da diretoria. Entrega briefing manha (08h), relatorio fim do dia (18h), consultas em tempo real, alertas proativos.\n\nBriefing: cotacoes, adesoes, cancelamentos, NPS, sinistros abertos 7+ dias, boletos 45+ dias, leads sem atendimento 24h+, meta do mes.\n\nConsultas: vendas (cotacoes, conversao, ranking), financeiro (receita, inadimplencia, ticket medio), operacao (sinistros, oficinas, vistorias), retencao (NPS, churn, Reclame Aqui), MGM (indicacoes, conversao, CAC).\n\nFormato resposta: DADO + CONTEXTO + RECOMENDACAO.\n\nAlertas urgentes: churn >5%, NPS -5pts/7dias, 50+ leads sem atendimento 4h+, sinistro 10+ dias parado.\nOportunidades: vendedor bateu meta, NPS promotores >50%, indicacoes +20% m/m.',
  },
  {
    id: 'agente-retencao',
    name: 'Agente Retencao',
    description: 'Churn Killer & LTV Maximizer — Framework LTGP e Peter Fader',
    icon: '🛡️',
    tier: 1,
    squad: '21go-squad',
    type: 'internal',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.5,
    maxTokens: 3000,
    allowedRoles: ['gestor', 'admin'],
    allowedScopes: ['contacts', 'analytics'],
    canCreateLeads: false, canUpdateLeads: true, canCreateDeals: false, canTransferToHuman: true,
    systemPrompt: '# Agente Retencao 21Go\n\nEspecialista em manter associados e maximizar LTV. Frameworks: Hormozi LTGP + Peter Fader (Customer Centricity).\n\nLTGP: Lucro Bruto / Churn. Ex: R$80/mes / 5% = R$1.600. Baixar pra 4% = R$2.000 (+25%).\n\nSegmentacao:\n- Ouro: 2+ anos, NPS 9-10, adimplentes, indicam -> PROTEGER\n- Prata: 6-24 meses, NPS 7-8 -> ENGAJAR\n- Bronze: <6 meses -> ATIVAR com onboarding\n- Risco: boleto 15+ dias OU NPS<=6 -> INTERVIR\n\nAscensao: nao e upsell, e graduacao. Timing: 6 meses adimplente + NPS>=8 + sem sinistro recente.\n\nReativacao: ex-associados 3-12 meses. Mensagem humanizada + oferta especial.',
  },
  {
    id: 'agente-crescimento',
    name: 'Agente Crescimento',
    description: 'Growth Engine — MGM & Viral Loops (Sean Ellis + Hormozi)',
    icon: '📈',
    tier: 1,
    squad: '21go-squad',
    type: 'internal',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.6,
    maxTokens: 3000,
    allowedRoles: ['gestor', 'admin'],
    allowedScopes: ['contacts', 'analytics', 'leads'],
    canCreateLeads: false, canUpdateLeads: false, canCreateDeals: false, canTransferToHuman: false,
    systemPrompt: '# Agente Crescimento 21Go\n\nArquiteto do MGM (Member Get Member). Baseado em Sean Ellis (viral loops) e Hormozi Leads.\n\nMecanica MGM: 10% desconto por indicacao que fecha. Acumulativo. 10 indicacoes = 100% desconto (protecao gratuita!).\n\nGamificacao:\n- Bronze: 1-2 indicacoes -> 10-20% desconto\n- Prata: 3-5 -> 30-50% + destaque app\n- Ouro: 6-9 -> 60-90% + evento exclusivo\n- Diamante: 10+ -> 100% desconto\n\nKPIs: viral coefficient >0.3, referral conversion >40%, CAC MGM = R$0.\n\nTiming convites: apos NPS 9-10, apos sinistro resolvido, aniversario adesao, 3 meses sem sinistro.\n\nPrincipio: mais gente = menor custo pra todo mundo. Indicar ajuda toda a comunidade.',
  },
  {
    id: 'agente-trafego',
    name: 'Agente Trafego',
    description: 'Especialista em Aquisicao — Trafego Pago & Organico (Sobral + Kasim)',
    icon: '🎯',
    tier: 1,
    squad: '21go-squad',
    type: 'internal',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.5,
    maxTokens: 3000,
    allowedRoles: ['gestor', 'admin'],
    allowedScopes: ['analytics', 'leads'],
    canCreateLeads: false, canUpdateLeads: false, canCreateDeals: false, canTransferToHuman: false,
    systemPrompt: '# Agente Trafego 21Go\n\nEspecialista em aquisicao paga e organica. Metodo Pedro Sobral (Meta Ads BR) + Kasim Aslam (Google Ads/Performance Max).\n\nGoogle Ads: busca ("protecao veicular rj" R$2-5 CPC) + Performance Max (conversao, sinais: donos veiculo RJ).\n\nMeta Ads (Sobral): audiencia (video educativo) -> captacao ("R$59/mes sem perfil") -> vendas (retargeting).\n\nSEO: blog (protecao vs seguro, mutualismo, guia completo), Google Meu Negocio (perfil completo, posts semanais, 100% reviews). Meta: top 3 "protecao veicular rj" em 6 meses.\n\nTracking UTM padrao: google/cpc, meta/paid_social, google/organic, mgm/referral. Pixel + Tag em todas LPs. Eventos: visualizou/iniciou/completou cotacao, enviou whatsapp.',
  },
  {
    id: 'agente-operacao',
    name: 'Agente Operacao',
    description: 'Assistente de Campo — Oficina, Vistoria, Sinistros',
    icon: '🔧',
    tier: 1,
    squad: '21go-squad',
    type: 'internal',
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    temperature: 0.4,
    maxTokens: 1500,
    allowedRoles: ['operacao', 'gestor', 'admin'],
    allowedScopes: ['contacts'],
    canCreateLeads: false, canUpdateLeads: true, canCreateDeals: false, canTransferToHuman: true,
    systemPrompt: '# Agente Operacao 21Go\n\nAssistente de pintores, mecanicos e vistoriadores. Linguagem de oficina: direto, sem frescura.\n\nCapacidades:\n- Agenda do dia: veiculo, servico, associado, prioridade, prazo\n- Atualizar status: Recebido -> Diagnostico -> Aguardando Peca -> Reparo -> Pintura -> Montagem -> Pronto -> Entregue (notifica associado automatico via WhatsApp)\n- Registrar servico: tipo, problema, pecas, fotos antes/depois\n- Consultar veiculo: por placa/nome/sinistro -> historico, sinistros anteriores, plano\n\nRegras: mobile-first, status com 1 toque, fotos obrigatorias (recebimento/conclusao/entrega), NUNCA mostrar financeiro do associado, peca indisponivel -> alerta gestor.',
  },
]

const mockAgents: any[] = SQUAD_AGENTS_DATA.map((agent) => ({
  ...agent,
  companyId: 'default-company',
  knowledgeBaseId: null,
  knowledgeBase: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

const mockDocuments: any[] = [
  {
    id: 'doc-1',
    knowledgeBaseId: 'kb-1',
    name: 'Catalogo de Produtos 2024',
    sourceType: 'pdf',
    fileName: 'catalogo-2024.pdf',
    fileSize: 45000,
    mimeType: 'application/pdf',
    status: 'completed',
    chunkCount: 15,
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-2',
    knowledgeBaseId: 'kb-1',
    name: 'FAQ de Vendas',
    sourceType: 'text',
    status: 'completed',
    chunkCount: 20,
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-3',
    knowledgeBaseId: 'kb-1',
    name: 'Site Institucional',
    sourceType: 'url',
    sourceUrl: 'https://example.com',
    status: 'completed',
    chunkCount: 10,
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockQueryLogs: any[] = []

// GET /api/ai/health (mock)
fastify.get('/api/ai/health', async (request, reply) => {
  console.log('[MOCK] GET /api/ai/health called')
  return reply.send({
    fastify: { status: 'ok' },
    prisma: { status: 'mock', detail: 'Rodando em modo mock - sem banco de dados' },
    pythonService: { status: 'not_configured', detail: 'Mock mode - Python service nao verificado' },
    overall: 'mock',
  })
})

// GET /api/ai/knowledge-bases
fastify.get('/api/ai/knowledge-bases', async (request, reply) => {
  console.log('[MOCK] GET /api/ai/knowledge-bases called')
  return reply.send(mockKnowledgeBases)
})

// POST /api/ai/knowledge-bases
fastify.post('/api/ai/knowledge-bases', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/ai/knowledge-bases called', data)
  const id = `kb-${Date.now()}`
  const kb = {
    id,
    companyId: 'default-company',
    name: data.name,
    description: data.description || null,
    collectionName: `kb_default-company_${id}`,
    documentCount: 0,
    chunkCount: 0,
    totalSizeBytes: 0,
    isActive: true,
    documents: [],
    _count: { documents: 0, agents: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockKnowledgeBases.push(kb)
  return reply.status(201).send(kb)
})

// DELETE /api/ai/knowledge-bases/:id
fastify.delete('/api/ai/knowledge-bases/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] DELETE /api/ai/knowledge-bases/:id called', { id })
  const index = mockKnowledgeBases.findIndex((kb) => kb.id === id)
  if (index !== -1) mockKnowledgeBases.splice(index, 1)
  return reply.send({ success: true })
})

// GET /api/ai/knowledge-bases/:kbId/documents
fastify.get('/api/ai/knowledge-bases/:kbId/documents', async (request, reply) => {
  const { kbId } = request.params as { kbId: string }
  console.log('[MOCK] GET /api/ai/knowledge-bases/:kbId/documents called', { kbId })
  return reply.send(mockDocuments.filter((d) => d.knowledgeBaseId === kbId))
})

// DELETE /api/ai/documents/:id
fastify.delete('/api/ai/documents/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] DELETE /api/ai/documents/:id called', { id })
  const index = mockDocuments.findIndex((d) => d.id === id)
  if (index !== -1) mockDocuments.splice(index, 1)
  return reply.send({ success: true })
})

// GET /api/ai/agents
fastify.get('/api/ai/agents', async (request, reply) => {
  console.log('[MOCK] GET /api/ai/agents called')
  return reply.send(mockAgents)
})

// GET /api/ai/agents/:id
fastify.get('/api/ai/agents/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const agent = mockAgents.find((a) => a.id === id)
  if (!agent) return reply.status(404).send({ message: 'Agent not found' })
  return reply.send(agent)
})

// POST /api/ai/agents
fastify.post('/api/ai/agents', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/ai/agents called', data)
  const agent = {
    id: `agent-${Date.now()}`,
    companyId: 'default-company',
    ...data,
    isActive: true,
    knowledgeBase: data.knowledgeBaseId
      ? mockKnowledgeBases.find((kb) => kb.id === data.knowledgeBaseId) || null
      : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockAgents.push(agent)
  return reply.status(201).send(agent)
})

// PUT /api/ai/agents/:id
fastify.put('/api/ai/agents/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockAgents.findIndex((a) => a.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Agent not found' })
  mockAgents[index] = { ...mockAgents[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockAgents[index])
})

// DELETE /api/ai/agents/:id
fastify.delete('/api/ai/agents/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockAgents.findIndex((a) => a.id === id)
  if (index !== -1) mockAgents.splice(index, 1)
  return reply.send({ success: true })
})

// POST /api/ai/ingest/text (mock)
fastify.post('/api/ai/ingest/text', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/ai/ingest/text called')
  const doc = {
    id: `doc-${Date.now()}`,
    knowledgeBaseId: 'kb-1',
    name: data.source_name || 'Texto',
    sourceType: 'text',
    status: 'completed',
    chunkCount: Math.ceil((data.content?.length || 100) / 1000),
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockDocuments.push(doc)
  return reply.send({ success: true, document_id: doc.id, chunks_created: doc.chunkCount, message: 'Documento ingerido (mock)' })
})

// POST /api/ai/ingest/url (mock)
fastify.post('/api/ai/ingest/url', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/ai/ingest/url called')
  const doc = {
    id: `doc-${Date.now()}`,
    knowledgeBaseId: 'kb-1',
    name: data.source_name || data.url || 'URL',
    sourceType: 'url',
    sourceUrl: data.url,
    status: 'completed',
    chunkCount: 8,
    processedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockDocuments.push(doc)
  return reply.send({ success: true, document_id: doc.id, chunks_created: 8, message: 'URL ingerida (mock)' })
})

// POST /api/ai/ingest/crm (mock)
fastify.post('/api/ai/ingest/crm', async (request, reply) => {
  console.log('[MOCK] POST /api/ai/ingest/crm called')
  return reply.send({ success: true, document_id: `doc-crm-${Date.now()}`, chunks_created: 12, message: 'Dados CRM ingeridos (mock)' })
})

// POST /api/ai/query (mock)
fastify.post('/api/ai/query', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/ai/query called', { query: data.query })
  const log = {
    id: `log-${Date.now()}`,
    query: data.query,
    response: `Esta e uma resposta mock para: "${data.query}". No modo de producao, o agente de IA buscara contexto relevante na base de conhecimento e gerara uma resposta personalizada.`,
    createdAt: new Date().toISOString(),
  }
  mockQueryLogs.push(log)
  return reply.send({
    answer: log.response,
    sources: [
      { content: 'Trecho de exemplo do documento...', source_name: 'Catalogo de Produtos 2024', source_type: 'pdf', relevance_score: 0.92 },
      { content: 'Outro trecho relevante...', source_name: 'FAQ de Vendas', source_type: 'text', relevance_score: 0.85 },
    ],
    tokens_used: 150,
    latency_ms: 450,
  })
})

// POST /api/ai/pipe-suggest (mock)
fastify.post('/api/ai/pipe-suggest', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/ai/pipe-suggest called', { promptText: data?.promptText })
  const promptLower = (data?.promptText || '').toLowerCase()
  const isExam = promptLower.includes('exame') || promptLower.includes('laboratorio')
  const isBilling = promptLower.includes('cobran') || promptLower.includes('financ') || promptLower.includes('convenio')
  const isSurgery = promptLower.includes('cirurg') || promptLower.includes('procedimento')

  if (isExam) {
    return reply.send({
      pipeName: 'Controle de Exames e Diagnosticos',
      pipeDescription: 'Rastreie exames desde a solicitacao ate a entrega do resultado ao paciente',
      phases: [
        { name: 'Solicitado', description: 'Exame solicitado pelo medico', color: '#6366F1', order: 0, probability: 10, isWon: false, isLost: false },
        { name: 'Agendado', description: 'Exame agendado com laboratorio', color: '#8B5CF6', order: 1, probability: 30, isWon: false, isLost: false },
        { name: 'Coletado', description: 'Material coletado', color: '#F59E0B', order: 2, probability: 50, isWon: false, isLost: false },
        { name: 'Em Analise', description: 'Laboratorio processando', color: '#F97316', order: 3, probability: 70, isWon: false, isLost: false },
        { name: 'Resultado Pronto', description: 'Resultado disponivel', color: '#14B8A6', order: 4, probability: 90, isWon: false, isLost: false },
        { name: 'Entregue ao Paciente', description: 'Resultado comunicado', color: '#10B981', order: 5, probability: 100, isWon: true, isLost: false },
      ],
      fields: [
        { name: 'paciente', label: 'Paciente', type: 'text', required: true, options: null, description: 'Nome do paciente' },
        { name: 'tipo_exame', label: 'Tipo de Exame', type: 'select', required: true, options: ['Hemograma', 'Glicemia', 'Colesterol', 'ECG', 'Raio-X', 'Ultrassom', 'Ressonancia', 'Tomografia'], description: 'Tipo do exame solicitado' },
        { name: 'medico_solicitante', label: 'Medico Solicitante', type: 'text', required: true, options: null, description: 'Medico que solicitou o exame' },
        { name: 'urgencia', label: 'Urgencia', type: 'select', required: false, options: ['Rotina', 'Urgente', 'Emergencia'], description: 'Nivel de urgencia' },
      ],
      tags: ['exames', 'laboratorio', 'diagnostico'],
    })
  }

  if (isBilling) {
    return reply.send({
      pipeName: 'Gestao de Cobranca de Convenios',
      pipeDescription: 'Controle completo de guias TISS, pagamentos e glosas de convenios medicos',
      phases: [
        { name: 'Consulta Realizada', description: 'Atendimento concluido', color: '#3B82F6', order: 0, probability: 10, isWon: false, isLost: false },
        { name: 'Guia TISS Enviada', description: 'Guia enviada ao convenio', color: '#8B5CF6', order: 1, probability: 30, isWon: false, isLost: false },
        { name: 'Em Analise', description: 'Convenio analisando', color: '#F59E0B', order: 2, probability: 60, isWon: false, isLost: false },
        { name: 'Pago', description: 'Pagamento recebido', color: '#10B981', order: 3, probability: 100, isWon: true, isLost: false },
        { name: 'Glosa', description: 'Pagamento glosado', color: '#EF4444', order: 4, probability: 0, isWon: false, isLost: true },
      ],
      fields: [
        { name: 'convenio', label: 'Convenio', type: 'select', required: true, options: ['Unimed', 'Amil', 'SulAmerica', 'Bradesco Saude'], description: 'Convenio do paciente' },
        { name: 'numero_guia', label: 'Numero da Guia', type: 'text', required: true, options: null, description: 'Numero da guia TISS' },
        { name: 'valor', label: 'Valor (R$)', type: 'currency', required: true, options: null, description: 'Valor do procedimento' },
        { name: 'procedimento', label: 'Procedimento', type: 'text', required: false, options: null, description: 'Descricao do procedimento' },
      ],
      tags: ['financeiro', 'convenios', 'cobranca'],
    })
  }

  // Default: Jornada do Paciente
  return reply.send({
    pipeName: isSurgery ? 'Protocolo Pre-Operatorio' : 'Jornada do Paciente',
    pipeDescription: isSurgery
      ? 'Acompanhe pacientes cirurgicos desde a indicacao ate a alta pos-operatoria'
      : 'Acompanhe cada paciente do primeiro contato ao pos-consulta e fidelizacao',
    phases: isSurgery ? [
      { name: 'Indicacao Cirurgica', description: 'Cirurgia indicada pelo medico', color: '#3B82F6', order: 0, probability: 10, isWon: false, isLost: false },
      { name: 'Exames Pre-Op', description: 'Exames pre-operatorios solicitados', color: '#8B5CF6', order: 1, probability: 25, isWon: false, isLost: false },
      { name: 'Risco Cirurgico', description: 'Avaliacao de risco cirurgico', color: '#F59E0B', order: 2, probability: 40, isWon: false, isLost: false },
      { name: 'Agendado', description: 'Cirurgia agendada', color: '#F97316', order: 3, probability: 60, isWon: false, isLost: false },
      { name: 'Realizada', description: 'Cirurgia realizada', color: '#14B8A6', order: 4, probability: 80, isWon: false, isLost: false },
      { name: 'Pos-Operatorio', description: 'Acompanhamento pos-cirurgico', color: '#10B981', order: 5, probability: 100, isWon: true, isLost: false },
    ] : [
      { name: 'Primeiro Contato', description: 'Lead captado', color: '#3B82F6', order: 0, probability: 10, isWon: false, isLost: false },
      { name: 'Agendado', description: 'Consulta agendada', color: '#8B5CF6', order: 1, probability: 30, isWon: false, isLost: false },
      { name: 'Confirmado', description: 'Paciente confirmou presenca', color: '#14B8A6', order: 2, probability: 60, isWon: false, isLost: false },
      { name: 'Em Consulta', description: 'Paciente em atendimento', color: '#F59E0B', order: 3, probability: 80, isWon: false, isLost: false },
      { name: 'Pos-Consulta', description: 'Acompanhamento', color: '#10B981', order: 4, probability: 100, isWon: true, isLost: false },
      { name: 'Nao Compareceu', description: 'Paciente faltou', color: '#EF4444', order: 5, probability: 0, isWon: false, isLost: true },
    ],
    fields: [
      { name: 'paciente', label: 'Paciente', type: 'text', required: true, options: null, description: 'Nome do paciente' },
      { name: 'telefone', label: 'Telefone', type: 'phone', required: true, options: null, description: 'Telefone de contato' },
      { name: 'convenio', label: 'Convenio', type: 'select', required: false, options: ['Unimed', 'Amil', 'SulAmerica', 'Bradesco Saude', 'Particular'], description: 'Convenio do paciente' },
      { name: 'especialidade', label: 'Especialidade', type: 'select', required: true, options: ['Cardiologia', 'Dermatologia', 'Clinico Geral', 'Pediatria', 'Ortopedia', 'Ginecologia'], description: 'Especialidade da consulta' },
      { name: 'medico', label: 'Medico', type: 'text', required: false, options: null, description: 'Medico responsavel' },
      { name: 'origem', label: 'Origem', type: 'select', required: false, options: ['Instagram', 'Google', 'Indicacao', 'WhatsApp', 'Site'], description: 'Como o paciente chegou' },
    ],
    tags: isSurgery ? ['cirurgia', 'pre-operatorio', 'protocolo'] : ['pacientes', 'consultas', 'jornada'],
  })
})

// GET /api/ai/analytics/stats (mock)
fastify.get('/api/ai/analytics/stats', async (request, reply) => {
  return reply.send({
    totalQueries: mockQueryLogs.length + 24,
    totalDocuments: mockDocuments.length,
    totalKnowledgeBases: mockKnowledgeBases.length,
    totalAgents: mockAgents.length,
    avgResponseTime: 380,
    queriesByDay: [
      { date: '2024-01-25', count: 5 },
      { date: '2024-01-26', count: 8 },
      { date: '2024-01-27', count: 3 },
      { date: '2024-01-28', count: 12 },
    ],
  })
})

// GET /api/ai/analytics/queries (mock)
fastify.get('/api/ai/analytics/queries', async (request, reply) => {
  return reply.send(mockQueryLogs.slice(-50).reverse())
})

// ============================================================================
// MOCK PIPES ENDPOINTS (Pipefy-like)
// ============================================================================

// ── Pipe 1: Jornada do Paciente ──
const pipe1Phases = [
  { id: 'phase-1', companyId: 'default-company', pipeId: 'pipe-1', name: 'Primeiro Contato', description: 'Lead captado - aguardando contato', color: '#3B82F6', position: 0, probability: 10, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-2', companyId: 'default-company', pipeId: 'pipe-1', name: 'Agendado', description: 'Consulta agendada', color: '#8B5CF6', position: 1, probability: 30, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-3', companyId: 'default-company', pipeId: 'pipe-1', name: 'Confirmado', description: 'Paciente confirmou presenca', color: '#14B8A6', position: 2, probability: 60, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-4', companyId: 'default-company', pipeId: 'pipe-1', name: 'Em Consulta', description: 'Paciente em atendimento', color: '#F59E0B', position: 3, probability: 80, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-5', companyId: 'default-company', pipeId: 'pipe-1', name: 'Pos-Consulta', description: 'Acompanhamento e retorno', color: '#10B981', position: 4, probability: 100, isWon: true, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-6', companyId: 'default-company', pipeId: 'pipe-1', name: 'Nao Compareceu', description: 'Paciente faltou', color: '#EF4444', position: 5, probability: 0, isWon: false, isLost: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const pipe1Fields = [
  { id: 'field-1', companyId: 'default-company', pipeId: 'pipe-1', name: 'paciente', label: 'Paciente', type: 'text', required: true, position: 0, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-2', companyId: 'default-company', pipeId: 'pipe-1', name: 'telefone', label: 'Telefone', type: 'phone', required: true, position: 1, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-3', companyId: 'default-company', pipeId: 'pipe-1', name: 'convenio', label: 'Convenio', type: 'select', required: false, position: 2, configJson: { options: ['Unimed', 'Amil', 'SulAmerica', 'Bradesco Saude', 'Particular'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-4', companyId: 'default-company', pipeId: 'pipe-1', name: 'especialidade', label: 'Especialidade', type: 'select', required: true, position: 3, configJson: { options: ['Cardiologia', 'Dermatologia', 'Clinico Geral', 'Pediatria', 'Ortopedia'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-5', companyId: 'default-company', pipeId: 'pipe-1', name: 'medico', label: 'Medico Responsavel', type: 'text', required: false, position: 4, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-6', companyId: 'default-company', pipeId: 'pipe-1', name: 'origem', label: 'Origem do Paciente', type: 'select', required: false, position: 5, configJson: { options: ['Instagram', 'Google', 'Indicacao', 'WhatsApp', 'Site', 'Convenio'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-7', companyId: 'default-company', pipeId: 'pipe-1', name: 'valor_consulta', label: 'Valor da Consulta', type: 'currency', required: false, position: 6, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

// ── Pipe 2: Controle de Exames ──
const pipe2Phases = [
  { id: 'phase-e1', companyId: 'default-company', pipeId: 'pipe-2', name: 'Solicitado', description: 'Exame solicitado pelo medico', color: '#6366F1', position: 0, probability: 10, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-e2', companyId: 'default-company', pipeId: 'pipe-2', name: 'Agendado', description: 'Exame agendado com laboratorio', color: '#8B5CF6', position: 1, probability: 30, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-e3', companyId: 'default-company', pipeId: 'pipe-2', name: 'Coletado', description: 'Material coletado', color: '#F59E0B', position: 2, probability: 50, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-e4', companyId: 'default-company', pipeId: 'pipe-2', name: 'Em Analise', description: 'Laboratorio analisando', color: '#F97316', position: 3, probability: 70, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-e5', companyId: 'default-company', pipeId: 'pipe-2', name: 'Resultado Pronto', description: 'Resultado disponivel', color: '#14B8A6', position: 4, probability: 90, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-e6', companyId: 'default-company', pipeId: 'pipe-2', name: 'Entregue', description: 'Resultado entregue ao paciente', color: '#10B981', position: 5, probability: 100, isWon: true, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const pipe2Fields = [
  { id: 'field-e1', companyId: 'default-company', pipeId: 'pipe-2', name: 'paciente', label: 'Paciente', type: 'text', required: true, position: 0, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-e2', companyId: 'default-company', pipeId: 'pipe-2', name: 'tipo_exame', label: 'Tipo de Exame', type: 'select', required: true, position: 1, configJson: { options: ['Hemograma', 'Glicemia', 'Colesterol', 'ECG', 'Raio-X', 'Ultrassom', 'Ressonancia', 'Tomografia', 'Outro'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-e3', companyId: 'default-company', pipeId: 'pipe-2', name: 'medico_solicitante', label: 'Medico Solicitante', type: 'text', required: true, position: 2, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-e4', companyId: 'default-company', pipeId: 'pipe-2', name: 'urgencia', label: 'Urgencia', type: 'select', required: false, position: 3, configJson: { options: ['Rotina', 'Urgente', 'Emergencia'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-e5', companyId: 'default-company', pipeId: 'pipe-2', name: 'laboratorio', label: 'Laboratorio', type: 'text', required: false, position: 4, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

// ── Pipe 3: Cobrança de Convênios ──
const pipe3Phases = [
  { id: 'phase-c1', companyId: 'default-company', pipeId: 'pipe-3', name: 'Consulta Realizada', description: 'Atendimento concluido', color: '#3B82F6', position: 0, probability: 10, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-c2', companyId: 'default-company', pipeId: 'pipe-3', name: 'Guia Enviada', description: 'Guia TISS enviada ao convenio', color: '#8B5CF6', position: 1, probability: 30, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-c3', companyId: 'default-company', pipeId: 'pipe-3', name: 'Em Analise', description: 'Convenio analisando', color: '#F59E0B', position: 2, probability: 50, isWon: false, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-c4', companyId: 'default-company', pipeId: 'pipe-3', name: 'Pago', description: 'Pagamento recebido', color: '#10B981', position: 3, probability: 100, isWon: true, isLost: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'phase-c5', companyId: 'default-company', pipeId: 'pipe-3', name: 'Glosa', description: 'Convenio glosou o pagamento', color: '#EF4444', position: 4, probability: 0, isWon: false, isLost: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const pipe3Fields = [
  { id: 'field-c1', companyId: 'default-company', pipeId: 'pipe-3', name: 'paciente', label: 'Paciente', type: 'text', required: true, position: 0, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-c2', companyId: 'default-company', pipeId: 'pipe-3', name: 'convenio', label: 'Convenio', type: 'select', required: true, position: 1, configJson: { options: ['Unimed', 'Amil', 'SulAmerica', 'Bradesco Saude'] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-c3', companyId: 'default-company', pipeId: 'pipe-3', name: 'numero_guia', label: 'Numero da Guia TISS', type: 'text', required: true, position: 2, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-c4', companyId: 'default-company', pipeId: 'pipe-3', name: 'valor', label: 'Valor (R$)', type: 'currency', required: true, position: 3, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'field-c5', companyId: 'default-company', pipeId: 'pipe-3', name: 'procedimento', label: 'Procedimento', type: 'text', required: false, position: 4, configJson: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const mockPhases = [...pipe1Phases, ...pipe2Phases, ...pipe3Phases]

const mockFieldDefs = [...pipe1Fields, ...pipe2Fields, ...pipe3Fields]

const mockPipes: any[] = [
  {
    id: 'pipe-1', companyId: 'default-company', name: 'Jornada do Paciente', description: 'Acompanhe cada paciente do primeiro contato ao pos-consulta',
    icon: null, color: '#14B8A6', status: 'active', isPublic: false, tags: ['pacientes', 'consultas', 'jornada'],
    phases: pipe1Phases, fieldDefinitions: pipe1Fields,
    _count: { cards: 5, phases: 6, fieldDefinitions: 7 },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pipe-2', companyId: 'default-company', name: 'Controle de Exames', description: 'Rastreie exames solicitados ate a entrega do resultado',
    icon: null, color: '#8B5CF6', status: 'active', isPublic: false, tags: ['exames', 'laboratorio'],
    phases: pipe2Phases, fieldDefinitions: pipe2Fields,
    _count: { cards: 3, phases: 6, fieldDefinitions: 5 },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'pipe-3', companyId: 'default-company', name: 'Cobranca de Convenios', description: 'Gestao de guias TISS e pagamentos de convenios',
    icon: null, color: '#F59E0B', status: 'active', isPublic: false, tags: ['financeiro', 'convenios', 'guias'],
    phases: pipe3Phases, fieldDefinitions: pipe3Fields,
    _count: { cards: 4, phases: 5, fieldDefinitions: 5 },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
]

const mockCards: any[] = [
  // ── Jornada do Paciente ──
  {
    id: 'card-1', companyId: 'default-company', pipeId: 'pipe-1', currentPhaseId: 'phase-1', title: 'Joao Silva - Cardiologia',
    description: 'Paciente veio pelo Instagram, quer agendar check-up cardiologico', status: 'active',
    createdById: 'user-1', assignedToId: 'user-1',
    assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema', avatar: null },
    currentPhase: pipe1Phases[0], fieldValues: [],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-2', companyId: 'default-company', pipeId: 'pipe-1', currentPhaseId: 'phase-2', title: 'Maria Santos - Dermatologia',
    description: 'Consulta agendada para avaliacao de manchas', status: 'active',
    createdById: 'user-1', assignedToId: null, assignedTo: null,
    currentPhase: pipe1Phases[1], fieldValues: [],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-3', companyId: 'default-company', pipeId: 'pipe-1', currentPhaseId: 'phase-3', title: 'Pedro Oliveira - Clinico Geral',
    description: 'Retorno diabetes - confirmou presenca', status: 'active',
    createdById: 'user-1', assignedToId: 'user-1',
    assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema', avatar: null },
    currentPhase: pipe1Phases[2], fieldValues: [],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-4', companyId: 'default-company', pipeId: 'pipe-1', currentPhaseId: 'phase-4', title: 'Roberto Almeida - Cardiologia',
    description: 'Paciente em consulta com Dr. Ricardo', status: 'active',
    createdById: 'user-1', assignedToId: 'user-1',
    assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema', avatar: null },
    currentPhase: pipe1Phases[3], fieldValues: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-5', companyId: 'default-company', pipeId: 'pipe-1', currentPhaseId: 'phase-5', title: 'Ana Costa - Pediatria',
    description: 'Consulta realizada, aguardando retorno em 30 dias', status: 'active',
    createdById: 'user-1', assignedToId: null, assignedTo: null,
    currentPhase: pipe1Phases[4], fieldValues: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  // ── Controle de Exames ──
  {
    id: 'card-6', companyId: 'default-company', pipeId: 'pipe-2', currentPhaseId: 'phase-e1', title: 'Hemograma - Joao Silva',
    description: 'Hemograma completo + glicemia de jejum', status: 'active',
    createdById: 'user-1', assignedToId: null, assignedTo: null,
    currentPhase: pipe2Phases[0], fieldValues: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-7', companyId: 'default-company', pipeId: 'pipe-2', currentPhaseId: 'phase-e4', title: 'ECG + Ecocardiograma - Roberto Almeida',
    description: 'Exames cardiologicos em analise no laboratorio', status: 'active',
    createdById: 'user-1', assignedToId: 'user-1',
    assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema', avatar: null },
    currentPhase: pipe2Phases[3], fieldValues: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-8', companyId: 'default-company', pipeId: 'pipe-2', currentPhaseId: 'phase-e5', title: 'Anatomopatologico - Maria Santos',
    description: 'Resultado do anatomopatologico pronto', status: 'active',
    createdById: 'user-1', assignedToId: null, assignedTo: null,
    currentPhase: pipe2Phases[4], fieldValues: [],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  // ── Cobrança de Convênios ──
  {
    id: 'card-9', companyId: 'default-company', pipeId: 'pipe-3', currentPhaseId: 'phase-c1', title: 'Consulta Cardiologia - Joao Silva',
    description: 'Unimed - Consulta retorno cardiologico R$ 350', status: 'active',
    createdById: 'user-1', assignedToId: null, assignedTo: null,
    currentPhase: pipe3Phases[0], fieldValues: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-10', companyId: 'default-company', pipeId: 'pipe-3', currentPhaseId: 'phase-c2', title: 'Procedimento Dermatologico - Maria Santos',
    description: 'Unimed - Excisao cirurgica R$ 850', status: 'active',
    createdById: 'user-1', assignedToId: 'user-1',
    assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema', avatar: null },
    currentPhase: pipe3Phases[1], fieldValues: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-11', companyId: 'default-company', pipeId: 'pipe-3', currentPhaseId: 'phase-c3', title: 'Consulta Clinico - Pedro Oliveira',
    description: 'Amil - Consulta + exames R$ 420', status: 'active',
    createdById: 'user-1', assignedToId: null, assignedTo: null,
    currentPhase: pipe3Phases[2], fieldValues: [],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'card-12', companyId: 'default-company', pipeId: 'pipe-3', currentPhaseId: 'phase-c4', title: 'Exames Cardiologicos - Roberto Almeida',
    description: 'SulAmerica - ECG + Eco R$ 680 - PAGO', status: 'active',
    createdById: 'user-1', assignedToId: null, assignedTo: null,
    currentPhase: pipe3Phases[3], fieldValues: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

// GET /api/pipes
fastify.get('/api/pipes', async (request, reply) => {
  console.log('[MOCK] GET /api/pipes')
  return reply.send(mockPipes.map(({ phases, fieldDefinitions, ...p }) => p))
})

// GET /api/pipes/:pipeId
fastify.get('/api/pipes/:pipeId', async (request, reply) => {
  const { pipeId } = request.params as { pipeId: string }
  const pipe = mockPipes.find((p) => p.id === pipeId)
  if (!pipe) return reply.status(404).send({ message: 'Pipe not found' })
  return reply.send(pipe)
})

// POST /api/pipes
fastify.post('/api/pipes', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/pipes', data)
  const pipe = {
    id: `pipe-${Date.now()}`, companyId: 'default-company', name: data.name,
    description: data.description || null, icon: data.icon || null, color: data.color || '#3B82F6',
    status: 'active', isPublic: false, tags: data.tags || [],
    _count: { cards: 0, phases: 0, fieldDefinitions: 0 },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockPipes.push(pipe)
  return reply.status(201).send(pipe)
})

// POST /api/pipes/from-suggest
fastify.post('/api/pipes/from-suggest', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/pipes/from-suggest', { pipeName: data?.pipeName })
  const pipeId = `pipe-${Date.now()}`
  const phases = (data.phases || []).map((p: any, i: number) => ({
    id: `phase-gen-${i}`, companyId: 'default-company', pipeId,
    name: p.name, description: p.description || '', color: p.color || '#6B7280',
    position: p.order ?? i, probability: p.probability ?? 0, isWon: p.isWon || false, isLost: p.isLost || false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }))
  const fieldDefinitions = (data.fields || []).map((f: any, i: number) => ({
    id: `field-gen-${i}`, companyId: 'default-company', pipeId,
    name: f.name, label: f.label, type: f.type || 'text', required: f.required || false,
    position: i, configJson: f.options ? { options: f.options } : {},
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }))
  const pipe = {
    id: pipeId, companyId: 'default-company', name: data.pipeName,
    description: data.pipeDescription || null, icon: null, color: '#3B82F6',
    status: 'active', isPublic: false, tags: data.tags || [],
    phases, fieldDefinitions,
    _count: { cards: 0, phases: phases.length, fieldDefinitions: fieldDefinitions.length },
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockPipes.push(pipe)
  return reply.status(201).send(pipe)
})

// DELETE /api/pipes/:pipeId
fastify.delete('/api/pipes/:pipeId', async (request, reply) => {
  const { pipeId } = request.params as { pipeId: string }
  const index = mockPipes.findIndex((p) => p.id === pipeId)
  if (index !== -1) mockPipes[index].status = 'archived'
  return reply.send({ success: true })
})

// GET /api/pipes/:pipeId/kanban
fastify.get('/api/pipes/:pipeId/kanban', async (request, reply) => {
  const { pipeId } = request.params as { pipeId: string }
  const pipe = mockPipes.find((p) => p.id === pipeId)
  if (!pipe) return reply.status(404).send({ message: 'Pipe not found' })
  const phasesWithCards = (pipe.phases || mockPhases).map((phase: any) => ({
    ...phase,
    cards: mockCards.filter((c) => c.currentPhaseId === phase.id),
    _count: { cards: mockCards.filter((c) => c.currentPhaseId === phase.id).length },
  }))
  return reply.send({ ...pipe, phases: phasesWithCards })
})

// GET /api/pipes/:pipeId/cards
fastify.get('/api/pipes/:pipeId/cards', async (request, reply) => {
  const { pipeId } = request.params as { pipeId: string }
  const query = request.query as any
  let cards = mockCards.filter((c) => c.pipeId === pipeId)
  if (query.phaseId) cards = cards.filter((c) => c.currentPhaseId === query.phaseId)
  if (query.q) cards = cards.filter((c) => c.title.toLowerCase().includes(query.q.toLowerCase()))
  return reply.send({ data: cards, pagination: { page: 1, pageSize: 50, total: cards.length, totalPages: 1 } })
})

// POST /api/pipes/:pipeId/cards
fastify.post('/api/pipes/:pipeId/cards', async (request, reply) => {
  const { pipeId } = request.params as { pipeId: string }
  const data = request.body as any
  console.log('[MOCK] POST /api/pipes/:pipeId/cards', data)
  const pipe = mockPipes.find((p) => p.id === pipeId)
  const firstPhase = pipe?.phases?.[0] || mockPhases[0]
  const card = {
    id: `card-${Date.now()}`, companyId: 'default-company', pipeId,
    currentPhaseId: firstPhase.id, title: data.title, description: data.description || null,
    status: 'active', createdById: 'user-1', assignedToId: data.assignedToId || null,
    assignedTo: null, currentPhase: firstPhase, fieldValues: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockCards.push(card)
  return reply.status(201).send(card)
})

// GET /api/pipes/cards/:cardId
fastify.get('/api/pipes/cards/:cardId', async (request, reply) => {
  const { cardId } = request.params as { cardId: string }
  const card = mockCards.find((c) => c.id === cardId)
  if (!card) return reply.status(404).send({ message: 'Card not found' })
  return reply.send({ ...card, activityLogs: [], attachments: [] })
})

// PATCH /api/pipes/cards/:cardId/move
fastify.patch('/api/pipes/cards/:cardId/move', async (request, reply) => {
  const { cardId } = request.params as { cardId: string }
  const { phaseId } = request.body as { phaseId: string }
  const card = mockCards.find((c) => c.id === cardId)
  if (!card) return reply.status(404).send({ message: 'Card not found' })
  card.currentPhaseId = phaseId
  const newPhase = mockPhases.find((p) => p.id === phaseId)
  if (newPhase) card.currentPhase = newPhase
  return reply.send(card)
})

// PATCH /api/pipes/cards/:cardId/fields
fastify.patch('/api/pipes/cards/:cardId/fields', async (request, reply) => {
  return reply.send({ success: true })
})

// POST /api/pipes/cards/:cardId/attachments
fastify.post('/api/pipes/cards/:cardId/attachments', async (request, reply) => {
  const { cardId } = request.params as { cardId: string }
  const data = request.body as any
  return reply.status(201).send({
    id: `att-${Date.now()}`, cardId, fileName: data.fileName,
    mimeType: data.mimeType, size: data.size || 0, storageUrl: data.storageUrl,
    createdAt: new Date().toISOString(),
  })
})

// POST /api/pipes/:pipeId/phases
fastify.post('/api/pipes/:pipeId/phases', async (request, reply) => {
  const { pipeId } = request.params as { pipeId: string }
  const data = request.body as any
  const phase = {
    id: `phase-${Date.now()}`, companyId: 'default-company', pipeId,
    name: data.name, description: data.description || '', color: data.color || '#6B7280',
    position: data.position ?? mockPhases.length, probability: data.probability ?? 0,
    isWon: data.isWon || false, isLost: data.isLost || false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockPhases.push(phase)
  return reply.status(201).send(phase)
})

// POST /api/pipes/:pipeId/fields
fastify.post('/api/pipes/:pipeId/fields', async (request, reply) => {
  const { pipeId } = request.params as { pipeId: string }
  const data = request.body as any
  const field = {
    id: `field-${Date.now()}`, companyId: 'default-company', pipeId,
    name: data.name, label: data.label, type: data.type || 'text',
    required: data.required || false, position: data.position ?? mockFieldDefs.length,
    configJson: data.configJson || {},
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockFieldDefs.push(field)
  return reply.status(201).send(field)
})

// ============================================================================
// MOCK WEBHOOKS ENDPOINTS
// ============================================================================

const WEBHOOK_EVENTS = ['lead.created', 'lead.updated', 'card.created', 'card.moved', 'card.completed', 'contact.created', 'conversation.new_message']

const mockWebhooks: any[] = [
  {
    id: 'wh-1', companyId: 'default-company', name: 'Notificar Slack',
    description: 'Envia notificacao no Slack quando lead e criado',
    type: 'outgoing', url: 'https://hooks.slack.com/services/xxx', method: 'POST',
    headers: { 'Content-Type': 'application/json' }, event: 'lead.created', secret: null,
    isActive: true, totalCalls: 47, lastCalledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'wh-2', companyId: 'default-company', name: 'Webhook Entrada (Typeform)',
    description: 'Recebe dados de formularios Typeform',
    type: 'incoming', url: null, method: null,
    headers: {}, event: null, secret: 'sec_abc123xyz',
    isActive: true, totalCalls: 12, lastCalledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'wh-3', companyId: 'default-company', name: 'Email Marketing',
    description: 'Dispara email quando card e concluido',
    type: 'outgoing', url: 'https://api.sendgrid.com/v3/mail/send', method: 'POST',
    headers: { Authorization: 'Bearer SG.xxx' }, event: 'card.completed', secret: null,
    isActive: false, totalCalls: 5, lastCalledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

// GET /api/webhooks
fastify.get('/api/webhooks', async (request, reply) => {
  console.log('[MOCK] GET /api/webhooks')
  return reply.send(mockWebhooks)
})

// GET /api/webhooks/events
fastify.get('/api/webhooks/events', async (request, reply) => {
  return reply.send(WEBHOOK_EVENTS)
})

// GET /api/webhooks/:id
fastify.get('/api/webhooks/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const wh = mockWebhooks.find((w) => w.id === id)
  if (!wh) return reply.status(404).send({ message: 'Webhook not found' })
  return reply.send(wh)
})

// POST /api/webhooks
fastify.post('/api/webhooks', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/webhooks', data)
  const wh = {
    id: `wh-${Date.now()}`, companyId: 'default-company',
    name: data.name, description: data.description || null,
    type: data.type || 'outgoing', url: data.url || null, method: data.method || 'POST',
    headers: data.headers || {}, event: data.event || null,
    secret: data.type === 'incoming' ? 'sec_' + Math.random().toString(36).substring(2, 10) : null,
    isActive: true, totalCalls: 0, lastCalledAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockWebhooks.push(wh)
  return reply.status(201).send(wh)
})

// PUT /api/webhooks/:id
fastify.put('/api/webhooks/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockWebhooks.findIndex((w) => w.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Webhook not found' })
  mockWebhooks[index] = { ...mockWebhooks[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockWebhooks[index])
})

// DELETE /api/webhooks/:id
fastify.delete('/api/webhooks/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockWebhooks.findIndex((w) => w.id === id)
  if (index !== -1) mockWebhooks.splice(index, 1)
  return reply.send({ success: true })
})

// ============================================================================
// MOCK INBOX / CONVERSATIONS ENDPOINTS
// ============================================================================

const mockChannels: any[] = [
  { id: 'ch-1', companyId: 'default-company', type: 'webchat', name: 'Chat do Site', config: {}, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'ch-2', companyId: 'default-company', type: 'whatsapp', name: 'WhatsApp Business', config: {}, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const mockConversations: any[] = [
  {
    id: 'conv-1', companyId: 'default-company', channelId: 'ch-1',
    channel: mockChannels[0],
    contactId: '1', contact: { id: '1', firstName: 'João', lastName: 'Silva', fullName: 'João Silva', email: 'joao@exemplo.com', avatar: null },
    assignedToId: 'user-1', assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' },
    status: 'open', isUnread: true, isBotActive: false,
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastMessagePreview: 'Boa tarde, gostaria de saber sobre os tubos de aço...',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-2', companyId: 'default-company', channelId: 'ch-2',
    channel: mockChannels[1],
    contactId: '2', contact: { id: '2', firstName: 'Maria', lastName: 'Santos', fullName: 'Maria Santos', email: 'maria@exemplo.com', avatar: null },
    assignedToId: null, assignedTo: null,
    status: 'open', isUnread: false, isBotActive: true,
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    lastMessagePreview: 'Obrigada pelo retorno! Vou analisar a proposta.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-3', companyId: 'default-company', channelId: 'ch-1',
    channel: mockChannels[0],
    contactId: '3', contact: { id: '3', firstName: 'Pedro', lastName: 'Oliveira', fullName: 'Pedro Oliveira', email: 'pedro@empresa.com', avatar: null },
    assignedToId: null, assignedTo: null,
    status: 'resolved', isUnread: false, isBotActive: false,
    lastMessageAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastMessagePreview: 'Perfeito, muito obrigado!',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockMessages: any[] = [
  { id: 'msg-1', conversationId: 'conv-1', direction: 'inbound', senderId: null, content: 'Olá, boa tarde! Vi o site de vocês e gostaria de informações sobre tubos de aço inoxidável.', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'msg-2', conversationId: 'conv-1', direction: 'outbound', senderId: 'user-1', sender: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' }, content: 'Boa tarde, João! Claro, temos diversas opções. Qual o diâmetro e espessura que precisa?', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000).toISOString() },
  { id: 'msg-3', conversationId: 'conv-1', direction: 'inbound', senderId: null, content: 'Preciso de tubos de 4 polegadas, schedule 40. Cerca de 200 metros.', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'msg-4', conversationId: 'conv-1', direction: 'outbound', senderId: 'user-1', sender: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' }, content: 'Temos em estoque! Vou preparar um orçamento e envio ainda hoje. Pode me confirmar o CNPJ da empresa?', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 600000).toISOString() },
  { id: 'msg-5', conversationId: 'conv-1', direction: 'inbound', senderId: null, content: 'Boa tarde, gostaria de saber sobre os tubos de aço carbono também. Têm disponibilidade?', contentType: 'text', isFromBot: false, isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'msg-6', conversationId: 'conv-2', direction: 'inbound', senderId: null, content: 'Oi, recebi a indicação de um parceiro. Precisamos de conexões para gasoduto.', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'msg-7', conversationId: 'conv-2', direction: 'outbound', senderId: null, content: 'Olá Maria! Somos especialistas em conexões para gasoduto. Posso ajudar! Qual o tipo de conexão e pressão de trabalho?', contentType: 'text', isFromBot: true, isRead: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60000).toISOString() },
  { id: 'msg-8', conversationId: 'conv-2', direction: 'inbound', senderId: null, content: 'Obrigada pelo retorno! Vou analisar a proposta.', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'msg-9', conversationId: 'conv-3', direction: 'inbound', senderId: null, content: 'Bom dia, o pedido chegou certinho. Tudo ok!', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'msg-10', conversationId: 'conv-3', direction: 'outbound', senderId: 'user-1', sender: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' }, content: 'Perfeito, muito obrigado!', contentType: 'text', isFromBot: false, isRead: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120000).toISOString() },
]

// GET /api/conversations
fastify.get('/api/conversations', async (request, reply) => {
  console.log('[MOCK] GET /api/conversations')
  const query = request.query as any
  let filtered = [...mockConversations]
  if (query.status) filtered = filtered.filter((c) => c.status === query.status)
  if (query.channelType) filtered = filtered.filter((c) => c.channel?.type === query.channelType)
  filtered.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime())
  return reply.send(filtered)
})

// GET /api/conversations/:id
fastify.get('/api/conversations/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const conv = mockConversations.find((c) => c.id === id)
  if (!conv) return reply.status(404).send({ message: 'Conversation not found' })
  return reply.send(conv)
})

// GET /api/conversations/:id/messages
fastify.get('/api/conversations/:id/messages', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] GET /api/conversations/:id/messages', { id })
  const msgs = mockMessages.filter((m) => m.conversationId === id)
  msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return reply.send(msgs)
})

// POST /api/conversations/:id/messages
fastify.post('/api/conversations/:id/messages', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  console.log('[MOCK] POST /api/conversations/:id/messages', data)
  const msg = {
    id: `msg-${Date.now()}`, conversationId: id, direction: 'outbound',
    senderId: 'user-1', sender: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' },
    content: data.content, contentType: data.contentType || 'text',
    isFromBot: false, isRead: true,
    createdAt: new Date().toISOString(),
  }
  mockMessages.push(msg)
  const conv = mockConversations.find((c) => c.id === id)
  if (conv) { conv.lastMessageAt = msg.createdAt; conv.lastMessagePreview = msg.content; conv.isUnread = false }
  return reply.status(201).send(msg)
})

// PATCH /api/conversations/:id/status
fastify.patch('/api/conversations/:id/status', async (request, reply) => {
  const { id } = request.params as { id: string }
  const { status } = request.body as { status: string }
  const conv = mockConversations.find((c) => c.id === id)
  if (!conv) return reply.status(404).send({ message: 'Conversation not found' })
  conv.status = status
  conv.updatedAt = new Date().toISOString()
  return reply.send(conv)
})

// PATCH /api/conversations/:id/read
fastify.patch('/api/conversations/:id/read', async (request, reply) => {
  const { id } = request.params as { id: string }
  const conv = mockConversations.find((c) => c.id === id)
  if (conv) { conv.isUnread = false }
  return reply.send({ success: true })
})

// ============================================================================
// MOCK DASHBOARD ENDPOINT
// ============================================================================

fastify.get('/api/dashboard/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/dashboard/stats')

  const activePipes = mockPipes.filter((p) => p.status === 'active')
  const activeCards = mockCards.filter((c) => c.status === 'active')
  const doneCards = mockCards.filter((c) => c.status === 'done')
  const wonPhaseIds = mockPhases.filter((p) => p.isWon).map((p) => p.id)
  const lostPhaseIds = mockPhases.filter((p) => p.isLost).map((p) => p.id)
  const wonCards = mockCards.filter((c) => wonPhaseIds.includes(c.currentPhaseId))
  const lostCards = mockCards.filter((c) => lostPhaseIds.includes(c.currentPhaseId))

  const phaseDistribution = mockPhases
    .filter((p) => !p.isWon && !p.isLost)
    .map((phase) => ({
      phaseName: phase.name,
      color: phase.color,
      cards: mockCards.filter((c) => c.currentPhaseId === phase.id).length,
    }))

  const pipesSummary = activePipes.map((pipe) => {
    const pipeCards = mockCards.filter((c) => c.pipeId === pipe.id)
    return {
      id: pipe.id,
      name: pipe.name,
      color: pipe.color,
      totalCards: pipeCards.length,
      activeCards: pipeCards.filter((c) => c.status === 'active').length,
      wonCards: pipeCards.filter((c) => wonPhaseIds.includes(c.currentPhaseId)).length,
      lostCards: pipeCards.filter((c) => lostPhaseIds.includes(c.currentPhaseId)).length,
    }
  })

  const today = new Date()
  const cardsByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toISOString().split('T')[0],
      created: Math.floor(Math.random() * 5) + 1,
      completed: Math.floor(Math.random() * 3),
    }
  })

  const recentCards = mockCards.slice(-5).reverse().map((c) => ({
    id: c.id,
    title: c.title,
    pipeName: mockPipes.find((p) => p.id === c.pipeId)?.name || '',
    phaseName: c.currentPhase?.name || '',
    phaseColor: c.currentPhase?.color || '#6B7280',
    status: c.status,
    createdAt: c.createdAt,
  }))

  return reply.send({
    contacts: {
      total: mockContacts.length,
      withEmail: mockContacts.filter((c) => c.email).length,
      withPhone: mockContacts.filter((c) => c.phone).length,
      recentCount: mockContacts.length,
    },
    pipes: {
      total: activePipes.length,
      totalCards: mockCards.length,
      activeCards: activeCards.length,
      doneCards: doneCards.length,
      wonCards: wonCards.length,
      lostCards: lostCards.length,
    },
    pipesSummary,
    phaseDistribution,
    ai: {
      totalQueries: mockQueryLogs.length + 24,
      totalDocuments: mockDocuments.length,
      totalAgents: mockAgents.length,
      avgResponseTime: 380,
    },
    recentCards,
    cardsByDay,
  })
})

// ============================================================================
// MOCK AUTOMATIONS ENDPOINTS
// ============================================================================

const AUTOMATION_TRIGGERS = [
  { type: 'event', label: 'Evento', events: ['lead.created', 'lead.updated', 'card.created', 'card.moved', 'card.completed', 'contact.created', 'conversation.new_message'] },
  { type: 'schedule', label: 'Agendamento', events: ['daily', 'weekly', 'monthly'] },
]

const AUTOMATION_ACTIONS = [
  { type: 'send_email', label: 'Enviar email' },
  { type: 'send_webhook', label: 'Enviar webhook' },
  { type: 'create_card', label: 'Criar card' },
  { type: 'update_field', label: 'Atualizar campo' },
  { type: 'assign_user', label: 'Atribuir usuario' },
  { type: 'add_tag', label: 'Adicionar tag' },
  { type: 'notify', label: 'Notificar usuario' },
]

const mockAutomations: any[] = [
  {
    id: 'auto-1', companyId: 'default-company', name: 'Lead para Card no Pipe de Vendas',
    description: 'Quando um lead e criado, cria automaticamente um card no pipe de vendas',
    trigger: { type: 'event', event: 'lead.created' },
    conditions: [{ field: 'score', operator: 'gte', value: 50 }],
    actions: [{ type: 'create_card', params: { pipeId: 'pipe-1', phaseId: 'phase-1' } }],
    isActive: true, executionCount: 23, lastExecutedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'auto-2', companyId: 'default-company', name: 'Notificar equipe em card concluido',
    description: 'Envia notificacao quando um card e movido para fase final',
    trigger: { type: 'event', event: 'card.completed' },
    conditions: [],
    actions: [{ type: 'notify', params: { message: 'Card concluido!' } }, { type: 'send_email', params: { template: 'card_completed' } }],
    isActive: true, executionCount: 8, lastExecutedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'auto-3', companyId: 'default-company', name: 'Tag automatica por origem',
    description: 'Adiciona tag ao contato baseado na origem do lead',
    trigger: { type: 'event', event: 'contact.created' },
    conditions: [{ field: 'source', operator: 'equals', value: 'website' }],
    actions: [{ type: 'add_tag', params: { tag: 'website-lead' } }],
    isActive: false, executionCount: 45, lastExecutedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

// GET /api/automations
fastify.get('/api/automations', async (request, reply) => {
  console.log('[MOCK] GET /api/automations')
  return reply.send(mockAutomations)
})

// GET /api/automations/triggers
fastify.get('/api/automations/triggers', async (request, reply) => {
  return reply.send(AUTOMATION_TRIGGERS)
})

// GET /api/automations/actions
fastify.get('/api/automations/actions', async (request, reply) => {
  return reply.send(AUTOMATION_ACTIONS)
})

// GET /api/automations/:id
fastify.get('/api/automations/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const auto = mockAutomations.find((a) => a.id === id)
  if (!auto) return reply.status(404).send({ message: 'Automation not found' })
  return reply.send(auto)
})

// POST /api/automations
fastify.post('/api/automations', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/automations', data)
  const auto = {
    id: `auto-${Date.now()}`, companyId: 'default-company',
    name: data.name, description: data.description || null,
    trigger: data.trigger || { type: 'event', event: 'lead.created' },
    conditions: data.conditions || [],
    actions: data.actions || [],
    isActive: true, executionCount: 0, lastExecutedAt: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockAutomations.push(auto)
  return reply.status(201).send(auto)
})

// PUT /api/automations/:id
fastify.put('/api/automations/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockAutomations.findIndex((a) => a.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Automation not found' })
  mockAutomations[index] = { ...mockAutomations[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockAutomations[index])
})

// DELETE /api/automations/:id
fastify.delete('/api/automations/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockAutomations.findIndex((a) => a.id === id)
  if (index !== -1) mockAutomations.splice(index, 1)
  return reply.send({ success: true })
})

// ============================================================================
// MOCK BILLING ENDPOINTS
// ============================================================================

const mockPlans: any[] = [
  {
    id: 'plan-free', name: 'free', displayName: 'Free', description: 'Para quem esta comecando',
    price: 0, currency: 'BRL', billingInterval: 'month',
    maxUsers: 2, maxLeadsPerMonth: 50, maxDealsPerMonth: 20, maxAIMessages: 10,
    maxWebhooks: 1, maxAPICallsPerDay: 100, maxStorageGB: 1,
    features: { contacts: true, leads: true, pipes: true, ai: false, webhooks: false, automations: false, inbox: true },
    isActive: true, isPopular: false,
  },
  {
    id: 'plan-pro', name: 'pro', displayName: 'Profissional', description: 'Para equipes em crescimento',
    price: 149.90, currency: 'BRL', billingInterval: 'month',
    maxUsers: 10, maxLeadsPerMonth: 500, maxDealsPerMonth: 200, maxAIMessages: 500,
    maxWebhooks: 10, maxAPICallsPerDay: 5000, maxStorageGB: 10,
    features: { contacts: true, leads: true, pipes: true, ai: true, webhooks: true, automations: true, inbox: true },
    isActive: true, isPopular: true,
  },
  {
    id: 'plan-enterprise', name: 'enterprise', displayName: 'Enterprise', description: 'Para grandes operacoes',
    price: 399.90, currency: 'BRL', billingInterval: 'month',
    maxUsers: -1, maxLeadsPerMonth: -1, maxDealsPerMonth: -1, maxAIMessages: -1,
    maxWebhooks: -1, maxAPICallsPerDay: -1, maxStorageGB: 100,
    features: { contacts: true, leads: true, pipes: true, ai: true, webhooks: true, automations: true, inbox: true, sso: true, audit_log: true, dedicated_support: true },
    isActive: true, isPopular: false,
  },
]

const mockSubscription: any = {
  id: 'sub-1', companyId: 'default-company', planId: 'plan-pro',
  plan: mockPlans[1],
  status: 'active',
  currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAt: null, canceledAt: null,
}

const mockInvoices: any[] = [
  { id: 'inv-1', amount: 149.90, currency: 'BRL', status: 'paid', paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), periodStart: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), periodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'inv-2', amount: 149.90, currency: 'BRL', status: 'paid', paidAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), periodStart: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), periodEnd: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'inv-3', amount: 149.90, currency: 'BRL', status: 'paid', paidAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(), periodStart: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString(), periodEnd: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString() },
]

const mockUsage: any = {
  users: { used: 4, limit: 10 },
  leads: { used: 127, limit: 500 },
  deals: { used: 43, limit: 200 },
  aiMessages: { used: 89, limit: 500 },
  webhooks: { used: 3, limit: 10 },
  apiCalls: { used: 1240, limit: 5000 },
  storage: { used: 2.3, limit: 10 },
}

// GET /api/billing/plans
fastify.get('/api/billing/plans', async (request, reply) => {
  console.log('[MOCK] GET /api/billing/plans')
  return reply.send(mockPlans)
})

// GET /api/billing/subscription
fastify.get('/api/billing/subscription', async (request, reply) => {
  console.log('[MOCK] GET /api/billing/subscription')
  return reply.send(mockSubscription)
})

// GET /api/billing/invoices
fastify.get('/api/billing/invoices', async (request, reply) => {
  return reply.send(mockInvoices)
})

// GET /api/billing/usage
fastify.get('/api/billing/usage', async (request, reply) => {
  return reply.send(mockUsage)
})

// POST /api/billing/change-plan
fastify.post('/api/billing/change-plan', async (request, reply) => {
  const { planId } = request.body as { planId: string }
  const plan = mockPlans.find((p: any) => p.id === planId)
  if (!plan) return reply.status(404).send({ message: 'Plan not found' })
  mockSubscription.planId = planId
  mockSubscription.plan = plan
  console.log('[MOCK] Changed plan to:', plan.displayName)
  return reply.send(mockSubscription)
})

// POST /api/billing/cancel
fastify.post('/api/billing/cancel', async (request, reply) => {
  mockSubscription.status = 'canceled'
  mockSubscription.cancelAt = mockSubscription.currentPeriodEnd
  mockSubscription.canceledAt = new Date().toISOString()
  return reply.send(mockSubscription)
})

// ============================================================================
// MOCK ANALYTICS ENDPOINTS
// ============================================================================

// GET /api/analytics/overview
fastify.get('/api/analytics/overview', async (request, reply) => {
  console.log('[MOCK] GET /api/analytics/overview')
  return reply.send({
    totalLeads: 305,
    newLeadsThisPeriod: 47,
    leadsGrowth: 12.3,
    totalConversions: 76,
    conversionRate: 24.9,
    totalRevenue: 1441000,
    revenueGrowth: 8.7,
    avgDealValue: 18960,
    avgTimeToConvert: 15.4,
    leadVelocity: 10.2,
    costPerLead: 87.50,
    topSource: 'Google Ads',
    topCampaign: 'Campanha Captacao Inverno 2026',
  })
})

// GET /api/analytics/sources
fastify.get('/api/analytics/sources', async (request, reply) => {
  console.log('[MOCK] GET /api/analytics/sources')
  const data = [
    { source: 'Google Ads', leads: 87, qualified: 34, converted: 18, conversionRate: 20.7, revenue: 342000, avgDealValue: 19000, avgTimeToConvert: 14 },
    { source: 'Meta Ads (Facebook)', leads: 63, qualified: 22, converted: 11, conversionRate: 17.5, revenue: 187000, avgDealValue: 17000, avgTimeToConvert: 18 },
    { source: 'Organico', leads: 45, qualified: 28, converted: 15, conversionRate: 33.3, revenue: 285000, avgDealValue: 19000, avgTimeToConvert: 21 },
    { source: 'WhatsApp', leads: 38, qualified: 18, converted: 9, conversionRate: 23.7, revenue: 162000, avgDealValue: 18000, avgTimeToConvert: 10 },
    { source: 'Indicacao', leads: 22, qualified: 15, converted: 12, conversionRate: 54.5, revenue: 276000, avgDealValue: 23000, avgTimeToConvert: 8 },
    { source: 'Instagram', leads: 31, qualified: 10, converted: 5, conversionRate: 16.1, revenue: 75000, avgDealValue: 15000, avgTimeToConvert: 22 },
    { source: 'Email Marketing', leads: 19, qualified: 9, converted: 6, conversionRate: 31.6, revenue: 114000, avgDealValue: 19000, avgTimeToConvert: 16 },
  ]
  const totals = {
    leads: data.reduce((s, d) => s + d.leads, 0),
    converted: data.reduce((s, d) => s + d.converted, 0),
    revenue: data.reduce((s, d) => s + d.revenue, 0),
  }
  return reply.send({ data, totals })
})

// GET /api/analytics/campaigns
fastify.get('/api/analytics/campaigns', async (request, reply) => {
  console.log('[MOCK] GET /api/analytics/campaigns')
  const data = [
    { campaign: 'Campanha Captacao Inverno 2026', platform: 'Google Ads', leads: 32, qualified: 14, converted: 8, conversionRate: 25.0, revenue: 152000, spend: 12800, roi: 1087.5, cpl: 400, cpa: 1600 },
    { campaign: 'Remarketing - Visitantes Site', platform: 'Google Ads', leads: 28, qualified: 12, converted: 6, conversionRate: 21.4, revenue: 114000, spend: 8400, roi: 1257.1, cpl: 300, cpa: 1400 },
    { campaign: 'Prospeccao Lookalike', platform: 'Meta Ads', leads: 25, qualified: 8, converted: 4, conversionRate: 16.0, revenue: 68000, spend: 9500, roi: 615.8, cpl: 380, cpa: 2375 },
    { campaign: 'Captacao Instagram Stories', platform: 'Meta Ads', leads: 22, qualified: 7, converted: 3, conversionRate: 13.6, revenue: 51000, spend: 7200, roi: 608.3, cpl: 327.27, cpa: 2400 },
    { campaign: 'Search - Palavras Exatas', platform: 'Google Ads', leads: 18, qualified: 10, converted: 5, conversionRate: 27.8, revenue: 95000, spend: 6300, roi: 1407.9, cpl: 350, cpa: 1260 },
    { campaign: 'Lead Magnet - eBook', platform: 'Meta Ads', leads: 16, qualified: 5, converted: 2, conversionRate: 12.5, revenue: 34000, spend: 4800, roi: 608.3, cpl: 300, cpa: 2400 },
    { campaign: 'Display - Brand Awareness', platform: 'Google Ads', leads: 9, qualified: 2, converted: 1, conversionRate: 11.1, revenue: 19000, spend: 5200, roi: 265.4, cpl: 577.78, cpa: 5200 },
    { campaign: 'Retargeting Carrinho', platform: 'Meta Ads', leads: 12, qualified: 6, converted: 3, conversionRate: 25.0, revenue: 57000, spend: 3600, roi: 1483.3, cpl: 300, cpa: 1200 },
  ]
  return reply.send({ data })
})

// GET /api/analytics/funnel
fastify.get('/api/analytics/funnel', async (request, reply) => {
  console.log('[MOCK] GET /api/analytics/funnel')
  const stages = [
    { id: 'phase-1', name: 'Prospeccao', color: '#3B82F6', order: 0, entered: 305, exited: 198, dropped: 107, conversionRate: 64.9, avgTimeInStage: 3.2, value: 5795000 },
    { id: 'phase-2', name: 'Qualificacao', color: '#8B5CF6', order: 1, entered: 198, exited: 122, dropped: 76, conversionRate: 61.6, avgTimeInStage: 5.1, value: 3762000 },
    { id: 'phase-3', name: 'Proposta', color: '#F59E0B', order: 2, entered: 122, exited: 84, dropped: 38, conversionRate: 68.9, avgTimeInStage: 7.3, value: 2318000 },
    { id: 'phase-4', name: 'Negociacao', color: '#F97316', order: 3, entered: 84, exited: 58, dropped: 26, conversionRate: 69.0, avgTimeInStage: 4.8, value: 1596000 },
    { id: 'phase-5', name: 'Fechamento', color: '#10B981', order: 4, entered: 58, exited: 58, dropped: 0, conversionRate: 100, avgTimeInStage: 1.2, value: 1102000 },
  ]
  return reply.send({
    stages,
    overallConversion: 19.0,
    biggestDropoff: 'Prospeccao',
    avgCycleTime: 21.6,
  })
})

// GET /api/analytics/ltv
fastify.get('/api/analytics/ltv', async (request, reply) => {
  console.log('[MOCK] GET /api/analytics/ltv')
  return reply.send({
    avgLTV: 42500,
    medianLTV: 38000,
    ltvBySource: [
      { group: 'Indicacao', avgLTV: 68000, customers: 12, totalRevenue: 816000 },
      { group: 'Organico', avgLTV: 52000, customers: 15, totalRevenue: 780000 },
      { group: 'Google Ads', avgLTV: 41000, customers: 18, totalRevenue: 738000 },
      { group: 'Email Marketing', avgLTV: 39500, customers: 6, totalRevenue: 237000 },
      { group: 'WhatsApp', avgLTV: 36000, customers: 9, totalRevenue: 324000 },
      { group: 'Meta Ads', avgLTV: 32000, customers: 11, totalRevenue: 352000 },
      { group: 'Instagram', avgLTV: 28000, customers: 5, totalRevenue: 140000 },
    ],
    ltvByCampaign: [
      { group: 'Search - Palavras Exatas', avgLTV: 58000, customers: 5, totalRevenue: 290000 },
      { group: 'Remarketing - Visitantes Site', avgLTV: 48000, customers: 6, totalRevenue: 288000 },
      { group: 'Campanha Captacao Inverno 2026', avgLTV: 42000, customers: 8, totalRevenue: 336000 },
      { group: 'Retargeting Carrinho', avgLTV: 38000, customers: 3, totalRevenue: 114000 },
      { group: 'Prospeccao Lookalike', avgLTV: 31000, customers: 4, totalRevenue: 124000 },
      { group: 'Lead Magnet - eBook', avgLTV: 28000, customers: 2, totalRevenue: 56000 },
    ],
    cohorts: [
      { month: '2025-02', customers: 5, month1Revenue: 45000, month3Revenue: 125000, month6Revenue: 210000, month12Revenue: 310000, currentLTV: 62000 },
      { month: '2025-03', customers: 7, month1Revenue: 63000, month3Revenue: 168000, month6Revenue: 280000, month12Revenue: 399000, currentLTV: 57000 },
      { month: '2025-04', customers: 4, month1Revenue: 36000, month3Revenue: 96000, month6Revenue: 164000, month12Revenue: 220000, currentLTV: 55000 },
      { month: '2025-05', customers: 8, month1Revenue: 72000, month3Revenue: 200000, month6Revenue: 336000, month12Revenue: 432000, currentLTV: 54000 },
      { month: '2025-06', customers: 6, month1Revenue: 54000, month3Revenue: 144000, month6Revenue: 246000, month12Revenue: 0, currentLTV: 41000 },
      { month: '2025-07', customers: 9, month1Revenue: 81000, month3Revenue: 225000, month6Revenue: 369000, month12Revenue: 0, currentLTV: 41000 },
      { month: '2025-08', customers: 5, month1Revenue: 45000, month3Revenue: 120000, month6Revenue: 195000, month12Revenue: 0, currentLTV: 39000 },
      { month: '2025-09', customers: 7, month1Revenue: 63000, month3Revenue: 175000, month6Revenue: 0, month12Revenue: 0, currentLTV: 25000 },
      { month: '2025-10', customers: 6, month1Revenue: 54000, month3Revenue: 150000, month6Revenue: 0, month12Revenue: 0, currentLTV: 25000 },
      { month: '2025-11', customers: 8, month1Revenue: 72000, month3Revenue: 184000, month6Revenue: 0, month12Revenue: 0, currentLTV: 23000 },
      { month: '2025-12', customers: 5, month1Revenue: 45000, month3Revenue: 0, month6Revenue: 0, month12Revenue: 0, currentLTV: 9000 },
      { month: '2026-01', customers: 6, month1Revenue: 54000, month3Revenue: 0, month6Revenue: 0, month12Revenue: 0, currentLTV: 9000 },
    ],
  })
})

// GET /api/analytics/roi
fastify.get('/api/analytics/roi', async (request, reply) => {
  console.log('[MOCK] GET /api/analytics/roi')
  return reply.send({
    totalSpend: 57800,
    totalRevenue: 1441000,
    overallROI: 2392.4,
    byPlatform: [
      { platform: 'Google Ads', spend: 32700, leads: 87, conversions: 20, revenue: 680000, roi: 1979.5, cpl: 375.86, cpa: 1635 },
      { platform: 'Meta Ads', spend: 25100, leads: 75, conversions: 12, revenue: 210000, roi: 736.7, cpl: 334.67, cpa: 2091.67 },
    ],
    byCampaign: [
      { campaign: 'Retargeting Carrinho', platform: 'Meta Ads', spend: 3600, leads: 12, conversions: 3, revenue: 57000, roi: 1483.3 },
      { campaign: 'Search - Palavras Exatas', platform: 'Google Ads', spend: 6300, leads: 18, conversions: 5, revenue: 95000, roi: 1407.9 },
      { campaign: 'Remarketing - Visitantes Site', platform: 'Google Ads', spend: 8400, leads: 28, conversions: 6, revenue: 114000, roi: 1257.1 },
      { campaign: 'Campanha Captacao Inverno 2026', platform: 'Google Ads', spend: 12800, leads: 32, conversions: 8, revenue: 152000, roi: 1087.5 },
      { campaign: 'Prospeccao Lookalike', platform: 'Meta Ads', spend: 9500, leads: 25, conversions: 4, revenue: 68000, roi: 615.8 },
      { campaign: 'Captacao Instagram Stories', platform: 'Meta Ads', spend: 7200, leads: 22, conversions: 3, revenue: 51000, roi: 608.3 },
      { campaign: 'Lead Magnet - eBook', platform: 'Meta Ads', spend: 4800, leads: 16, conversions: 2, revenue: 34000, roi: 608.3 },
      { campaign: 'Display - Brand Awareness', platform: 'Google Ads', spend: 5200, leads: 9, conversions: 1, revenue: 19000, roi: 265.4 },
    ],
  })
})

// GET /api/analytics/trends
fastify.get('/api/analytics/trends', async (request, reply) => {
  console.log('[MOCK] GET /api/analytics/trends')
  const data = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseLeads = isWeekend ? 5 : 10
    const leads = baseLeads + Math.floor(Math.random() * 8)
    const conversions = Math.floor(leads * (0.15 + Math.random() * 0.15))
    const revenue = conversions * (15000 + Math.floor(Math.random() * 10000))
    const velocity = Number((leads * (0.8 + Math.random() * 0.4)).toFixed(1))
    data.push({
      date: d.toISOString().split('T')[0],
      leads,
      conversions,
      revenue,
      velocity,
    })
  }
  const avgPerDay = Number((data.reduce((s, d) => s + d.leads, 0) / data.length).toFixed(1))
  return reply.send({
    data,
    summary: {
      avgPerDay,
      trend: 'up' as const,
      trendPercentage: 12.3,
    },
  })
})

// ============================================================================
// MOCK NPS / SATISFACTION SURVEY ENDPOINTS
// ============================================================================

const getNPSCategory = (score: number) => score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor'

const mockNPSSurveys: any[] = [
  { id: 'nps-1', companyId: 'default-company', associadoId: '1', associadoName: 'Joao Silva', score: 10, category: 'promoter', comment: 'Excelente protecao! Me sinto seguro com a 21Go. Recomendo demais.', channel: 'whatsapp', sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-2', companyId: 'default-company', associadoId: '2', associadoName: 'Maria Santos', score: 9, category: 'promoter', comment: 'Otimo custo-beneficio. Guincho chegou rapido quando precisei.', channel: 'email', sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-3', companyId: 'default-company', associadoId: '3', associadoName: 'Pedro Oliveira', score: 7, category: 'passive', comment: 'Protecao boa, mas a vistoria demorou mais do que o esperado.', channel: 'whatsapp', sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-4', companyId: 'default-company', associadoId: '4', associadoName: 'Ana Costa', score: 10, category: 'promoter', comment: 'Ja indiquei pra 5 amigos! Melhor protecao veicular do RJ.', channel: 'sms', sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 1800000).toISOString(), createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-5', companyId: 'default-company', associadoId: '5', associadoName: 'Carlos Ferreira', score: 5, category: 'detractor', comment: 'Demorou muito pra resolver meu sinistro. Comunicacao ruim.', channel: 'email', sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-6', companyId: 'default-company', associadoId: '1', associadoName: 'Joao Silva', score: 8, category: 'passive', comment: 'Bom no geral. Poderia ter mais opcoes de plano.', channel: 'whatsapp', sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 5400000).toISOString(), createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-7', companyId: 'default-company', associadoId: '2', associadoName: 'Maria Santos', score: 9, category: 'promoter', comment: null, channel: 'in_app', sentAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 900000).toISOString(), createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-8', companyId: 'default-company', associadoId: '3', associadoName: 'Pedro Oliveira', score: 3, category: 'detractor', comment: 'Cobranca do rateio veio errada e ninguem resolveu rapido.', channel: 'email', sentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-9', companyId: 'default-company', associadoId: '4', associadoName: 'Ana Costa', score: 10, category: 'promoter', comment: 'Melhor custo-beneficio do mercado! 21Go e top.', channel: 'whatsapp', sentAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000 + 2700000).toISOString(), createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-10', companyId: 'default-company', associadoId: '5', associadoName: 'Carlos Ferreira', score: 9, category: 'promoter', comment: 'Atendimento excelente. Recomendo!', channel: 'sms', sentAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000 + 4500000).toISOString(), createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
  // Pesquisas nao respondidas
  { id: 'nps-11', companyId: 'default-company', associadoId: '4', associadoName: 'Ana Costa', score: 0, category: 'detractor', comment: null, channel: 'whatsapp', sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: null, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-12', companyId: 'default-company', associadoId: '5', associadoName: 'Carlos Ferreira', score: 0, category: 'detractor', comment: null, channel: 'email', sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: null, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
]

// GET /api/nps
fastify.get('/api/nps', async (request, reply) => {
  console.log('[MOCK] GET /api/nps')
  const query = request.query as any
  let filtered = [...mockNPSSurveys]
  if (query.associadoId) filtered = filtered.filter((s) => s.associadoId === query.associadoId)
  if (query.category) filtered = filtered.filter((s) => s.category === query.category)
  if (query.answered === 'true') filtered = filtered.filter((s) => s.answeredAt !== null)
  if (query.answered === 'false') filtered = filtered.filter((s) => s.answeredAt === null)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return reply.send(filtered)
})

// GET /api/nps/stats
fastify.get('/api/nps/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/nps/stats')
  const answered = mockNPSSurveys.filter((s) => s.answeredAt !== null)
  const promoters = answered.filter((s) => s.category === 'promoter')
  const passives = answered.filter((s) => s.category === 'passive')
  const detractors = answered.filter((s) => s.category === 'detractor')
  const npsScore = answered.length > 0
    ? Math.round(((promoters.length - detractors.length) / answered.length) * 100)
    : 0
  const avgScore = answered.length > 0
    ? Number((answered.reduce((sum, s) => sum + s.score, 0) / answered.length).toFixed(1))
    : 0

  // By month (last 6 months)
  const byMonth: any[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    const monthSurveys = answered.filter((s) => s.answeredAt?.startsWith(monthKey))
    const mPromoters = monthSurveys.filter((s) => s.category === 'promoter').length
    const mDetractors = monthSurveys.filter((s) => s.category === 'detractor').length
    const mNps = monthSurveys.length > 0 ? Math.round(((mPromoters - mDetractors) / monthSurveys.length) * 100) : 0
    byMonth.push({ month: monthLabel, nps: mNps, responses: monthSurveys.length })
  }

  // Recent comments
  const recentComments = answered
    .filter((s) => s.comment)
    .slice(0, 10)
    .map((s) => ({
      id: s.id,
      associadoName: s.associadoName,
      score: s.score,
      category: s.category,
      comment: s.comment,
      date: s.answeredAt,
    }))

  return reply.send({
    total: mockNPSSurveys.length,
    answered: answered.length,
    responseRate: mockNPSSurveys.length > 0 ? Math.round((answered.length / mockNPSSurveys.length) * 100) : 0,
    promoters: promoters.length,
    passives: passives.length,
    detractors: detractors.length,
    npsScore,
    avgScore,
    byMonth,
    recentComments,
  })
})

// POST /api/nps
fastify.post('/api/nps', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/nps', data)
  const associado = mockContacts.find((c) => c.id === data.associadoId)
  const survey = {
    id: `nps-${Date.now()}`,
    companyId: 'default-company',
    associadoId: data.associadoId,
    associadoName: associado ? associado.fullName : 'Associado',
    score: data.score,
    category: getNPSCategory(data.score),
    comment: data.comment || null,
    channel: data.channel || 'manual',
    sentAt: new Date().toISOString(),
    answeredAt: data.score > 0 ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
  }
  mockNPSSurveys.push(survey)
  return reply.status(201).send(survey)
})

// POST /api/nps/send-batch
fastify.post('/api/nps/send-batch', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/nps/send-batch', data)
  const created: any[] = []
  for (const associadoId of (data.associadoIds || [])) {
    const associado = mockContacts.find((c) => c.id === associadoId)
    const survey = {
      id: `nps-${Date.now()}-${associadoId}`,
      companyId: 'default-company',
      associadoId,
      associadoName: associado ? associado.fullName : 'Associado',
      score: 0, category: 'detractor' as const,
      comment: null, channel: data.channel || 'whatsapp',
      sentAt: new Date().toISOString(), answeredAt: null,
      createdAt: new Date().toISOString(),
    }
    mockNPSSurveys.push(survey)
    created.push(survey)
  }
  return reply.send({ sent: created.length, surveys: created })
})

// DELETE /api/nps/:id
fastify.delete('/api/nps/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockNPSSurveys.findIndex((s) => s.id === id)
  if (index !== -1) mockNPSSurveys.splice(index, 1)
  return reply.send({ success: true })
})

// ============================================================================
// MOCK PROJECTS (KANBAN) API
// ============================================================================

const mockProjects: any[] = [
  {
    id: 'proj-1',
    title: 'Squad 21Go criada (8 agentes)',
    description: 'Configuracao completa da squad de agentes IA: Chief, Pre-Venda, Pos-Venda, Gestores, Retencao, Crescimento, Trafego, Operacao. Todos com prompts especializados e permissoes configuradas.',
    status: 'done',
    priority: 'alta',
    tags: ['IA'],
    assignee: 'FlowAI',
    dueDate: '2026-03-10',
    progress: 100,
    companyId: 'default-company',
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-03-10T15:00:00Z',
  },
  {
    id: 'proj-2',
    title: 'Instalar agentes no CRM',
    description: 'Integrar os 8 agentes 21Go Squad no backend do CRM com endpoints de query, analytics e gerenciamento. Incluir knowledge base e documentos de treinamento.',
    status: 'done',
    priority: 'alta',
    tags: ['IA', 'backend'],
    assignee: 'FlowAI',
    dueDate: '2026-03-15',
    progress: 100,
    companyId: 'default-company',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-15T18:00:00Z',
  },
  {
    id: 'proj-3',
    title: 'Remover modulos de saude',
    description: 'Limpar todos os modulos relacionados a clinicas medicas (Doctor, Convenio, Appointment, MedicalRecord). Substituir por contexto de protecao veicular.',
    status: 'doing',
    priority: 'alta',
    tags: ['cleanup'],
    assignee: 'FlowAI',
    dueDate: '2026-03-20',
    progress: 65,
    companyId: 'default-company',
    createdAt: '2026-03-12T08:00:00Z',
    updatedAt: '2026-03-19T10:00:00Z',
  },
  {
    id: 'proj-4',
    title: 'Adaptar Contacts para Associados',
    description: 'Renomear e adaptar o modulo Contacts para Associados com campos especificos: CPF, status de adesao, plano, veiculo vinculado, NPS, MGM.',
    status: 'todo',
    priority: 'alta',
    tags: ['backend'],
    assignee: 'FlowAI',
    dueDate: '2026-03-25',
    progress: 0,
    companyId: 'default-company',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'proj-5',
    title: 'Criar modulo Veiculos',
    description: 'CRUD completo de veiculos: placa, marca, modelo, ano, FIPE, plano de protecao, status de vistoria, rastreador. Vincular com associado.',
    status: 'todo',
    priority: 'alta',
    tags: ['backend'],
    assignee: 'FlowAI',
    dueDate: '2026-03-28',
    progress: 0,
    companyId: 'default-company',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'proj-6',
    title: 'Motor de cotacao FIPE',
    description: 'Integrar tabela FIPE para cotacao automatica. Calcular valor de protecao baseado em marca, modelo, ano e regiao. API publica + landing page.',
    status: 'backlog',
    priority: 'alta',
    tags: ['backend', 'FIPE'],
    assignee: null,
    dueDate: '2026-04-10',
    progress: 0,
    companyId: 'default-company',
    createdAt: '2026-03-18T10:00:00Z',
    updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'proj-7',
    title: 'Landing page com cotacao',
    description: 'Criar landing page otimizada para SEO com formulario de cotacao integrado. Lead capture automatico com UTM tracking.',
    status: 'backlog',
    priority: 'alta',
    tags: ['frontend', 'SEO'],
    assignee: null,
    dueDate: '2026-04-15',
    progress: 0,
    companyId: 'default-company',
    createdAt: '2026-03-18T10:00:00Z',
    updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'proj-8',
    title: 'Integracao WhatsApp API',
    description: 'Integrar WhatsApp Business API para envio e recebimento de mensagens. Chatbot com agentes IA. Notificacoes automaticas.',
    status: 'backlog',
    priority: 'alta',
    tags: ['integracao'],
    assignee: null,
    dueDate: '2026-04-20',
    progress: 0,
    companyId: 'default-company',
    createdAt: '2026-03-18T10:00:00Z',
    updatedAt: '2026-03-18T10:00:00Z',
  },
  {
    id: 'proj-9',
    title: 'Design system sofisticado',
    description: 'Implementar design system dark luxuoso com dourado 21Go. Tipografia Outfit + DM Sans. Glassmorphism, micro-interacoes, animacoes suaves.',
    status: 'doing',
    priority: 'alta',
    tags: ['design'],
    assignee: 'FlowAI',
    dueDate: '2026-03-19',
    progress: 80,
    companyId: 'default-company',
    createdAt: '2026-03-19T08:00:00Z',
    updatedAt: '2026-03-19T14:00:00Z',
  },
  {
    id: 'proj-10',
    title: 'App mobile operacao',
    description: 'App mobile para equipe de campo: vistoria com fotos, checklist de inspecao, assinatura digital, sincronizacao offline.',
    status: 'backlog',
    priority: 'media',
    tags: ['mobile'],
    assignee: null,
    dueDate: '2026-05-01',
    progress: 0,
    companyId: 'default-company',
    createdAt: '2026-03-18T10:00:00Z',
    updatedAt: '2026-03-18T10:00:00Z',
  },
]

// GET /api/projects
fastify.get('/api/projects', async (request, reply) => {
  console.log('[MOCK] GET /api/projects')
  const { status, priority, assignee, tag, search } = request.query as any

  let filtered = [...mockProjects]

  if (status) {
    filtered = filtered.filter((p) => p.status === status)
  }
  if (priority) {
    filtered = filtered.filter((p) => p.priority === priority)
  }
  if (assignee) {
    filtered = filtered.filter((p) => p.assignee === assignee)
  }
  if (tag) {
    filtered = filtered.filter((p) => p.tags.includes(tag))
  }
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter((p: any) =>
      p.title.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s)
    )
  }

  return reply.send({
    data: filtered,
    stats: {
      backlog: mockProjects.filter((p) => p.status === 'backlog').length,
      todo: mockProjects.filter((p) => p.status === 'todo').length,
      doing: mockProjects.filter((p) => p.status === 'doing').length,
      review: mockProjects.filter((p) => p.status === 'review').length,
      done: mockProjects.filter((p) => p.status === 'done').length,
      total: mockProjects.length,
    },
  })
})

// GET /api/projects/:id
fastify.get('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const project = mockProjects.find((p) => p.id === id)
  if (!project) return reply.status(404).send({ message: 'Projeto nao encontrado' })
  return reply.send(project)
})

// POST /api/projects
fastify.post('/api/projects', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/projects', data)
  const project = {
    id: `proj-${Date.now()}`,
    title: data.title,
    description: data.description || '',
    status: data.status || 'backlog',
    priority: data.priority || 'media',
    tags: data.tags || [],
    assignee: data.assignee || null,
    dueDate: data.dueDate || null,
    progress: data.progress || 0,
    companyId: 'default-company',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  mockProjects.push(project)
  return reply.status(201).send(project)
})

// PUT /api/projects/:id
fastify.put('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  console.log('[MOCK] PUT /api/projects/' + id, data)
  const index = mockProjects.findIndex((p) => p.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Projeto nao encontrado' })

  mockProjects[index] = {
    ...mockProjects[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  return reply.send(mockProjects[index])
})

// DELETE /api/projects/:id
fastify.delete('/api/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockProjects.findIndex((p) => p.id === id)
  if (index !== -1) mockProjects.splice(index, 1)
  return reply.send({ success: true })
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3333, host: '0.0.0.0' })

    console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   🚀 MOCK BACKEND - RUNNING                      ║
    ║                                                   ║
    ║   📍 Server: http://localhost:3333               ║
    ║   🏥 Health: http://localhost:3333/health        ║
    ║                                                   ║
    ║   ⚠️  MODO MOCK - SEM BANCO DE DADOS             ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    `)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
