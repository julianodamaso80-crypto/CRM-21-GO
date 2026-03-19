# CRM IA ENTERPRISE

## Visão Geral

Sistema CRM SaaS multi-tenant com IA integrada, focado em empresas que vendem. Arquitetura enterprise-grade, escalável e pronta para comercialização.

## Características Principais

- **Multi-tenant por empresa** - Isolamento completo de dados
- **IA conversacional** - Chatbot inteligente integrado ao CRM
- **Omnichannel** - WhatsApp, Instagram e Web unificados
- **Pipeline Kanban** - Gestão visual de vendas customizável
- **Analytics avançado** - Dashboards e métricas em tempo real
- **Webhooks e automações** - Integração com ecossistema externo
- **RBAC robusto** - Controle granular de permissões
- **Billing Stripe** - Planos e assinaturas mensais

## Arquitetura do Monorepo

```
/crm-saas
├── /frontend          # React + TypeScript + Vite
├── /backend           # Node.js + Fastify + Prisma
├── /shared            # Types, utils e contracts compartilhados
├── /docker            # Containers e orquestração
└── /docs              # Documentação técnica e de negócio
```

## Stack Tecnológica

### Frontend
- React 18+ com TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (state management)
- React Query (data fetching)
- Socket.io Client (real-time)
- React DnD (drag and drop)

### Backend
- Node.js 20+ com TypeScript
- Fastify (framework web)
- Prisma ORM
- PostgreSQL 15+
- Socket.io (WebSockets)
- Bull (queue jobs)
- Redis (cache + sessions)

### Infraestrutura
- Docker + Docker Compose
- PostgreSQL (database)
- Redis (cache + queues)
- MinIO ou S3 (file storage)

### Integrações
- Stripe (payments)
- OpenAI / Anthropic / Gemini (IA)
- WhatsApp Business API
- Instagram Graph API

## Estrutura de Domínio

### Core Entities

**Identity & Access**
- User (usuários do sistema)
- Role (papéis: admin, gerente, vendedor, suporte)
- Permission (permissões granulares)
- Company (tenant - empresa cliente)

**Subscription & Billing**
- Plan (free, pro, enterprise)
- Subscription (assinatura ativa)
- Invoice (faturas geradas)
- Payment (pagamentos registrados)

**CRM Core**
- Contact (pessoas físicas)
- Lead (oportunidades não qualificadas)
- Deal (negócios em pipeline)
- Company_Account (empresas como clientes)

**Sales Pipeline**
- Pipeline (múltiplos pipelines por empresa)
- Stage (etapas customizáveis)
- Deal_History (histórico de movimentações)

**Communication**
- Conversation (thread de mensagens)
- Message (mensagens individuais)
- Channel (whatsapp, instagram, webchat)
- Attachment (arquivos)

**Automation & AI**
- AI_Agent (configuração de bots)
- Webhook (endpoints entrada/saída)
- Automation (regras if-then)
- Workflow (fluxos complexos)

**Audit & Analytics**
- Audit_Log (todas as ações)
- Activity (atividades de vendas)
- Metric (métricas calculadas)
- Report (relatórios salvos)

## Controle de Acesso (RBAC)

### Hierarquia de Papéis

```
Super Admin (multi-tenant owner)
  └── Company Admin (tenant owner)
      ├── Manager (gerente de vendas)
      ├── Sales Rep (vendedor)
      ├── Support Agent (atendimento)
      └── Viewer (somente leitura)
```

### Princípios

1. **Zero Trust** - Toda ação validada no backend
2. **Granular** - Permissões específicas por recurso e ação
3. **Auditável** - Todos os acessos registrados
4. **Context-Aware** - Permissões consideram contexto da empresa

### Exemplos de Permissões

```
deals:create
deals:read:own
deals:read:team
deals:read:all
deals:update:own
deals:update:team
deals:delete
leads:assign
contacts:export
settings:billing
settings:integrations
users:invite
```

## Pipeline Kanban

### Características

- **Multi-pipeline** - Diferentes processos de venda
- **Stages customizáveis** - Etapas adaptadas ao negócio
- **Drag & Drop** - Interface intuitiva
- **Automações** - Ações ao mover cards
- **Histórico completo** - Rastreamento de mudanças
- **Métricas automáticas** - Taxa de conversão, tempo médio

### Arquitetura

```
Pipeline (1) ----> (N) Stage ----> (N) Deal
Deal ----> (N) Deal_History (snapshot de mudanças)
Deal ----> (1) Contact (quem está comprando)
Deal ----> (1) User (responsável)
```

