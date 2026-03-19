// SHARED TYPES - CRM IA ENTERPRISE
// Types compartilhados entre frontend e backend

// ============================================================================
// USER & AUTH
// ============================================================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  timezone: string
  language: string
  isActive: boolean
  companyId: string
  roleId: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  companyName: string
}

// ============================================================================
// COMPANY
// ============================================================================

export interface Company {
  id: string
  name: string
  slug: string
  domain?: string
  logo?: string
  website?: string
  industry?: string
  size?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country: string
  zipCode?: string
  timezone: string
  language: string
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// PLANS & BILLING
// ============================================================================

export type PlanName = 'free' | 'pro' | 'enterprise'

export interface Plan {
  id: string
  name: PlanName
  displayName: string
  description?: string
  price: number
  currency: string
  billingInterval: 'month' | 'year'
  maxUsers: number
  maxLeadsPerMonth: number
  maxDealsPerMonth: number
  maxAIMessages: number
  maxWebhooks: number
  maxAPICallsPerDay: number
  maxStorageGB: number
  features: Record<string, boolean>
  isActive: boolean
  isPopular: boolean
}

export interface Subscription {
  id: string
  companyId: string
  planId: string
  plan: Plan
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAt?: string
  canceledAt?: string
}

// ============================================================================
// PATIENTS (formerly CONTACTS)
// ============================================================================

export type Gender = 'male' | 'female' | 'other'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export interface Contact {
  id: string
  companyId: string
  firstName?: string
  lastName?: string
  fullName: string
  email?: string
  phone?: string
  avatar?: string
  whatsapp?: string
  instagram?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  // Medical fields
  cpf?: string
  dateOfBirth?: string
  gender?: Gender
  bloodType?: BloodType
  allergies?: string
  medicalNotes?: string
  convenioId?: string
  convenioName?: string
  convenioNumber?: string
  responsibleName?: string
  responsiblePhone?: string
  preferredDoctorId?: string
  preferredDoctorName?: string
  lastVisitAt?: string
  nextVisitAt?: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateContactRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  whatsapp?: string
  instagram?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  cpf?: string
  dateOfBirth?: string
  gender?: Gender
  bloodType?: BloodType
  allergies?: string
  medicalNotes?: string
  convenioId?: string
  convenioNumber?: string
  responsibleName?: string
  responsiblePhone?: string
  preferredDoctorId?: string
  tags?: string[]
  customFields?: Record<string, any>
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export interface ContactWithStats extends Contact {
  _count: {
    leads: number
    deals: number
    conversations: number
  }
}

// ============================================================================
// DOCTORS
// ============================================================================

export type DoctorSpecialty =
  | 'clinico_geral'
  | 'cardiologia'
  | 'dermatologia'
  | 'ginecologia'
  | 'neurologia'
  | 'oftalmologia'
  | 'ortopedia'
  | 'pediatria'
  | 'psiquiatria'
  | 'urologia'
  | 'endocrinologia'
  | 'gastroenterologia'
  | 'otorrinolaringologia'
  | 'cirurgia_geral'
  | 'outro'

export interface Doctor {
  id: string
  companyId: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  crm: string
  crmState: string
  specialty: DoctorSpecialty
  specialtyOther?: string
  avatar?: string
  consultationDuration: number
  consultationPrice?: number
  bio?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDoctorRequest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  crm: string
  crmState: string
  specialty: DoctorSpecialty
  specialtyOther?: string
  consultationDuration?: number
  consultationPrice?: number
  bio?: string
}

export interface UpdateDoctorRequest extends Partial<CreateDoctorRequest> {
  isActive?: boolean
}

// ============================================================================
// CONVENIOS (Health Insurance)
// ============================================================================

export interface Convenio {
  id: string
  companyId: string
  name: string
  code?: string
  phone?: string
  email?: string
  website?: string
  contactPerson?: string
  notes?: string
  isActive: boolean
  patientCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateConvenioRequest {
  name: string
  code?: string
  phone?: string
  email?: string
  website?: string
  contactPerson?: string
  notes?: string
}

export interface UpdateConvenioRequest extends Partial<CreateConvenioRequest> {
  isActive?: boolean
}

// ============================================================================
// APPOINTMENTS (Scheduling)
// ============================================================================

export type AppointmentType = 'first_visit' | 'return' | 'exam' | 'procedure' | 'consultation' | 'emergency'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  companyId: string
  patientId: string
  patient: {
    id: string
    fullName: string
    phone?: string
    email?: string
    convenioName?: string
    convenioNumber?: string
  }
  doctorId: string
  doctor: {
    id: string
    fullName: string
    specialty: DoctorSpecialty
    crm: string
  }
  type: AppointmentType
  status: AppointmentStatus
  date: string
  startTime: string
  endTime: string
  duration: number
  notes?: string
  cancellationReason?: string
  isFirstVisit: boolean
  convenioId?: string
  convenioName?: string
  price?: number
  isPaid: boolean
  room?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  type: AppointmentType
  date: string
  startTime: string
  duration?: number
  notes?: string
  convenioId?: string
  price?: number
  room?: string
}

export interface UpdateAppointmentRequest {
  type?: AppointmentType
  status?: AppointmentStatus
  date?: string
  startTime?: string
  duration?: number
  notes?: string
  cancellationReason?: string
  price?: number
  isPaid?: boolean
  room?: string
}

export interface AppointmentStatsResponse {
  today: number
  thisWeek: number
  thisMonth: number
  cancelled: number
  noShow: number
  completedToday: number
  upcomingToday: Appointment[]
}

export interface DoctorAvailability {
  doctorId: string
  date: string
  slots: Array<{
    startTime: string
    endTime: string
    available: boolean
  }>
}

// ============================================================================
// MEDICAL RECORDS (Prontuario)
// ============================================================================

export type ConsultationType = 'anamnesis' | 'follow_up' | 'exam_result' | 'prescription' | 'referral' | 'procedure_note' | 'evolution'

export interface MedicalRecord {
  id: string
  companyId: string
  patientId: string
  patient: {
    id: string
    fullName: string
  }
  doctorId: string
  doctor: {
    id: string
    fullName: string
    specialty: DoctorSpecialty
    crm: string
  }
  appointmentId?: string
  type: ConsultationType
  date: string
  chiefComplaint?: string
  anamnesis?: string
  physicalExam?: string
  diagnosis?: string
  diagnosisCid?: string
  prescription?: string
  procedures?: string
  notes?: string
  referral?: string
  referralSpecialty?: string
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
    oxygenSaturation?: number
  }
  attachments: MedicalAttachment[]
  isConfidential: boolean
  createdAt: string
  updatedAt: string
}

export interface MedicalAttachment {
  id: string
  recordId: string
  fileName: string
  mimeType?: string
  size: number
  url: string
  description?: string
  createdAt: string
}

export interface CreateMedicalRecordRequest {
  patientId: string
  doctorId: string
  appointmentId?: string
  type: ConsultationType
  date: string
  chiefComplaint?: string
  anamnesis?: string
  physicalExam?: string
  diagnosis?: string
  diagnosisCid?: string
  prescription?: string
  procedures?: string
  notes?: string
  referral?: string
  referralSpecialty?: string
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
    oxygenSaturation?: number
  }
  isConfidential?: boolean
}

