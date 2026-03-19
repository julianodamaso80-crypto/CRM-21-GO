# ARQUITETURA DO CRM IA ENTERPRISE

## Visão Geral

Este documento descreve a arquitetura técnica do CRM IA Enterprise, um sistema SaaS multi-tenant focado em vendas com IA integrada.

## Princípios Arquiteturais

### 1. Multi-Tenancy

**Estratégia: Shared Database, Isolated Data**

- Um único banco de dados PostgreSQL
- Isolamento por `company_id` em todas as tabelas
- Row-Level Security (RLS) via Prisma
- Cada query filtra por empresa automaticamente

**Vantagens:**
- Custo reduzido de infraestrutura
- Manutenção centralizada
- Escalável até ~1000 empresas por instância

**Desvantagens:**
- Risco de vazamento de dados (mitigado por RBAC + auditing)
- Limite de escala (resolvido com sharding futuro)

### 2. Separação de Camadas

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│   (React + Vite + TailwindCSS)          │
└─────────────────────────────────────────┘
                  ↓ HTTP/WS
┌─────────────────────────────────────────┐
│          Application Layer              │
│   (Fastify + Controllers + DTOs)        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Business Logic Layer           │
│   (Services + Domain Rules)             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Data Access Layer              │
│   (Repositories + Prisma ORM)           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Infrastructure Layer           │
│   (PostgreSQL + Redis + MinIO)          │
└─────────────────────────────────────────┘
```

### 3. Event-Driven Architecture

**Event Bus (Redis Pub/Sub)**

```typescript
// Exemplo de evento
{
  type: 'lead.created',
  payload: { leadId, companyId, userId },
  timestamp: '2025-01-21T10:00:00Z',
  metadata: { source: 'api', ipAddress: '...' }
}
```

**Consumers:**
- Automation Engine
- Webhook Dispatcher
- Analytics Aggregator
- AI Agent Trigger

## Componentes Principais

### Backend (Fastify)

**Estrutura de Pastas:**
```
backend/src/
├── controllers/       # HTTP endpoints
├── services/          # Business logic
├── repositories/      # Data access
├── middlewares/       # Auth, RBAC, etc
├── types/             # TypeScript types
├── utils/             # Helpers
├── config/            # Configuration
└── modules/           # Feature modules
    ├── auth/
    ├── leads/
    ├── deals/
    ├── chat/
    ├── ai/
    └── webhooks/
```

**Exemplo de Controller:**
```typescript
// leads.controller.ts
export class LeadsController {
  constructor(
    private leadsService: LeadsService,
    private auditService: AuditService
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const dto = CreateLeadDTO.parse(request.body)
    const { user } = request

    // Verificar limites do plano
    await this.checkPlanLimits(user.companyId)

    const lead = await this.leadsService.create(dto, user)

    // Audit
    await this.auditService.log({
      action: 'create',
      resource: 'lead',
      resourceId: lead.id,
      userId: user.id,
      companyId: user.companyId,
    })

    return reply.code(201).send(lead)
  }
}
```

### Frontend (React)

**Estrutura de Pastas:**
```
frontend/src/
├── components/        # Componentes reutilizáveis
│   ├── ui/           # Buttons, Inputs, Cards
│   ├── features/     # Componentes de negócio
│   └── layouts/      # Layouts da aplicação
├── pages/            # Páginas (rotas)
├── services/         # API clients
├── hooks/            # Custom hooks
├── store/            # State management (Zustand)
├── types/            # TypeScript types
└── utils/            # Helpers
```

**State Management:**
- **Zustand** para estado global (auth, user preferences)
- **React Query** para cache de API
- **React Hook Form** para formulários

**Exemplo de Hook:**
```typescript
export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => api.leads.list(filters),
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
```

## Modelo de Dados

### Relacionamentos Principais

```
Company (tenant)
  ↓ 1:N
User → Role → Permission (RBAC)
  ↓ 1:N
Contact
  ↓ 1:N
Lead → Deal (conversão)
  ↓ M:1
Pipeline → Stage (Kanban)

Conversation
  ↓ N:1
Channel (whatsapp, instagram, web)
  ↓ 1:N
Message

Company → AIAgent → Activities
Company → Webhook → WebhookLog
Company → Automation
```

### Índices Estratégicos

**Hot Queries:**
1. Buscar leads por empresa + status
2. Buscar deals por pipeline + stage
3. Buscar conversas por empresa + status
4. Buscar mensagens por conversa + timestamp

**Índices Criados:**
```sql
-- Composite indexes
CREATE INDEX idx_leads_company_status ON leads(company_id, status);
CREATE INDEX idx_deals_pipeline_stage ON deals(pipeline_id, stage_id);
CREATE INDEX idx_conversations_company_status ON conversations(company_id, status);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Full-text search (futuro)
CREATE INDEX idx_contacts_fullname_trgm ON contacts USING gin(full_name gin_trgm_ops);
```

## Segurança

### Autenticação

**JWT + Refresh Token Strategy**

```typescript
// Access Token (curta duração: 15min)
{
  id: 'user-uuid',
  email: 'user@example.com',
  companyId: 'company-uuid',
  roleId: 'role-uuid',
  exp: 1234567890
}

// Refresh Token (longa duração: 7 dias)
{
  id: 'token-uuid',
  userId: 'user-uuid',
  exp: 1234567890
}
```

**Fluxo:**
1. Login → Access Token + Refresh Token
2. Request → Bearer Access Token
3. Access Token expirado → Refresh Token → Novo Access Token
4. Refresh Token expirado → Re-login

### Autorização (RBAC)

**Hierarquia de Roles:**
```
Level 0: Super Admin (dono do SaaS, acesso total)
Level 10: Company Admin (dono da empresa)
Level 20: Manager (gerente)
Level 30: Sales Rep (vendedor)
Level 40: Support Agent (atendimento)
Level 50: Viewer (somente leitura)
```

**Permissions:**
```
Formato: resource:action:scope