## Chat Omnichannel

### Fluxo de Mensagens

```
WhatsApp/Instagram/Web
    ↓
Webhook Receiver
    ↓
Message Router
    ↓
Conversation Manager
    ↓
[AI Agent OR Human Agent]
    ↓
Response Sender
    ↓
External API
```

### Funcionalidades

- Inbox unificada multi-canal
- Atribuição automática ou manual
- Resposta por IA com fallback humano
- Histórico persistente completo
- Anexos (imagens, docs, áudio)
- Typing indicators em tempo real
- Read receipts

## Chatbot com IA

### Capacidades

- **Qualificação de leads** - Perguntas inteligentes
- **Consulta de dados** - Acesso controlado ao CRM
- **Agendamento** - Marca reuniões
- **Criação de tickets** - Abre leads/deals automaticamente
- **Handoff** - Transfere para humano quando necessário

### Arquitetura de IA

```typescript
interface AIProvider {
  generateResponse(context: ConversationContext): Promise<AIResponse>
  extractIntent(message: string): Promise<Intent>
  extractEntities(message: string): Promise<Entity[]>
}

// Implementações: OpenAI, Anthropic, Gemini, local LLM
```

### Princípios

1. IA é **assistente**, não decisor
2. Todas as ações confirmadas por humano
3. Contexto limitado por permissões RBAC
4. Auditoria completa de interações

## Dashboard Analítico

### Métricas Principais

**Vendas**
- Leads criados (período)
- Taxa de conversão por etapa
- Tempo médio de fechamento
- Valor médio de negócio (ticket médio)
- Pipeline value (valor total em aberto)

**Performance**
- Atividade por vendedor
- Leads por origem
- Horários de pico
- Taxa de resposta

**IA & Automação**
- Conversas atendidas por bot
- Taxa de handoff para humano
- Satisfação (CSAT)
- Tempo economizado

**Negócio**
- MRR (Monthly Recurring Revenue)
- Churn rate
- Uso por plano
- Adoção de funcionalidades

### Stack de Analytics

- PostgreSQL (queries OLTP)
- Materialized views (agregações)
- Redis (cache de métricas)
- Chart.js ou Recharts (visualização)

## Webhooks e Automações

### Casos de Uso

**Webhooks de Entrada**
- Receber leads de landing pages
- Sincronizar com ferramentas externas
- Importar contatos de e-commerce

**Webhooks de Saída**
- Notificar fechamento de venda
- Integrar com ERP
- Disparar e-mails marketing

**Automações**
```
Quando Lead.status = "qualificado"
  Então criar Deal
  E atribuir ao vendedor menos ocupado
  E enviar notificação WhatsApp

Quando Deal não movido em 7 dias
  Então notificar gerente
  E marcar como "stalled"
```

### Arquitetura

```
Event Bus (Redis Pub/Sub)
    ↓
Automation Engine
    ↓
Rule Matcher
    ↓
Action Executor (com retry)
    ↓
Webhook Dispatcher
```

## Planos e Billing

### Estrutura de Planos

| Recurso | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Usuários | 2 | 10 | Ilimitado |
| Leads/mês | 100 | 5.000 | Ilimitado |
| Conversas IA | 50 | 1.000 | Ilimitado |
| Pipelines | 1 | 5 | Ilimitado |
| Webhooks | 0 | 10 | Ilimitado |
| Suporte | Comunidade | Email | Dedicado |
| Preço | R$ 0 | R$ 297/mês | R$ 1.997/mês |

### Funcionalidades por Plano

```typescript
enum Feature {
  BASIC_CRM = 'basic_crm',           // Free+
  AI_CHATBOT = 'ai_chatbot',         // Pro+
  OMNICHANNEL = 'omnichannel',       // Pro+
  ADVANCED_ANALYTICS = 'analytics',   // Pro+
  WEBHOOKS = 'webhooks',             // Pro+
  API_ACCESS = 'api_access',         // Pro+
  WHITE_LABEL = 'white_label',       // Enterprise
  DEDICATED_IP = 'dedicated_ip',     // Enterprise
  SSO = 'sso',                       // Enterprise
  SLA = 'sla',                       // Enterprise
}
```

### Limites e Throttling

```typescript
interface PlanLimits {
  maxUsers: number
  maxLeadsPerMonth: number
  maxDealsPerMonth: number
  maxAIMessages: number
  maxWebhooks: number
  maxAPICallsPerDay: number
  maxStorageGB: number
}
```

