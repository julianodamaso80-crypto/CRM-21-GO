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
// MOCK CONVENIOS (Health Insurance)
// ============================================================================

const mockConvenios: any[] = [
  {
    id: 'conv-1', companyId: 'default-company', name: 'Unimed', code: '001',
    phone: '(11) 3003-3001', email: 'convenios@unimed.com.br', website: 'https://unimed.com.br',
    contactPerson: 'Carlos Mendes', notes: 'Tabela propria', isActive: true, patientCount: 3,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-2', companyId: 'default-company', name: 'Amil', code: '002',
    phone: '(11) 4004-4002', email: 'credenciamento@amil.com.br', website: 'https://amil.com.br',
    contactPerson: null, notes: null, isActive: true, patientCount: 1,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-3', companyId: 'default-company', name: 'SulAmerica', code: '003',
    phone: '(11) 4004-4003', email: null, website: null,
    contactPerson: 'Ana Beatriz', notes: 'Atendimento somente eletivo', isActive: true, patientCount: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-4', companyId: 'default-company', name: 'Bradesco Saude', code: '004',
    phone: null, email: null, website: null,
    contactPerson: null, notes: null, isActive: false, patientCount: 0,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

// GET /api/convenios
fastify.get('/api/convenios', async (request, reply) => {
  console.log('[MOCK] GET /api/convenios')
  return reply.send(mockConvenios)
})

// GET /api/convenios/:id
fastify.get('/api/convenios/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const c = mockConvenios.find((x) => x.id === id)
  if (!c) return reply.status(404).send({ message: 'Convenio not found' })
  return reply.send(c)
})

// POST /api/convenios
fastify.post('/api/convenios', async (request, reply) => {
  const data = request.body as any
  const c = {
    id: `conv-${Date.now()}`, companyId: 'default-company',
    ...data, isActive: true, patientCount: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockConvenios.push(c)
  return reply.status(201).send(c)
})

// PUT /api/convenios/:id
fastify.put('/api/convenios/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockConvenios.findIndex((x) => x.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Convenio not found' })
  mockConvenios[index] = { ...mockConvenios[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockConvenios[index])
})

// DELETE /api/convenios/:id
fastify.delete('/api/convenios/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockConvenios.findIndex((x) => x.id === id)
  if (index !== -1) mockConvenios.splice(index, 1)
  return reply.send({ success: true })
})

// ============================================================================
// MOCK DOCTORS
// ============================================================================

const mockDoctors: any[] = [
  {
    id: 'doc-1', companyId: 'default-company',
    firstName: 'Ricardo', lastName: 'Mendes', fullName: 'Dr. Ricardo Mendes',
    email: 'ricardo@clinica.com', phone: '(11) 99999-1111',
    crm: '123456', crmState: 'SP', specialty: 'cardiologia', specialtyOther: null,
    avatar: null, consultationDuration: 30, consultationPrice: 350,
    bio: 'Cardiologista com 15 anos de experiencia', isActive: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-2', companyId: 'default-company',
    firstName: 'Ana', lastName: 'Ferreira', fullName: 'Dra. Ana Ferreira',
    email: 'ana@clinica.com', phone: '(11) 99999-2222',
    crm: '654321', crmState: 'SP', specialty: 'dermatologia', specialtyOther: null,
    avatar: null, consultationDuration: 20, consultationPrice: 280,
    bio: 'Especialista em dermatologia clinica e estetica', isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-3', companyId: 'default-company',
    firstName: 'Carlos', lastName: 'Souza', fullName: 'Dr. Carlos Souza',
    email: 'carlos@clinica.com', phone: '(11) 99999-3333',
    crm: '789012', crmState: 'RJ', specialty: 'clinico_geral', specialtyOther: null,
    avatar: null, consultationDuration: 25, consultationPrice: 200,
    bio: null, isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-4', companyId: 'default-company',
    firstName: 'Beatriz', lastName: 'Lima', fullName: 'Dra. Beatriz Lima',
    email: null, phone: '(11) 99999-4444',
    crm: '345678', crmState: 'SP', specialty: 'pediatria', specialtyOther: null,
    avatar: null, consultationDuration: 30, consultationPrice: 300,
    bio: 'Pediatra e neonatologista', isActive: false,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

const SPECIALTIES_MAP: Record<string, string> = {
  clinico_geral: 'Clinico Geral', cardiologia: 'Cardiologia', dermatologia: 'Dermatologia',
  ginecologia: 'Ginecologia', neurologia: 'Neurologia', oftalmologia: 'Oftalmologia',
  ortopedia: 'Ortopedia', pediatria: 'Pediatria', psiquiatria: 'Psiquiatria',
  urologia: 'Urologia', endocrinologia: 'Endocrinologia', gastroenterologia: 'Gastroenterologia',
  otorrinolaringologia: 'Otorrinolaringologia', cirurgia_geral: 'Cirurgia Geral', outro: 'Outro',
}

// GET /api/doctors
fastify.get('/api/doctors', async (request, reply) => {
  console.log('[MOCK] GET /api/doctors')
  return reply.send(mockDoctors)
})

// GET /api/doctors/specialties
fastify.get('/api/doctors/specialties', async (request, reply) => {
  return reply.send(SPECIALTIES_MAP)
})

// GET /api/doctors/:id
fastify.get('/api/doctors/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const d = mockDoctors.find((x) => x.id === id)
  if (!d) return reply.status(404).send({ message: 'Doctor not found' })
  return reply.send(d)
})

// POST /api/doctors
fastify.post('/api/doctors', async (request, reply) => {
  const data = request.body as any
  const d = {
    id: `doc-${Date.now()}`, companyId: 'default-company',
    fullName: `Dr(a). ${data.firstName} ${data.lastName}`,
    ...data, avatar: null, isActive: true,
    consultationDuration: data.consultationDuration || 30,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockDoctors.push(d)
  return reply.status(201).send(d)
})

// PUT /api/doctors/:id
fastify.put('/api/doctors/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockDoctors.findIndex((x) => x.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Doctor not found' })
  if (data.firstName || data.lastName) {
    data.fullName = `Dr(a). ${data.firstName ?? mockDoctors[index].firstName} ${data.lastName ?? mockDoctors[index].lastName}`
  }
  mockDoctors[index] = { ...mockDoctors[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockDoctors[index])
})