export interface UpdateMedicalRecordRequest extends Partial<CreateMedicalRecordRequest> {}

export interface PatientTimeline {
  records: MedicalRecord[]
  appointments: Appointment[]
}

export interface ContactDetails extends Contact {
  leads: Array<{
    id: string
    title: string
    status: LeadStatus
    createdAt: string
  }>
  deals: Array<{
    id: string
    title: string
    value: number
    status: DealStatus
    stage: {
      id: string
      name: string
      color: string
    }
    createdAt: string
  }>
  conversations: Array<{
    id: string
    status: ConversationStatus
    channel: {
      type: ChannelType
      name: string
    }
    lastMessageAt?: string
    createdAt: string
  }>
  activities: Activity[]
}

export interface ContactsListResponse {
  data: ContactWithStats[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ContactsStatsResponse {
  total: number
  withEmail: number
  withPhone: number
  withConvenio: number
  withAllergies: number
  pendingReturn: number
  recentCount: number
}

// ============================================================================
// LEADS
// ============================================================================

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified'
export type LeadSource =
  | 'website' | 'whatsapp' | 'instagram' | 'referral' | 'manual'
  | 'facebook' | 'google' | 'tiktok' | 'linkedin' | 'email' | 'organic' | 'other'

export interface Lead {
  id: string
  companyId: string
  contactId: string
  contact: Contact
  title: string
  description?: string
  status: LeadStatus
  score: number
  source: LeadSource
  medium?: string
  campaign?: string
  assignedToId?: string
  assignedTo?: User
  estimatedValue?: number
  convertedToDealId?: string
  convertedAt?: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateLeadRequest {
  contactId: string
  title: string
  description?: string
  source: LeadSource
  medium?: string
  campaign?: string
  assignedToId?: string
  estimatedValue?: number
  tags?: string[]
}

export interface UpdateLeadRequest {
  title?: string
  description?: string
  status?: LeadStatus
  score?: number
  source?: LeadSource
  medium?: string
  campaign?: string
  assignedToId?: string | null
  estimatedValue?: number | null
  tags?: string[]
}

export interface LeadsListResponse {
  data: Lead[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface LeadStatsResponse {
  total: number
  byStatus: Record<LeadStatus, number>
  bySource: Record<LeadSource, number>
  conversionRate: number
  totalEstimatedValue: number
}

// ============================================================================
// DEALS
// ============================================================================

export type DealStatus = 'open' | 'won' | 'lost'

export interface Pipeline {
  id: string
  companyId: string
  name: string
  description?: string
  isDefault: boolean
  isActive: boolean
  order: number
  stages: Stage[]
  createdAt: string
  updatedAt: string
}

export interface Stage {
  id: string
  pipelineId: string
  name: string
  description?: string
  color: string
  order: number
  probability: number
  isWon: boolean
  isLost: boolean
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  companyId: string
  pipelineId: string
  pipeline: Pipeline
  stageId: string
  stage: Stage
  contactId: string
  contact: Contact
  title: string
  description?: string
  value: number
  currency: string
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  status: DealStatus
  lostReason?: string
  assignedToId?: string
  assignedTo?: User
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateDealRequest {
  pipelineId: string
  stageId: string
  contactId: string
  title: string
  description?: string
  value: number
  expectedCloseDate?: string
  assignedToId?: string
  tags?: string[]
}

export interface MoveDealRequest {
  stageId: string
}

// ============================================================================
// CONVERSATIONS & MESSAGES
// ============================================================================

export type ChannelType = 'whatsapp' | 'instagram' | 'webchat'
export type ConversationStatus = 'open' | 'assigned' | 'resolved' | 'closed'
export type MessageDirection = 'inbound' | 'outbound'
export type MessageContentType = 'text' | 'image' | 'video' | 'audio' | 'file'

export interface Channel {
  id: string
  companyId: string
  type: ChannelType
  name: string
  config: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  companyId: string
  channelId: string
  channel: Channel
  contactId: string
  contact: Contact
  assignedToId?: string
  assignedTo?: User
  status: ConversationStatus
  isUnread: boolean
  isBotActive: boolean
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  direction: MessageDirection
  senderId?: string
  sender?: User
  content: string
  contentType: MessageContentType
  attachments?: any[]
  externalId?: string
  metadata?: Record<string, any>
  isFromBot: boolean
  isRead: boolean
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed'
  readAt?: string
  deliveredAt?: string
  createdAt: string
}

export interface SendMessageRequest {
  conversationId: string
  content: string
  contentType?: MessageContentType
  attachments?: File[]
}

// ============================================================================
// ACTIVITIES
// ============================================================================

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'
export type ActivityStatus = 'pending' | 'completed' | 'cancelled'

export interface Activity {
  id: string
  companyId: string
  type: ActivityType
  userId?: string
  user?: User
  contactId?: string
  contact?: Contact
  leadId?: string
  dealId?: string
  conversationId?: string
  subject?: string
  description?: string
  duration?: number
  activityDate: string
  status?: ActivityStatus
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateActivityRequest {
  type: ActivityType
  contactId?: string
  leadId?: string
  dealId?: string
  subject?: string
  description?: string
  duration?: number
  activityDate: string
}

// ============================================================================
// AI & AUTOMATION
// ============================================================================

export type AIAgentType = 'internal' | 'customer_facing'
export type DocumentSourceType = 'pdf' | 'docx' | 'txt' | 'url' | 'text' | 'crm_contacts' | 'crm_deals' | 'crm_conversations'
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AIAgent {
  id: string
  companyId: string
  name: string
  description?: string
  provider: 'openai' | 'anthropic' | 'google'
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  allowedScopes: string[]
  canCreateLeads: boolean
  canUpdateLeads: boolean
  canCreateDeals: boolean
  canTransferToHuman: boolean
  type: AIAgentType
  knowledgeBaseId?: string
  knowledgeBase?: KnowledgeBase
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAgentRequest {
  name: string
  description?: string
  provider: 'openai' | 'anthropic' | 'google'
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt: string
  type?: AIAgentType
  knowledgeBaseId?: string
  allowedScopes?: string[]
  canCreateLeads?: boolean
  canUpdateLeads?: boolean
  canCreateDeals?: boolean
  canTransferToHuman?: boolean
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {}

// ============================================================================
// AI KNOWLEDGE BASE & RAG
// ============================================================================

export interface KnowledgeBase {
  id: string
  companyId: string
  name: string
  description?: string
  collectionName: string
  documentCount: number
  chunkCount: number
  totalSizeBytes: number
  isActive: boolean
  documents?: KnowledgeDocument[]
  createdAt: string
  updatedAt: string
}

export interface KnowledgeDocument {
  id: string
  knowledgeBaseId: string
  name: string
  sourceType: DocumentSourceType
  sourceUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  status: DocumentStatus
  errorMessage?: string
  chunkCount: number
  processedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateKnowledgeBaseRequest {
  name: string
  description?: string
}

export interface AIQueryRequest {
  query: string
  agentId?: string
  collectionName: string
}

export interface AIQueryResponse {
  answer: string
  sources: Array<{
    content: string
    source_name: string
    source_type: string
    relevance_score?: number
  }>
  tokens_used?: number
  latency_ms?: number
}

export interface AIQueryLog {
  id: string
  companyId: string
  agentId?: string
  query: string
  response: string
  provider: string
  model: string
  tokensUsed?: number
  latencyMs?: number
  source: string
  rating?: number
  feedback?: string
  createdAt: string
}

export interface AIAnalyticsStats {
  totalQueries: number
  totalDocuments: number
  totalKnowledgeBases: number
  totalAgents: number
  avgResponseTime: number
  queriesByDay: Array<{ date: string; count: number }>
}

// ============================================================================
// AI PIPE BUILDER
// ============================================================================

export interface PipeSuggestRequest {
  promptText: string
  templateType?: 'sales' | 'support' | 'onboarding' | 'recruitment' | 'custom'
}

export interface SuggestedPhase {
  name: string
  description: string
  color: string
  order: number
  probability: number
  isWon?: boolean
  isLost?: boolean
}

export interface SuggestedField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'currency' | 'email' | 'phone' | 'url'
  required: boolean
  options?: string[]
  description?: string
}

export interface PipeSuggestResponse {
  pipeName: string
  pipeDescription: string
  phases: SuggestedPhase[]
  fields: SuggestedField[]
  tags: string[]
}

// ============================================================================
// PIPEFY-LIKE CORE (Pipes, Phases, Cards, Fields)
// ============================================================================

export type PipeStatus = 'active' | 'archived'
export type CardStatus = 'active' | 'done' | 'archived'
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'currency' | 'email' | 'phone' | 'url'
export type CardActivityType = 'created' | 'phase_changed' | 'field_updated' | 'comment' | 'attachment_added' | 'assigned'

export interface Pipe {
  id: string
  companyId: string
  name: string
  description?: string
  icon?: string
  color: string
  status: PipeStatus
  isPublic: boolean
  tags: string[]
  phases?: Phase[]
  fieldDefinitions?: FieldDefinition[]
  _count?: { cards: number; phases: number; fieldDefinitions: number }
  createdAt: string
  updatedAt: string
}

export interface Phase {
  id: string
  companyId: string
  pipeId: string
  name: string
  description?: string
  color: string
  position: number
  probability: number
  isWon: boolean
  isLost: boolean
  _count?: { cards: number }
  createdAt: string
  updatedAt: string
}

export interface FieldDefinition {
  id: string
  companyId: string
  pipeId: string
  name: string
  label: string
  description?: string
  type: FieldType
  required: boolean
  position: number
  configJson: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  companyId: string
  pipeId: string
  currentPhaseId: string
  currentPhase?: Phase
  title: string
  description?: string
  status: CardStatus
  createdById: string
  createdBy?: User
  assignedToId?: string
  assignedTo?: User
  dueDate?: string
  completedAt?: string
  fieldValues?: CardFieldValue[]
  attachments?: CardAttachment[]
  createdAt: string
  updatedAt: string
}

export interface CardFieldValue {
  id: string
  cardId: string
  fieldDefinitionId: string
  fieldDefinition?: FieldDefinition
  valueJson: any
}

export interface CardActivityLog {
  id: string
  cardId: string
  type: CardActivityType
  payloadJson: Record<string, any>
  createdById?: string
  createdAt: string
}

export interface CardAttachment {
  id: string
  cardId: string
  fileName: string
  mimeType?: string
  size: number
  storageUrl: string
  aiKnowledgeDocumentId?: string
  createdById?: string
  createdAt: string
}

export interface CreatePipeRequest {
  name: string
  description?: string
  icon?: string
  color?: string
  tags?: string[]
}

export interface CreatePipeFromSuggestRequest {
  pipeName: string
  pipeDescription?: string
  phases: SuggestedPhase[]
  fields: SuggestedField[]
  tags?: string[]
}

export interface CreatePhaseRequest {
  name: string
  description?: string
  color?: string
  position?: number
  probability?: number
  isWon?: boolean
  isLost?: boolean
}

export interface CreateFieldDefinitionRequest {
  name: string
  label: string
  description?: string
  type: FieldType
  required?: boolean
  position?: number
  configJson?: Record<string, any>
}

export interface CreateCardRequest {
  title: string
  description?: string
  assignedToId?: string
  dueDate?: string
  fieldValues?: Array<{ fieldDefinitionId: string; value: any }>
}

export interface MoveCardRequest {
  phaseId: string
}

export interface UpdateCardFieldsRequest {
  fields: Array<{ fieldDefinitionId: string; value: any }>
}

export interface CardDetail extends Card {
  fieldValues: (CardFieldValue & { fieldDefinition: FieldDefinition })[]
  activityLogs: CardActivityLog[]
  attachments: CardAttachment[]
  currentPhase: Phase
}

export interface PipeDetail extends Pipe {
  phases: (Phase & { _count: { cards: number } })[]
  fieldDefinitions: FieldDefinition[]
}

export interface KanbanData {
  pipe: Pipe
  phases: (Phase & { cards: Card[]; _count: { cards: number } })[]
}

export interface Webhook {
  id: string
  companyId: string
  name: string
  description?: string
  type: 'incoming' | 'outgoing'
  url?: string
  method?: 'GET' | 'POST' | 'PUT'
  headers?: Record<string, string>
  event?: string
  secret?: string
  isActive: boolean
  totalCalls: number
  lastCalledAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateWebhookRequest {
  name: string
  description?: string
  type: 'incoming' | 'outgoing'
  url?: string
  method?: 'GET' | 'POST' | 'PUT'
  headers?: Record<string, string>
  event?: string
}

export interface UpdateWebhookRequest extends Partial<CreateWebhookRequest> {
  isActive?: boolean
}

export interface Automation {
  id: string
  companyId: string
  name: string
  description?: string
  trigger: Record<string, any>
  conditions?: Record<string, any>[]
  actions: Record<string, any>[]
  isActive: boolean
  executionCount: number
  lastExecutedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAutomationRequest {
  name: string
  description?: string
  trigger: Record<string, any>
  conditions?: Record<string, any>[]
  actions: Record<string, any>[]
}

export interface UpdateAutomationRequest extends Partial<CreateAutomationRequest> {
  isActive?: boolean
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface LeadMetrics {
  total: number
  byStatus: Record<LeadStatus, number>
  bySource: Record<LeadSource, number>
  conversionRate: number
  avgScore: number
}

export interface DealMetrics {
  total: number
  byStatus: Record<DealStatus, number>
  totalValue: number
  avgValue: number
  avgTimeToClose: number
  conversionRate: number
}

export interface UserMetrics {
  userId: string
  user: User
  leadsCount: number
  dealsCount: number
  dealsWonCount: number
  totalValue: number
  conversionRate: number
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  code?: string
  details?: any
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardStats {
  contacts: {
    total: number
    withEmail: number
    withPhone: number
    recentCount: number
  }
  pipes: {
    total: number
    totalCards: number
    activeCards: number
    doneCards: number
    wonCards: number
    lostCards: number
  }
  pipesSummary: Array<{
    id: string
    name: string
    color: string
    totalCards: number
    activeCards: number
    wonCards: number
    lostCards: number
  }>
  phaseDistribution: Array<{
    phaseName: string
    color: string
    cards: number
  }>
  ai: {
    totalQueries: number
    totalDocuments: number
    totalAgents: number
    avgResponseTime: number
  }
  recentCards: Array<{
    id: string
    title: string
    pipeName: string
    phaseName: string
    phaseColor: string
    status: string
    createdAt: string
  }>
  cardsByDay: Array<{ date: string; created: number; completed: number }>
}

// ============================================================================
// DEEP ANALYTICS
// ============================================================================

export type AnalyticsPeriod = 'day' | 'week' | 'month'
export type AnalyticsMetric = 'leads' | 'conversions' | 'revenue' | 'velocity'
export type AnalyticsSortBy = 'leads' | 'conversions' | 'revenue' | 'roi' | 'cpl'
export type AnalyticsGroupBy = 'source' | 'medium' | 'platform' | 'campaign' | 'month'

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  source?: string
  campaign?: string
  platform?: string
  pipelineId?: string
  groupBy?: AnalyticsGroupBy
  metric?: AnalyticsMetric
  granularity?: AnalyticsPeriod
  sortBy?: AnalyticsSortBy
}

export interface AnalyticsOverview {
  totalLeads: number
  newLeadsThisPeriod: number
  leadsGrowth: number
  totalConversions: number
  conversionRate: number
  totalRevenue: number
  revenueGrowth: number
  avgDealValue: number
  avgTimeToConvert: number
  leadVelocity: number
  costPerLead: number
  topSource: string
  topCampaign: string
}

export interface SourceAnalytics {
  source: string
  leads: number
  qualified: number
  converted: number
  conversionRate: number
  revenue: number
  avgDealValue: number
  avgTimeToConvert: number
}

export interface SourceAnalyticsResponse {
  data: SourceAnalytics[]
  totals: { leads: number; converted: number; revenue: number }
}

export interface CampaignAnalytics {
  campaign: string
  platform: string
  leads: number
  qualified: number
  converted: number
  conversionRate: number
  revenue: number
  spend: number
  roi: number
  cpl: number
  cpa: number
}

export interface CampaignAnalyticsResponse {
  data: CampaignAnalytics[]
}

export interface FunnelStage {
  id: string
  name: string
  color: string
  order: number
  entered: number
  exited: number
  dropped: number
  conversionRate: number
  avgTimeInStage: number
  value: number
}

export interface FunnelAnalyticsResponse {
  stages: FunnelStage[]
  overallConversion: number
  biggestDropoff: string
  avgCycleTime: number
}

export interface LTVByGroup {
  group: string
  avgLTV: number
  customers: number
  totalRevenue: number
}

export interface LTVCohort {
  month: string
  customers: number
  month1Revenue: number
  month3Revenue: number
  month6Revenue: number
  month12Revenue: number
  currentLTV: number
}

export interface LTVAnalyticsResponse {
  avgLTV: number
  medianLTV: number
  ltvBySource: LTVByGroup[]
  ltvByCampaign: LTVByGroup[]
  cohorts: LTVCohort[]
}

export interface ROIPlatform {
  platform: string
  spend: number
  leads: number
  conversions: number
  revenue: number
  roi: number
  cpl: number
  cpa: number
}

export interface ROIAnalyticsResponse {
  totalSpend: number
  totalRevenue: number
  overallROI: number
  byPlatform: ROIPlatform[]
  byCampaign: Array<{
    campaign: string
    platform: string
    spend: number
    leads: number
    conversions: number
    revenue: number
    roi: number
  }>
}

export interface TrendDataPoint {
  date: string
  leads: number
  conversions: number
  revenue: number
  velocity: number
}

export interface TrendsAnalyticsResponse {
  data: TrendDataPoint[]
  summary: {
    avgPerDay: number
    trend: 'up' | 'down' | 'stable'
    trendPercentage: number
  }
}

// ============================================================================
// NPS / SATISFACTION SURVEY
// ============================================================================

export type NPSCategory = 'promoter' | 'passive' | 'detractor'

export interface NPSSurvey {
  id: string
  companyId: string
  patientId: string
  patient: { id: string; fullName: string }
  doctorId: string | null
  doctor: { id: string; fullName: string } | null
  appointmentId: string | null
  score: number // 0-10
  category: NPSCategory
  comment: string | null
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app' | 'manual'
  sentAt: string
  answeredAt: string | null
  createdAt: string
}

export interface NPSStats {
  total: number
  answered: number
  responseRate: number
  promoters: number
  passives: number
  detractors: number
  npsScore: number // -100 to 100
  avgScore: number
  byMonth: { month: string; nps: number; responses: number }[]
  byDoctor: { doctorId: string; doctorName: string; nps: number; responses: number }[]
  recentComments: { id: string; patientName: string; score: number; category: NPSCategory; comment: string; date: string }[]
}

export interface CreateNPSSurveyRequest {
  patientId: string
  doctorId?: string
  appointmentId?: string
  score: number
  comment?: string
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app' | 'manual'
}

export interface SendNPSBatchRequest {
  patientIds: string[]
  channel: 'whatsapp' | 'email' | 'sms'
}