### Stripe Integration

- Assinaturas recorrentes
- Webhook de pagamento confirmado
- Bloqueio automático por inadimplência
- Upgrade/downgrade prorata
- Invoice generation

## Qualidade de Código

### Arquitetura em Camadas

```
Controller (HTTP/WS)
    ↓
Service (business logic)
    ↓
Repository (data access)
    ↓
Prisma (ORM)
    ↓
PostgreSQL
```

### Padrões Obrigatórios

**DTOs (Data Transfer Objects)**
```typescript
// Validação com Zod
export const CreateLeadDTO = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.enum(['website', 'whatsapp', 'instagram']),
  companyId: z.string().uuid(),
})
```

**Services**
```typescript
export class LeadService {
  constructor(
    private leadRepo: LeadRepository,
    private auditService: AuditService
  ) {}

  async create(dto: CreateLeadDTO, userId: string) {
    // Validações de negócio
    // Verificação de limites do plano
    // Criação
    // Auditoria
    // Eventos
  }
}
```

**Error Handling**
```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {}
}

// Uso
throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND')
```

### TypeScript Strict

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## Roadmap de Desenvolvimento

### Fase 1: Foundation (Semanas 1-3)
- [ ] Setup inicial do monorepo
- [ ] Schema Prisma completo
- [ ] Autenticação JWT + Refresh Token
- [ ] RBAC básico
- [ ] CRUD de Companies, Users, Roles
- [ ] Docker Compose

### Fase 2: CRM Core (Semanas 4-6)
- [ ] CRUD Contacts, Leads, Deals
- [ ] Pipeline + Stages
- [ ] Kanban drag & drop
- [ ] Histórico de movimentações
- [ ] Busca e filtros avançados

### Fase 3: Communication (Semanas 7-9)
- [ ] Modelo de Conversations + Messages
- [ ] WebSocket real-time
- [ ] Inbox UI
- [ ] Integração WhatsApp
- [ ] Integração Instagram

### Fase 4: AI & Automation (Semanas 10-12)
- [ ] Camada de abstração IA
- [ ] Chatbot básico
- [ ] Qualificação automática
- [ ] Webhook receiver
- [ ] Automation engine

### Fase 5: Analytics & Billing (Semanas 13-15)
- [ ] Dashboard analytics
- [ ] Métricas calculadas
- [ ] Integração Stripe
- [ ] Sistema de planos
- [ ] Limites e throttling

### Fase 6: Enterprise Features (Semanas 16-18)
- [ ] Auditoria completa
- [ ] Exportação de dados
- [ ] API pública documentada
- [ ] White-label básico
- [ ] SSO (opcional)

### Fase 7: Polish & Launch (Semanas 19-20)
- [ ] Testes E2E
- [ ] Performance optimization
- [ ] Documentação completa
- [ ] Deploy production
- [ ] Marketing site

## Segurança

### Checklist Obrigatório

- [ ] SQL Injection (Prisma previne)
- [ ] XSS (sanitização de inputs)
- [ ] CSRF (tokens)
- [ ] Rate limiting (por IP e por user)
- [ ] Secrets em variáveis de ambiente
- [ ] HTTPS obrigatório
- [ ] Helmet.js (headers seguros)
- [ ] CORS configurado
- [ ] Logs não expõem dados sensíveis
- [ ] Passwords com bcrypt (12+ rounds)
- [ ] JWT com expiração curta
- [ ] Refresh token rotation

## Observabilidade

### Logs Estruturados

```typescript
logger.info('Lead created', {
  leadId: lead.id,
  companyId: lead.companyId,
  userId: user.id,
  source: lead.source,
  timestamp: new Date().toISOString()
})
```

### Métricas

- Request duration
- Error rate
- Database query time
- WebSocket connections
- AI API latency
- Queue length

### Alerts

- Alta taxa de erro (> 5%)
- API lenta (> 2s p95)
- Disk usage (> 80%)
- Failed payments
- AI API down

## Próximos Passos

Após a estrutura base estar pronta, vamos:

1. **Criar schema Prisma completo** com todas as entidades
2. **Configurar backend** com Fastify + Prisma
3. **Configurar frontend** com React + Vite
4. **Implementar autenticação** completa
5. **Criar primeiros CRUDs** (Users, Companies, Roles)
6. **Documentar APIs** com Swagger

Este é um projeto enterprise. Cada decisão é pensada para escala, manutenibilidade e venda como SaaS.