// DELETE /api/doctors/:id
fastify.delete('/api/doctors/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockDoctors.findIndex((x) => x.id === id)
  if (index !== -1) mockDoctors.splice(index, 1)
  return reply.send({ success: true })
})

// ============================================================================
// MOCK PATIENTS API
// ============================================================================

// GET /api/patients (lista de pacientes)
fastify.get('/api/patients', async (request, reply) => {
  console.log('[MOCK] GET /api/patients')
  const { search, page = '1', limit = '10' } = request.query as any

  let filtered = [...mockContacts]

  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter((p: any) =>
      p.fullName?.toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s) ||
      p.phone?.includes(s) ||
      p.cpf?.includes(s)
    )
  }

  const total = filtered.length
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const offset = (pageNum - 1) * limitNum
  const paged = filtered.slice(offset, offset + limitNum)

  return reply.send({
    data: paged,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  })
})

// GET /api/patients/stats
fastify.get('/api/patients/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/patients/stats')
  return reply.send({
    total: mockContacts.length,
    active: mockContacts.filter((p: any) => p.lastVisitAt).length,
    newThisMonth: mockContacts.filter((p: any) => {
      const created = new Date(p.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
    withUpcomingAppointments: mockContacts.filter((p: any) => p.nextVisitAt).length,
  })
})

// GET /api/patients/:id
fastify.get('/api/patients/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] GET /api/patients/:id', { id })
  const patient = mockContacts.find((p: any) => p.id === id)
  if (!patient) return reply.status(404).send({ message: 'Patient not found' })
  return reply.send(patient)
})

// POST /api/patients
fastify.post('/api/patients', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/patients', { name: data.firstName })
  const patient = {
    id: `patient-${Date.now()}`,
    companyId: 'default-company',
    fullName: `${data.firstName} ${data.lastName}`,
    ...data,
    avatar: null,
    tags: data.tags || [],
    customFields: data.customFields || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 0 },
  }
  mockContacts.push(patient)
  return reply.status(201).send(patient)
})

// PUT /api/patients/:id
fastify.put('/api/patients/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  console.log('[MOCK] PUT /api/patients/:id', { id })
  const index = mockContacts.findIndex((p: any) => p.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Patient not found' })

  if (data.firstName || data.lastName) {
    data.fullName = `${data.firstName ?? mockContacts[index].firstName} ${data.lastName ?? mockContacts[index].lastName}`
  }

  mockContacts[index] = {
    ...mockContacts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  return reply.send(mockContacts[index])
})

// DELETE /api/patients/:id
fastify.delete('/api/patients/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  console.log('[MOCK] DELETE /api/patients/:id', { id })
  const index = mockContacts.findIndex((p: any) => p.id === id)
  if (index !== -1) mockContacts.splice(index, 1)
  return reply.send({ success: true })
})

// ============================================================================
// MOCK PATIENTS (Contacts with medical data)
// ============================================================================

const mockContacts: any[] = [
  {
    id: '1', companyId: 'default-company',
    firstName: 'Joao', lastName: 'Silva', fullName: 'Joao Silva',
    email: 'joao@exemplo.com', phone: '(11) 98765-4321', avatar: null,
    whatsapp: '(11) 98765-4321', instagram: null,
    address: 'Rua das Flores, 123', city: 'Sao Paulo', state: 'SP', country: 'BR', zipCode: '01234-567',
    cpf: '123.456.789-00', dateOfBirth: '1985-03-15', gender: 'male', bloodType: 'O+',
    allergies: 'Dipirona', medicalNotes: 'Historico de hipertensao',
    convenioId: 'conv-1', convenioName: 'Unimed', convenioNumber: 'UNI-12345',
    responsibleName: null, responsiblePhone: null,
    preferredDoctorId: 'doc-1', preferredDoctorName: 'Dr. Ricardo Mendes',
    lastVisitAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextVisitAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['hipertenso', 'retorno-pendente'], customFields: {},
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 3 },
  },
  {
    id: '2', companyId: 'default-company',
    firstName: 'Maria', lastName: 'Santos', fullName: 'Maria Santos',
    email: 'maria@exemplo.com', phone: '(11) 91234-5678', avatar: null,
    whatsapp: '(11) 91234-5678', instagram: null,
    address: 'Av. Brasil, 456', city: 'Sao Paulo', state: 'SP', country: 'BR', zipCode: '04567-890',
    cpf: '987.654.321-00', dateOfBirth: '1992-07-22', gender: 'female', bloodType: 'A+',
    allergies: null, medicalNotes: null,
    convenioId: 'conv-1', convenioName: 'Unimed', convenioNumber: 'UNI-67890',
    responsibleName: null, responsiblePhone: null,
    preferredDoctorId: 'doc-2', preferredDoctorName: 'Dra. Ana Ferreira',
    lastVisitAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nextVisitAt: null,
    tags: ['dermatologia'], customFields: {},
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 1 },
  },
  {
    id: '3', companyId: 'default-company',
    firstName: 'Pedro', lastName: 'Oliveira', fullName: 'Pedro Oliveira',
    email: 'pedro@empresa.com', phone: '(11) 93456-7890', avatar: null,
    whatsapp: '(11) 93456-7890', instagram: null,
    address: null, city: 'Campinas', state: 'SP', country: 'BR', zipCode: null,
    cpf: '456.789.123-00', dateOfBirth: '1978-11-05', gender: 'male', bloodType: 'B-',
    allergies: 'Penicilina, Latex', medicalNotes: 'Diabetico tipo 2',
    convenioId: 'conv-2', convenioName: 'Amil', convenioNumber: 'AMI-11111',
    responsibleName: null, responsiblePhone: null,
    preferredDoctorId: 'doc-3', preferredDoctorName: 'Dr. Carlos Souza',
    lastVisitAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    nextVisitAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['diabetico', 'alergia'], customFields: {},
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 0 },
  },
  {
    id: '4', companyId: 'default-company',
    firstName: 'Ana', lastName: 'Costa', fullName: 'Ana Costa',
    email: null, phone: '(11) 94567-8901', avatar: null,
    whatsapp: '(11) 94567-8901', instagram: null,
    address: null, city: 'Sao Paulo', state: 'SP', country: 'BR', zipCode: null,
    cpf: '321.654.987-00', dateOfBirth: '2018-02-10', gender: 'female', bloodType: 'AB+',
    allergies: null, medicalNotes: 'Paciente pediatrica',
    convenioId: 'conv-1', convenioName: 'Unimed', convenioNumber: 'UNI-99999',
    responsibleName: 'Lucia Costa', responsiblePhone: '(11) 94567-8901',
    preferredDoctorId: null, preferredDoctorName: null,
    lastVisitAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextVisitAt: null,
    tags: ['pediatria'], customFields: {},
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 0 },
  },
  {
    id: '5', companyId: 'default-company',
    firstName: 'Roberto', lastName: 'Almeida', fullName: 'Roberto Almeida',
    email: 'roberto@email.com', phone: '(11) 95678-9012', avatar: null,
    whatsapp: null, instagram: null,
    address: 'Rua Augusta, 789', city: 'Sao Paulo', state: 'SP', country: 'BR', zipCode: '01305-000',
    cpf: '654.321.987-00', dateOfBirth: '1960-09-20', gender: 'male', bloodType: 'O-',
    allergies: null, medicalNotes: 'Acompanhamento cardiologico trimestral',
    convenioId: 'conv-3', convenioName: 'SulAmerica', convenioNumber: 'SUL-55555',
    responsibleName: null, responsiblePhone: null,
    preferredDoctorId: 'doc-1', preferredDoctorName: 'Dr. Ricardo Mendes',
    lastVisitAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    nextVisitAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['cardiologia', 'idoso', 'retorno-pendente'], customFields: {},
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
    _count: { leads: 0, deals: 0, conversations: 2 },
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

  return reply.send({
    data: mockContacts,
    pagination: {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
      total: mockContacts.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  })
})