Exemplos:
- leads:create
- leads:read:own
- leads:read:team
- leads:read:all
- leads:update:own
- leads:delete
- deals:create
- settings:billing (admin only)
```

**Verificação:**
```typescript
@authenticate()
@checkPermission('deals:create')
async createDeal(request, reply) {
  // Só executa se o usuário tiver a permissão
}
```

### Data Isolation (Multi-Tenant)

**Prisma Middleware:**
```typescript
prisma.$use(async (params, next) => {
  // Adiciona filtro de companyId automaticamente
  if (params.model !== 'User' && params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      companyId: currentUser.companyId,
    }
  }
  return next(params)
})
```

## Performance

### Caching Strategy

**Redis:**
- Session storage
- Rate limiting counters
- Queue jobs (Bull)
- Real-time pub/sub

**Cache Layers:**
```
1. Browser (React Query): 5min stale time
2. CDN (static assets): 1 year
3. Application (Redis): 15min TTL
4. Database (PostgreSQL): Query planner cache
```

### Database Optimization

**Materialized Views (futuro):**
```sql
-- Agregações pesadas
CREATE MATERIALIZED VIEW analytics_daily AS
SELECT
  company_id,
  DATE(created_at) as date,
  COUNT(*) as leads_count,
  SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_count
FROM leads
GROUP BY company_id, DATE(created_at);

-- Refresh a cada hora
REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily;
```

### API Rate Limiting

```typescript
// Global rate limit
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes',
})

// Per-endpoint rate limit
fastify.post('/api/ai/chat', {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute',
    },
  },
  handler: aiChatHandler,
})
```

## Observabilidade

### Logs Estruturados (Pino)

```typescript
logger.info({
  event: 'lead_created',
  leadId: lead.id,
  companyId: lead.companyId,
  userId: user.id,
  source: lead.source,
  duration: 125, // ms
})
```

### Métricas (futuro: Prometheus)

```
# Exemplos de métricas
crm_leads_created_total{company_id, source}
crm_deals_won_total{company_id, pipeline_id}
crm_api_request_duration_seconds{method, route, status}
crm_ai_api_calls_total{provider, model}
crm_websocket_connections{company_id}
```

### Tracing (futuro: OpenTelemetry)

Rastreamento end-to-end de requests:
```
Frontend → API Gateway → Service → Database
   |           |            |          |
  [span]     [span]       [span]    [span]
```

## Escalabilidade

### Horizontal Scaling

**Backend:**
- Stateless (JWT, sem session server-side)
- Load balancer (Nginx/Traefik)
- Auto-scaling baseado em CPU/Memory

**Database:**
- Read replicas (PostgreSQL replication)
- Connection pooling (PgBouncer)
- Partitioning por company_id (futuro)

**Queues:**
- Bull (Redis) para jobs assíncronos
- Workers escaláveis independentes

### Estratégia de Crescimento

```
0-100 empresas:
  - 1 servidor backend
  - 1 PostgreSQL
  - 1 Redis

100-1000 empresas:
  - 3+ servidores backend (load balanced)
  - 1 PostgreSQL primary + 2 read replicas
  - 1 Redis cluster

1000+ empresas:
  - Auto-scaling backend (K8s)
  - PostgreSQL sharded por company_id
  - Redis Cluster
  - CDN (CloudFlare)
  - Separate database for hot tenants
```

## Integrações

### WhatsApp Business API

**Webhook Flow:**
```
WhatsApp → Webhook Receiver → Queue → Message Handler → CRM
                                            ↓
                                     AI Agent (opcional)
                                            ↓
                                      Response Sender
```

### Instagram DM

Similar ao WhatsApp, usando Instagram Graph API.

### Webhooks Genéricos

**Outgoing:**
```typescript
// Trigger automático quando deal é ganho
automation: {
  trigger: { type: 'event', event: 'deal.won' },
  actions: [
    {
      type: 'webhook',
      url: 'https://erp.client.com/api/orders',
      method: 'POST',
      payload: {
        dealId: '{{deal.id}}',
        value: '{{deal.value}}',
        contact: '{{contact.email}}',
      },
    },
  ],
}
```

## Deployment

### Ambientes

```
Development:
  - Docker Compose local
  - Hot reload
  - Logs verbose

Staging:
  - AWS ECS / GCP Cloud Run
  - Dados sintéticos
  - Testes E2E

Production:
  - Kubernetes (EKS / GKE)
  - Multi-zone
  - Backups automáticos
  - Monitoring 24/7
```

### CI/CD Pipeline

```yaml
stages:
  - lint & type-check
  - unit tests
  - build Docker images
  - integration tests
  - deploy to staging
  - E2E tests
  - deploy to production (manual approval)
```

## Próximos Passos Técnicos

1. **Implementar autenticação completa** (JWT + Refresh Token)
2. **Criar seeds do banco** (roles, permissions, planos)
3. **Desenvolver módulos principais** (leads, deals, contacts)
4. **Implementar chat omnichannel** (WebSocket + Redis)
5. **Integrar camada de IA** (abstração multi-provider)
6. **Criar sistema de webhooks** (dispatcher + retry)
7. **Desenvolver automation engine** (event-driven)
8. **Implementar analytics** (agregações + dashboards)
9. **Integrar Stripe** (billing + subscriptions)
10. **Testes E2E** (Playwright/Cypress)