// GET /api/contacts/stats
fastify.get('/api/contacts/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/contacts/stats called')

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  return reply.send({
    total: mockContacts.length,
    withEmail: mockContacts.filter((c: any) => c.email).length,
    withPhone: mockContacts.filter((c: any) => c.phone).length,
    withConvenio: mockContacts.filter((c: any) => c.convenioId).length,
    withAllergies: mockContacts.filter((c: any) => c.allergies).length,
    pendingReturn: mockContacts.filter((c: any) => c.nextVisitAt && new Date(c.nextVisitAt).getTime() <= now + 7 * 24 * 60 * 60 * 1000).length,
    recentCount: mockContacts.filter((c: any) => new Date(c.createdAt).getTime() > thirtyDaysAgo).length,
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

  return reply.send({
    ...contact,
    leads: [],
    deals: [],
    conversations: [],
    activities: [],
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
// MOCK LEADS ENDPOINTS
// ============================================================================

const mockLeads: any[] = [
  {
    id: 'lead-1', companyId: 'default-company', contactId: '1',
    contact: { id: '1', firstName: 'João', lastName: 'Silva', fullName: 'João Silva', email: 'joao@exemplo.com', phone: '(11) 98765-4321' },
    title: 'Tubos de aço inoxidável - Empresa ABC',
    description: 'Cliente interessado em tubos para projeto industrial',
    status: 'qualified', score: 75, source: 'website', medium: 'organic', campaign: null,
    assignedToId: 'user-1', assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' },
    estimatedValue: 45000, convertedToDealId: null, convertedAt: null,
    tags: ['industria', 'tubos'], customFields: {},
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-2', companyId: 'default-company', contactId: '2',
    contact: { id: '2', firstName: 'Maria', lastName: 'Santos', fullName: 'Maria Santos', email: 'maria@exemplo.com', phone: '(11) 91234-5678' },
    title: 'Conexões para gasoduto - Tech Solutions',
    description: 'Projeto de grande porte, conexões especiais',
    status: 'contacted', score: 50, source: 'referral', medium: null, campaign: null,
    assignedToId: null, assignedTo: null,
    estimatedValue: 120000, convertedToDealId: null, convertedAt: null,
    tags: ['conexões', 'grande-porte'], customFields: {},
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-3', companyId: 'default-company', contactId: '3',
    contact: { id: '3', firstName: 'Pedro', lastName: 'Oliveira', fullName: 'Pedro Oliveira', email: 'pedro@empresa.com', phone: null },
    title: 'Válvulas industriais - Orçamento',
    description: null,
    status: 'new', score: 20, source: 'whatsapp', medium: null, campaign: null,
    assignedToId: null, assignedTo: null,
    estimatedValue: null, convertedToDealId: null, convertedAt: null,
    tags: [], customFields: {},
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-4', companyId: 'default-company', contactId: '1',
    contact: { id: '1', firstName: 'João', lastName: 'Silva', fullName: 'João Silva', email: 'joao@exemplo.com', phone: '(11) 98765-4321' },
    title: 'Expansão projeto tubulação - Fase 2',
    description: 'Continuação do projeto anterior',
    status: 'new', score: 60, source: 'manual', medium: null, campaign: null,
    assignedToId: 'user-1', assignedTo: { id: 'user-1', firstName: 'Admin', lastName: 'Sistema' },
    estimatedValue: 85000, convertedToDealId: null, convertedAt: null,
    tags: ['tubos', 'expansao'], customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lead-5', companyId: 'default-company', contactId: '2',
    contact: { id: '2', firstName: 'Maria', lastName: 'Santos', fullName: 'Maria Santos', email: 'maria@exemplo.com', phone: '(11) 91234-5678' },
    title: 'Campanha Google Ads - Válvulas',
    description: 'Lead captado por campanha paga',
    status: 'unqualified', score: 10, source: 'website', medium: 'paid', campaign: 'google-ads-valvulas',
    assignedToId: null, assignedTo: null,
    estimatedValue: 5000, convertedToDealId: null, convertedAt: null,
    tags: ['ads'], customFields: {},
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
  const byStatus: Record<string, number> = { new: 0, contacted: 0, qualified: 0, unqualified: 0 }
  const bySource: Record<string, number> = { website: 0, whatsapp: 0, instagram: 0, referral: 0, manual: 0 }
  mockLeads.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1
    bySource[l.source] = (bySource[l.source] || 0) + 1
  })
  const converted = mockLeads.filter((l) => l.convertedToDealId).length
  const totalValue = mockLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
  return reply.send({
    total: mockLeads.length,
    byStatus,
    bySource,
    conversionRate: mockLeads.length > 0 ? Math.round((converted / mockLeads.length) * 100) : 0,
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
    contact: contact ? { id: contact.id, firstName: contact.firstName, lastName: contact.lastName, fullName: contact.fullName, email: contact.email, phone: contact.phone } : null,
    title: data.title, description: data.description || null,
    status: 'new', score: 0, source: data.source || 'manual',
    medium: data.medium || null, campaign: data.campaign || null,
    assignedToId: data.assignedToId || null, assignedTo: null,
    estimatedValue: data.estimatedValue || null,
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

const mockAgents: any[] = [
  {
    id: 'agent-1',
    companyId: 'default-company',
    name: 'Assistente de Vendas',
    description: 'Responde perguntas sobre produtos e processos de venda',
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'Voce e um assistente de vendas especializado. Responda perguntas sobre produtos, precos e processos.',
    allowedScopes: ['contacts', 'deals'],
    canCreateLeads: true,
    canUpdateLeads: false,
    canCreateDeals: false,
    canTransferToHuman: true,
    type: 'internal',
    knowledgeBaseId: 'kb-1',
    knowledgeBase: { id: 'kb-1', name: 'Base de Vendas', collectionName: 'kb_default-company_kb-1' },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

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
// MOCK APPOINTMENTS ENDPOINTS
// ============================================================================

const APPOINTMENT_TYPES_MAP: Record<string, string> = {
  first_visit: 'Primeira Consulta',
  return: 'Retorno',
  exam: 'Exame',
  procedure: 'Procedimento',
  consultation: 'Consulta',
  emergency: 'Emergencia',
}

const today = new Date()
const todayStr = today.toISOString().split('T')[0]
const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const dayAfterStr = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const threeDaysStr = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const mockAppointments: any[] = [
  {
    id: 'apt-1', companyId: 'default-company',
    patientId: '1', patient: { id: '1', fullName: 'Joao Silva', phone: '(11) 98765-4321', email: 'joao@exemplo.com', convenioName: 'Unimed', convenioNumber: 'UNI-12345' },
    doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes', specialty: 'cardiologia', crm: '123456' },
    type: 'return', status: 'confirmed', date: todayStr, startTime: '09:00', endTime: '09:30', duration: 30,
    notes: 'Retorno cardiologico - verificar pressao', cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-1', convenioName: 'Unimed', price: 350, isPaid: false, room: 'Sala 1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-2', companyId: 'default-company',
    patientId: '2', patient: { id: '2', fullName: 'Maria Santos', phone: '(11) 91234-5678', email: 'maria@exemplo.com', convenioName: 'Unimed', convenioNumber: 'UNI-67890' },
    doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira', specialty: 'dermatologia', crm: '654321' },
    type: 'consultation', status: 'scheduled', date: todayStr, startTime: '10:00', endTime: '10:20', duration: 20,
    notes: null, cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-1', convenioName: 'Unimed', price: 280, isPaid: false, room: 'Sala 2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-3', companyId: 'default-company',
    patientId: '3', patient: { id: '3', fullName: 'Pedro Oliveira', phone: '(11) 93456-7890', email: 'pedro@empresa.com', convenioName: 'Amil', convenioNumber: 'AMI-11111' },
    doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza', specialty: 'clinico_geral', crm: '789012' },
    type: 'return', status: 'confirmed', date: todayStr, startTime: '11:00', endTime: '11:25', duration: 25,
    notes: 'Acompanhamento diabetes', cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-2', convenioName: 'Amil', price: 200, isPaid: false, room: 'Sala 1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-4', companyId: 'default-company',
    patientId: '5', patient: { id: '5', fullName: 'Roberto Almeida', phone: '(11) 95678-9012', email: 'roberto@email.com', convenioName: 'SulAmerica', convenioNumber: 'SUL-55555' },
    doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes', specialty: 'cardiologia', crm: '123456' },
    type: 'exam', status: 'scheduled', date: todayStr, startTime: '14:00', endTime: '14:30', duration: 30,
    notes: 'Eletrocardiograma + ecocardiograma', cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-3', convenioName: 'SulAmerica', price: 350, isPaid: false, room: 'Sala Exames',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-5', companyId: 'default-company',
    patientId: '4', patient: { id: '4', fullName: 'Ana Costa', phone: '(11) 94567-8901', email: null, convenioName: 'Unimed', convenioNumber: 'UNI-99999' },
    doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza', specialty: 'clinico_geral', crm: '789012' },
    type: 'first_visit', status: 'confirmed', date: tomorrowStr, startTime: '08:30', endTime: '09:00', duration: 30,
    notes: 'Primeira consulta - paciente pediatrica', cancellationReason: null,
    isFirstVisit: true, convenioId: 'conv-1', convenioName: 'Unimed', price: 200, isPaid: false, room: 'Sala 3',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-6', companyId: 'default-company',
    patientId: '1', patient: { id: '1', fullName: 'Joao Silva', phone: '(11) 98765-4321', email: 'joao@exemplo.com', convenioName: 'Unimed', convenioNumber: 'UNI-12345' },
    doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira', specialty: 'dermatologia', crm: '654321' },
    type: 'consultation', status: 'scheduled', date: tomorrowStr, startTime: '10:00', endTime: '10:20', duration: 20,
    notes: null, cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-1', convenioName: 'Unimed', price: 280, isPaid: false, room: 'Sala 2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-7', companyId: 'default-company',
    patientId: '2', patient: { id: '2', fullName: 'Maria Santos', phone: '(11) 91234-5678', email: 'maria@exemplo.com', convenioName: 'Unimed', convenioNumber: 'UNI-67890' },
    doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes', specialty: 'cardiologia', crm: '123456' },
    type: 'return', status: 'scheduled', date: dayAfterStr, startTime: '09:00', endTime: '09:30', duration: 30,
    notes: null, cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-1', convenioName: 'Unimed', price: 350, isPaid: false, room: 'Sala 1',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-8', companyId: 'default-company',
    patientId: '3', patient: { id: '3', fullName: 'Pedro Oliveira', phone: '(11) 93456-7890', email: 'pedro@empresa.com', convenioName: 'Amil', convenioNumber: 'AMI-11111' },
    doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira', specialty: 'dermatologia', crm: '654321' },
    type: 'procedure', status: 'scheduled', date: threeDaysStr, startTime: '14:00', endTime: '15:00', duration: 60,
    notes: 'Remocao de nevos', cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-2', convenioName: 'Amil', price: 500, isPaid: false, room: 'Sala Procedimentos',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-9', companyId: 'default-company',
    patientId: '5', patient: { id: '5', fullName: 'Roberto Almeida', phone: '(11) 95678-9012', email: 'roberto@email.com', convenioName: 'SulAmerica', convenioNumber: 'SUL-55555' },
    doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes', specialty: 'cardiologia', crm: '123456' },
    type: 'return', status: 'completed', date: yesterdayStr, startTime: '10:00', endTime: '10:30', duration: 30,
    notes: 'Paciente estavel, manter medicacao', cancellationReason: null,
    isFirstVisit: false, convenioId: 'conv-3', convenioName: 'SulAmerica', price: 350, isPaid: true, room: 'Sala 1',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'apt-10', companyId: 'default-company',
    patientId: '4', patient: { id: '4', fullName: 'Ana Costa', phone: '(11) 94567-8901', email: null, convenioName: 'Unimed', convenioNumber: 'UNI-99999' },
    doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza', specialty: 'clinico_geral', crm: '789012' },
    type: 'consultation', status: 'cancelled', date: yesterdayStr, startTime: '15:00', endTime: '15:25', duration: 25,
    notes: null, cancellationReason: 'Paciente solicitou cancelamento',
    isFirstVisit: false, convenioId: 'conv-1', convenioName: 'Unimed', price: 200, isPaid: false, room: 'Sala 3',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

// GET /api/appointments
fastify.get('/api/appointments', async (request, reply) => {
  console.log('[MOCK] GET /api/appointments')
  const query = request.query as any
  let filtered = [...mockAppointments]

  if (query.date) filtered = filtered.filter((a) => a.date === query.date)
  if (query.doctorId) filtered = filtered.filter((a) => a.doctorId === query.doctorId)
  if (query.patientId) filtered = filtered.filter((a) => a.patientId === query.patientId)
  if (query.status) filtered = filtered.filter((a) => a.status === query.status)
  if (query.dateFrom && query.dateTo) {
    filtered = filtered.filter((a) => a.date >= query.dateFrom && a.date <= query.dateTo)
  }

  filtered.sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date)
    if (dateComp !== 0) return dateComp
    return a.startTime.localeCompare(b.startTime)
  })

  return reply.send(filtered)
})

// GET /api/appointments/stats
fastify.get('/api/appointments/stats', async (request, reply) => {
  console.log('[MOCK] GET /api/appointments/stats')
  const nowDate = new Date()
  const todayDate = nowDate.toISOString().split('T')[0]
  const weekStart = new Date(nowDate)
  weekStart.setDate(nowDate.getDate() - nowDate.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1).toISOString().split('T')[0]

  const todayApts = mockAppointments.filter((a) => a.date === todayDate)
  const weekApts = mockAppointments.filter((a) => a.date >= weekStartStr)
  const monthApts = mockAppointments.filter((a) => a.date >= monthStart)

  return reply.send({
    today: todayApts.filter((a) => a.status !== 'cancelled').length,
    thisWeek: weekApts.filter((a) => a.status !== 'cancelled').length,
    thisMonth: monthApts.filter((a) => a.status !== 'cancelled').length,
    cancelled: monthApts.filter((a) => a.status === 'cancelled').length,
    noShow: monthApts.filter((a) => a.status === 'no_show').length,
    completedToday: todayApts.filter((a) => a.status === 'completed').length,
    upcomingToday: todayApts.filter((a) => ['scheduled', 'confirmed', 'waiting'].includes(a.status)),
  })
})

// GET /api/appointments/types
fastify.get('/api/appointments/types', async (request, reply) => {
  return reply.send(APPOINTMENT_TYPES_MAP)
})

// GET /api/appointments/:id
fastify.get('/api/appointments/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const apt = mockAppointments.find((a) => a.id === id)
  if (!apt) return reply.status(404).send({ message: 'Appointment not found' })
  return reply.send(apt)
})

// POST /api/appointments
fastify.post('/api/appointments', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/appointments', data)
  const patient = mockContacts.find((c) => c.id === data.patientId)
  const doctor = mockDoctors.find((d) => d.id === data.doctorId)
  const duration = data.duration || doctor?.consultationDuration || 30

  const [h, m] = (data.startTime || '09:00').split(':').map(Number)
  const endMinutes = h * 60 + m + duration
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`

  const apt = {
    id: `apt-${Date.now()}`, companyId: 'default-company',
    patientId: data.patientId,
    patient: patient ? { id: patient.id, fullName: patient.fullName, phone: patient.phone, email: patient.email, convenioName: patient.convenioName, convenioNumber: patient.convenioNumber } : null,
    doctorId: data.doctorId,
    doctor: doctor ? { id: doctor.id, fullName: doctor.fullName, specialty: doctor.specialty, crm: doctor.crm } : null,
    type: data.type || 'consultation', status: 'scheduled',
    date: data.date, startTime: data.startTime, endTime, duration,
    notes: data.notes || null, cancellationReason: null,
    isFirstVisit: data.type === 'first_visit',
    convenioId: data.convenioId || patient?.convenioId || null,
    convenioName: data.convenioId ? mockConvenios.find((c) => c.id === data.convenioId)?.name : patient?.convenioName || null,
    price: data.price ?? doctor?.consultationPrice ?? null,
    isPaid: false, room: data.room || null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockAppointments.push(apt)
  return reply.status(201).send(apt)
})

// PUT /api/appointments/:id
fastify.put('/api/appointments/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockAppointments.findIndex((a) => a.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Appointment not found' })

  if (data.startTime || data.duration) {
    const startTime = data.startTime || mockAppointments[index].startTime
    const duration = data.duration || mockAppointments[index].duration
    const [h, m] = startTime.split(':').map(Number)
    const endMinutes = h * 60 + m + duration
    data.endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
  }

  mockAppointments[index] = { ...mockAppointments[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockAppointments[index])
})

// DELETE /api/appointments/:id
fastify.delete('/api/appointments/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockAppointments.findIndex((a) => a.id === id)
  if (index !== -1) mockAppointments.splice(index, 1)
  return reply.send({ success: true })
})

// GET /api/appointments/availability
fastify.get('/api/appointments/availability', async (request, reply) => {
  const query = request.query as { doctorId: string; date: string }
  console.log('[MOCK] GET /api/appointments/availability', query)
  const doctor = mockDoctors.find((d) => d.id === query.doctorId)
  const duration = doctor?.consultationDuration || 30
  const bookedSlots = mockAppointments
    .filter((a) => a.doctorId === query.doctorId && a.date === query.date && a.status !== 'cancelled')
    .map((a) => a.startTime)

  const slots: Array<{ startTime: string; endTime: string; available: boolean }> = []
  for (let hour = 8; hour < 18; hour++) {
    for (let min = 0; min < 60; min += duration) {
      if (hour === 12 || hour === 13) continue
      const st = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      const endMin = hour * 60 + min + duration
      const et = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
      slots.push({ startTime: st, endTime: et, available: !bookedSlots.includes(st) })
    }
  }

  return reply.send({ doctorId: query.doctorId, date: query.date, slots })
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
// MOCK MEDICAL RECORDS ENDPOINTS
// ============================================================================

const CONSULTATION_TYPES_MAP: Record<string, string> = {
  anamnesis: 'Anamnese', follow_up: 'Acompanhamento', exam_result: 'Resultado de Exame',
  prescription: 'Prescricao', referral: 'Encaminhamento', procedure_note: 'Nota de Procedimento', evolution: 'Evolucao',
}

const mockMedicalRecords: any[] = [
  {
    id: 'rec-1', companyId: 'default-company',
    patientId: '1', patient: { id: '1', fullName: 'Joao Silva' },
    doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes', specialty: 'cardiologia', crm: '123456' },
    appointmentId: 'apt-9', type: 'follow_up',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    chiefComplaint: 'Dor no peito esporadica', anamnesis: 'Paciente relata episodios de dor toracica leve ao esforco, cerca de 2x por semana. Nega dispneia. Medicacao em uso: Losartana 50mg, AAS 100mg.',
    physicalExam: 'PA: 130/85 mmHg, FC: 72 bpm, ausculta cardiaca sem sopros, pulmoes limpos.',
    diagnosis: 'Hipertensao arterial controlada. Angina estavel - investigar.', diagnosisCid: 'I20.0',
    prescription: 'Manter Losartana 50mg 1x/dia\nManter AAS 100mg 1x/dia\nSolicitar teste ergometrico',
    procedures: null, notes: 'Solicitar ECG e teste ergometrico. Retorno em 30 dias com resultados.',
    referral: null, referralSpecialty: null,
    vitalSigns: { bloodPressure: '130/85', heartRate: 72, temperature: 36.5, weight: 82, height: 175, oxygenSaturation: 97 },
    attachments: [], isConfidential: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-2', companyId: 'default-company',
    patientId: '1', patient: { id: '1', fullName: 'Joao Silva' },
    doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes', specialty: 'cardiologia', crm: '123456' },
    appointmentId: null, type: 'exam_result',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    chiefComplaint: null, anamnesis: null, physicalExam: null,
    diagnosis: 'Teste ergometrico sem alteracoes isquemicas. ECG normal.',
    diagnosisCid: null,
    prescription: null, procedures: null,
    notes: 'Resultados tranquilizadores. Manter acompanhamento semestral.',
    referral: null, referralSpecialty: null,
    vitalSigns: null,
    attachments: [
      { id: 'att-1', recordId: 'rec-2', fileName: 'teste_ergometrico.pdf', mimeType: 'application/pdf', size: 245000, url: '/uploads/teste_ergometrico.pdf', description: 'Teste ergometrico', createdAt: new Date().toISOString() },
      { id: 'att-2', recordId: 'rec-2', fileName: 'ecg_repouso.pdf', mimeType: 'application/pdf', size: 180000, url: '/uploads/ecg_repouso.pdf', description: 'ECG em repouso', createdAt: new Date().toISOString() },
    ],
    isConfidential: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-3', companyId: 'default-company',
    patientId: '3', patient: { id: '3', fullName: 'Pedro Oliveira' },
    doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza', specialty: 'clinico_geral', crm: '789012' },
    appointmentId: null, type: 'anamnesis',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    chiefComplaint: 'Controle de diabetes e check-up geral',
    anamnesis: 'Paciente diabetico tipo 2 ha 5 anos. Uso de Metformina 850mg 2x/dia. Relata aumento de sede e poliuria. Alergia a Penicilina e Latex. Nega tabagismo.',
    physicalExam: 'PA: 120/80 mmHg, IMC: 28.5, exame abdominal sem alteracoes, pele integra, sensibilidade periferica preservada.',
    diagnosis: 'DM2 descompensado', diagnosisCid: 'E11',
    prescription: 'Manter Metformina 850mg 2x/dia\nAdicionar Glicazida 30mg 1x/dia\nSolicitar HbA1c e glicemia de jejum',
    procedures: null,
    notes: 'Orientar dieta hipoglicidica. Encaminhar para nutricionista. Retorno em 30 dias.',
    referral: 'Nutricionista', referralSpecialty: 'nutricao',
    vitalSigns: { bloodPressure: '120/80', heartRate: 78, temperature: 36.2, weight: 88, height: 172, oxygenSaturation: 98 },
    attachments: [], isConfidential: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-4', companyId: 'default-company',
    patientId: '2', patient: { id: '2', fullName: 'Maria Santos' },
    doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira', specialty: 'dermatologia', crm: '654321' },
    appointmentId: null, type: 'procedure_note',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    chiefComplaint: 'Remocao de lesao pigmentada em dorso',
    anamnesis: null, physicalExam: 'Lesao pigmentada assimetrica 8mm em regiao dorsal superior.',
    diagnosis: 'Nevo melanocitico atipico - excisado', diagnosisCid: 'D22',
    prescription: 'Cefalexina 500mg 8/8h por 7 dias\nIbuprofeno 400mg se dor\nCurativo diario com soro fisiologico',
    procedures: 'Excisao cirurgica de lesao pigmentada com margem de 2mm. Anestesia local com lidocaina 2%. Material enviado para anatomopatologico.',
    notes: 'Retorno em 10 dias para remocao de pontos e resultado do anatomopatologico.',
    referral: null, referralSpecialty: null,
    vitalSigns: { bloodPressure: '110/70', heartRate: 68, temperature: 36.4, weight: 62, height: 165, oxygenSaturation: 99 },
    attachments: [], isConfidential: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString(),
  },
]

// GET /api/medical-records
fastify.get('/api/medical-records', async (request, reply) => {
  console.log('[MOCK] GET /api/medical-records')
  const query = request.query as any
  let filtered = [...mockMedicalRecords]
  if (query.patientId) filtered = filtered.filter((r) => r.patientId === query.patientId)
  if (query.doctorId) filtered = filtered.filter((r) => r.doctorId === query.doctorId)
  if (query.type) filtered = filtered.filter((r) => r.type === query.type)
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return reply.send(filtered)
})

// GET /api/medical-records/types
fastify.get('/api/medical-records/types', async (request, reply) => {
  return reply.send(CONSULTATION_TYPES_MAP)
})

// GET /api/medical-records/:id
fastify.get('/api/medical-records/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const rec = mockMedicalRecords.find((r) => r.id === id)
  if (!rec) return reply.status(404).send({ message: 'Record not found' })
  return reply.send(rec)
})

// POST /api/medical-records
fastify.post('/api/medical-records', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/medical-records', data)
  const patient = mockContacts.find((c) => c.id === data.patientId)
  const doctor = mockDoctors.find((d) => d.id === data.doctorId)
  const rec = {
    id: `rec-${Date.now()}`, companyId: 'default-company',
    patientId: data.patientId, patient: patient ? { id: patient.id, fullName: patient.fullName } : null,
    doctorId: data.doctorId, doctor: doctor ? { id: doctor.id, fullName: doctor.fullName, specialty: doctor.specialty, crm: doctor.crm } : null,
    appointmentId: data.appointmentId || null,
    type: data.type || 'evolution', date: data.date || new Date().toISOString().split('T')[0],
    chiefComplaint: data.chiefComplaint || null, anamnesis: data.anamnesis || null,
    physicalExam: data.physicalExam || null, diagnosis: data.diagnosis || null,
    diagnosisCid: data.diagnosisCid || null, prescription: data.prescription || null,
    procedures: data.procedures || null, notes: data.notes || null,
    referral: data.referral || null, referralSpecialty: data.referralSpecialty || null,
    vitalSigns: data.vitalSigns || null,
    attachments: [], isConfidential: data.isConfidential || false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  mockMedicalRecords.push(rec)
  return reply.status(201).send(rec)
})

// PUT /api/medical-records/:id
fastify.put('/api/medical-records/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const data = request.body as any
  const index = mockMedicalRecords.findIndex((r) => r.id === id)
  if (index === -1) return reply.status(404).send({ message: 'Record not found' })
  mockMedicalRecords[index] = { ...mockMedicalRecords[index], ...data, updatedAt: new Date().toISOString() }
  return reply.send(mockMedicalRecords[index])
})

// DELETE /api/medical-records/:id
fastify.delete('/api/medical-records/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const index = mockMedicalRecords.findIndex((r) => r.id === id)
  if (index !== -1) mockMedicalRecords.splice(index, 1)
  return reply.send({ success: true })
})

// GET /api/patients/:patientId/timeline
fastify.get('/api/patients/:patientId/timeline', async (request, reply) => {
  const { patientId } = request.params as { patientId: string }
  console.log('[MOCK] GET /api/patients/:patientId/timeline', { patientId })
  const records = mockMedicalRecords.filter((r) => r.patientId === patientId)
  const apts = mockAppointments.filter((a) => a.patientId === patientId)
  return reply.send({ records, appointments: apts })
})

// ============================================================================
// MOCK NPS / SATISFACTION SURVEY ENDPOINTS
// ============================================================================

const getNPSCategory = (score: number) => score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor'

const mockNPSSurveys: any[] = [
  { id: 'nps-1', companyId: 'default-company', patientId: '1', patient: { id: '1', fullName: 'Joao Silva' }, doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes' }, appointmentId: 'apt-1', score: 10, category: 'promoter', comment: 'Excelente atendimento! Dr. Ricardo muito atencioso e explicou tudo com clareza.', channel: 'whatsapp', sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(), createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-2', companyId: 'default-company', patientId: '2', patient: { id: '2', fullName: 'Maria Santos' }, doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira' }, appointmentId: 'apt-2', score: 9, category: 'promoter', comment: 'Muito boa experiencia. A clinica e organizada e a Dra. Ana e otima.', channel: 'email', sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-3', companyId: 'default-company', patientId: '3', patient: { id: '3', fullName: 'Pedro Oliveira' }, doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza' }, appointmentId: 'apt-3', score: 7, category: 'passive', comment: 'Consulta boa, mas esperei muito tempo na recepcao.', channel: 'whatsapp', sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 7200000).toISOString(), createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-4', companyId: 'default-company', patientId: '4', patient: { id: '4', fullName: 'Ana Costa' }, doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes' }, appointmentId: 'apt-4', score: 10, category: 'promoter', comment: 'Perfeito! Sempre recomendo a clinica para amigos e familiares.', channel: 'sms', sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 1800000).toISOString(), createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-5', companyId: 'default-company', patientId: '5', patient: { id: '5', fullName: 'Carlos Ferreira' }, doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira' }, appointmentId: null, score: 5, category: 'detractor', comment: 'Dificuldade para marcar consulta por telefone. Site nao funcionou.', channel: 'email', sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-6', companyId: 'default-company', patientId: '1', patient: { id: '1', fullName: 'Joao Silva' }, doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza' }, appointmentId: null, score: 8, category: 'passive', comment: 'Bom atendimento no geral. Poderia ter mais opcoes de horarios.', channel: 'whatsapp', sentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000 + 5400000).toISOString(), createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-7', companyId: 'default-company', patientId: '2', patient: { id: '2', fullName: 'Maria Santos' }, doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes' }, appointmentId: null, score: 9, category: 'promoter', comment: null, channel: 'in_app', sentAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000 + 900000).toISOString(), createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-8', companyId: 'default-company', patientId: '3', patient: { id: '3', fullName: 'Pedro Oliveira' }, doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira' }, appointmentId: null, score: 3, category: 'detractor', comment: 'Fui atendido com muito atraso e o medico parecia apressado.', channel: 'email', sentAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-9', companyId: 'default-company', patientId: '4', patient: { id: '4', fullName: 'Ana Costa' }, doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza' }, appointmentId: null, score: 10, category: 'promoter', comment: 'Melhor clinica da regiao! Equipe super profissional.', channel: 'whatsapp', sentAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000 + 2700000).toISOString(), createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-10', companyId: 'default-company', patientId: '5', patient: { id: '5', fullName: 'Carlos Ferreira' }, doctorId: 'doc-1', doctor: { id: 'doc-1', fullName: 'Dr. Ricardo Mendes' }, appointmentId: null, score: 9, category: 'promoter', comment: 'Dr. Ricardo e excelente. Recomendo!', channel: 'sms', sentAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000 + 4500000).toISOString(), createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
  // Unanswered surveys
  { id: 'nps-11', companyId: 'default-company', patientId: '4', patient: { id: '4', fullName: 'Ana Costa' }, doctorId: 'doc-2', doctor: { id: 'doc-2', fullName: 'Dra. Ana Ferreira' }, appointmentId: null, score: 0, category: 'detractor', comment: null, channel: 'whatsapp', sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: null, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'nps-12', companyId: 'default-company', patientId: '5', patient: { id: '5', fullName: 'Carlos Ferreira' }, doctorId: 'doc-3', doctor: { id: 'doc-3', fullName: 'Dr. Carlos Souza' }, appointmentId: null, score: 0, category: 'detractor', comment: null, channel: 'email', sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), answeredAt: null, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
]

// GET /api/nps
fastify.get('/api/nps', async (request, reply) => {
  console.log('[MOCK] GET /api/nps')
  const query = request.query as any
  let filtered = [...mockNPSSurveys]
  if (query.patientId) filtered = filtered.filter((s) => s.patientId === query.patientId)
  if (query.doctorId) filtered = filtered.filter((s) => s.doctorId === query.doctorId)
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

  // By doctor
  const doctorMap = new Map<string, { name: string; scores: number[] }>()
  answered.forEach((s: any) => {
    if (s.doctorId && s.doctor) {
      const existing = doctorMap.get(s.doctorId) || { name: s.doctor.fullName, scores: [] as number[] }
      existing.scores.push(s.score)
      doctorMap.set(s.doctorId, existing)
    }
  })
  const byDoctor = Array.from(doctorMap.entries()).map(([doctorId, data]) => {
    const dPromoters = data.scores.filter((s) => s >= 9).length
    const dDetractors = data.scores.filter((s) => s <= 6).length
    return {
      doctorId,
      doctorName: data.name,
      nps: data.scores.length > 0 ? Math.round(((dPromoters - dDetractors) / data.scores.length) * 100) : 0,
      responses: data.scores.length,
    }
  })

  // Recent comments
  const recentComments = answered
    .filter((s) => s.comment)
    .slice(0, 10)
    .map((s) => ({
      id: s.id,
      patientName: s.patient.fullName,
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
    byDoctor,
    recentComments,
  })
})

// POST /api/nps
fastify.post('/api/nps', async (request, reply) => {
  const data = request.body as any
  console.log('[MOCK] POST /api/nps', data)
  const patient = mockContacts.find((c) => c.id === data.patientId)
  const doctor = data.doctorId ? mockDoctors.find((d) => d.id === data.doctorId) : null
  const survey = {
    id: `nps-${Date.now()}`,
    companyId: 'default-company',
    patientId: data.patientId,
    patient: patient ? { id: patient.id, fullName: patient.fullName } : { id: data.patientId, fullName: 'Paciente' },
    doctorId: data.doctorId || null,
    doctor: doctor ? { id: doctor.id, fullName: doctor.fullName } : null,
    appointmentId: data.appointmentId || null,
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
  for (const patientId of (data.patientIds || [])) {
    const patient = mockContacts.find((c) => c.id === patientId)
    const survey = {
      id: `nps-${Date.now()}-${patientId}`,
      companyId: 'default-company',
      patientId,
      patient: patient ? { id: patient.id, fullName: patient.fullName } : { id: patientId, fullName: 'Paciente' },
      doctorId: null, doctor: null, appointmentId: null,
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
