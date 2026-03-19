# CURRENT STATE - Auditoria do Projeto CRM IA

**Data:** 2026-01-23
**Objetivo:** Inventário completo antes da migração para modelo Pipefy-like

---

## 📦 ESTRUTURA DO PROJETO

```
CRM TUBOMINAS/
├── backend/          # API Fastify + Prisma
├── frontend/         # React + Vite + TypeScript
├── shared/           # Tipos TypeScript compartilhados
├── docs/             # Documentação
├── docker/           # Configurações Docker
└── node_modules/     # Dependências workspace
```

---

## 🎯 STACK TECNOLÓGICO

### Frontend
- **Framework:** React 18.2
- **Build Tool:** Vite 5.1
- **Linguagem:** TypeScript 5.3
- **Roteamento:** React Router DOM 6.22
- **State Management:**
  - Zustand 4.5 (estado global)
  - TanStack Query 5.20 (cache de dados da API)
- **UI:**
  - Tailwind CSS 3.4
  - Lucide React (ícones)
  - Sonner (toasts)
- **Formulários:** React Hook Form 7.50 + Zod
- **Drag & Drop:** React DnD 16.0 ✅ (já disponível para Kanban)
- **Gráficos:** Recharts 2.12
- **HTTP Client:** Axios 1.6
- **WebSocket:** Socket.io Client 4.6

### Backend
- **Framework:** Fastify 4.26
- **Linguagem:** TypeScript 5.3
- **ORM:** Prisma 5.9
- **Database:** PostgreSQL
- **Autenticação:**
  - JWT (@fastify/jwt 8.0)
  - Bcrypt 2.4
- **Cache/Queues:**
  - Redis (ioredis 5.3)
  - Bull 4.12 (job queues)
- **WebSocket:** Socket.io 4.6
- **AI SDKs:**
  - OpenAI 4.28
  - Anthropic SDK 0.17
  - Google Generative AI 0.2
- **Pagamentos:** Stripe 14.15
- **Documentação:** @fastify/swagger + swagger-ui
- **Segurança:**
  - @fastify/cors
  - @fastify/helmet
  - @fastify/rate-limit
- **Logger:** Pino 8.18

### Shared
- Tipos TypeScript compartilhados entre frontend e backend

---

## 🗂️ ROTAS FRONTEND (Status Atual)

| Rota | Página | Status | Observações |
|------|--------|--------|-------------|
| `/` | Dashboard | 🟡 Placeholder | Cards com dados hardcoded |
| `/contacts` | Contacts | ✅ **COMPLETO** | CRUD funcional, tabela, drawer, busca, filtros, stats |
| `/leads` | Leads | 🔴 Placeholder | Só template vazio |
| `/deals` | Deals | 🔴 Placeholder | Título "Pipeline de Vendas / Kanban" mas vazio |
| `/inbox` | Inbox | 🔴 Placeholder | Não verificado ainda |
| `/login` | Login | 🟡 Removido | Auth foi desabilitada temporariamente |

**Legenda:**
- ✅ Completo e funcionando
- 🟡 Parcial ou com dados mock
- 🔴 Vazio / placeholder

---

## 🗃️ MODELS DO BANCO (Prisma Schema)

### ✅ JÁ IMPLEMENTADOS

#### Identity & Access Management
- **User** - Usuários do sistema
- **RefreshToken** - Tokens de refresh JWT
- **Role** - Papéis (admin, manager, sales, etc)
- **Permission** - Permissões granulares (resource:action:scope)
- **RolePermission** - Relacionamento roles ↔ permissions

#### Multi-tenant & Billing
- **Company** - Tenant principal (multi-tenant)
- **Plan** - Planos de assinatura (free, pro, enterprise)
- **Subscription** - Assinaturas Stripe
- **Invoice** - Faturas

#### CRM Core ✅
- **Contact** - Contatos (✅ CRUD completo no frontend)
- **Lead** - Leads / oportunidades
- **Pipeline** - Pipelines de processo
- **Stage** - Fases/colunas do pipeline
- **Deal** - Negócios (cards no pipeline)
- **DealHistory** - Histórico de movimentações do deal

#### Communication
- **Channel** - Canais de comunicação (WhatsApp, Instagram, Webchat)
- **Conversation** - Conversas com contatos
- **Message** - Mensagens individuais

#### AI & Automation
- **AIAgent** - Agentes de IA configuráveis
- **Webhook** - Webhooks incoming/outgoing
- **WebhookLog** - Logs de execução de webhooks
- **Automation** - Automações (trigger → conditions → actions)

#### Activity & Audit
- **Activity** - Atividades (call, email, meeting, note, task)
- **AuditLog** - Log de auditoria completo

---

## 🚀 ENDPOINTS DE API (Backend)

### ✅ Implementados
- **Auth** (`/api/auth`)
  - POST `/register` - Registrar usuário e empresa
  - POST `/login` - Login
  - POST `/refresh` - Refresh token
  - POST `/logout`
  - GET `/me` - Usuário atual

- **Contacts** (`/api/contacts`) ✅ COMPLETO
  - GET `/` - Listar com paginação e busca
  - GET `/:id` - Detalhes com relacionamentos
  - POST `/` - Criar
  - PUT `/:id` - Atualizar
  - DELETE `/:id` - Deletar
  - GET `/tags` - Tags únicas
  - GET `/stats` - Estatísticas

### 🔴 NÃO Implementados (mas existem models)
- `/api/leads`
- `/api/pipelines`
- `/api/stages`
- `/api/deals`
- `/api/channels`
- `/api/conversations`
- `/api/messages`
- `/api/webhooks`
- `/api/automations`
- `/api/ai-agents`

---

## 🔐 AUTENTICAÇÃO & AUTORIZAÇÃO

### Status Atual
- **Auth Backend:** ✅ Implementado (JWT + Refresh Token)
- **RBAC Backend:** ✅ Schema completo (User → Role → Permissions)
- **Middleware Auth:** ✅ Existe (`authenticate.ts`)
- **Middleware Permissions:** ✅ Existe (`check-permission.ts`)
- **Auth Frontend:** 🔴 **DESABILITADA** temporariamente
  - Usuário padrão sempre logado
  - Token fixo "default-token"
  - Sem tela de login na rota

### Models RBAC
```typescript
Permission.code = "resource:action:scope"
// Exemplos:
// - deals:read:own
// - contacts:delete
// - settings:billing
```

**Níveis de hierarquia:**
- 0 = super_admin (acima de tenant)
- 10 = admin
- 50 = manager
- 100 = sales/support
- 200 = viewer

---

## 📂 SERVIÇOS FRONTEND

### ✅ Implementados
- **contacts.service.ts** - CRUD de contatos (completo)
- **api.ts** - Cliente Axios configurado
  - baseURL: `http://localhost:3333/api`
  - Interceptors de request (adiciona token)
  - Interceptors de response (trata erros, redireciona 401)
  - Logs detalhados para debug

### 🔴 Não Implementados
- leads.service.ts
- pipelines.service.ts
- deals.service.ts
- conversations.service.ts
- webhooks.service.ts
- automations.service.ts

---

## 🎨 COMPONENTES FRONTEND

### ✅ Implementados
**Layouts:**
- `AppLayout` - Layout principal com sidebar
- `AuthLayout` - Layout de autenticação (não usado)

**Pages:**
- `ContactsPage` - **COMPLETO** (✅ referência para outras páginas)
- `ContactsTable` - Tabela com ações
- `ContactForm` - Formulário completo
- `ContactDrawer` - Modal lateral
- `DashboardPage`, `LeadsPage`, `DealsPage`, `InboxPage` - Placeholders

**Hooks:**
- `useContacts` - Lista com paginação
- `useContact` - Buscar por ID
- `useCreateContact` - Criar
- `useUpdateContact` - Atualizar
- `useDeleteContact` - Deletar
- `useContactTags` - Tags
- `useContactStats` - Estatísticas

**Store:**
- `auth-store.ts` (Zustand) - Estado de autenticação

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. Backend Real Não Está Rodando
- ❌ PostgreSQL não está instalado/rodando
- ✅ **Solução temporária:** Backend mock em `server.mock.ts` rodando na porta 3333
- ⚠️ **Para produção:** Instalar PostgreSQL e executar `prisma migrate dev`

### 2. Autenticação Desabilitada
- Frontend removeu proteção de rotas
- Usuário sempre autenticado como "default-user"
- Token fixo "default-token"
- **Impacto:** Multi-tenant e RBAC não funcionam no frontend

### 3. Páginas Vazias
- Dashboard - dados hardcoded
- Leads - placeholder
- Deals - placeholder (será o Kanban principal)
- Inbox - placeholder

### 4. Falta de Integração
- Frontend só tem integração com `/api/contacts`
- Todos os outros endpoints não estão conectados

---

## ✅ O QUE ESTÁ FUNCIONANDO BEM

### 1. Módulo Contacts (Referência)
- ✅ CRUD completo
- ✅ Paginação server-side
- ✅ Busca e filtros
- ✅ Estatísticas
- ✅ UI profissional
- ✅ Estados de loading/error/empty
- ✅ Feedback visual (toasts)
- **Pode ser usado como template para outros módulos!**

### 2. Arquitetura Multi-tenant
- ✅ Schema Prisma pronto
- ✅ Relacionamento Company em todos os models
- ✅ Índices otimizados
- ✅ Cascade delete configurado

### 3. RBAC Completo
- ✅ Models Role, Permission, RolePermission
- ✅ Hierarquia de níveis
- ✅ Código de permissão granular

### 4. Infraestrutura para Pipefy-like
- ✅ **Pipeline** model já existe!
- ✅ **Stage** model já existe!
- ✅ **Deal** model já existe (pode ser Card)
- ✅ **DealHistory** para audit trail
- ✅ React DnD instalado (drag & drop)
- ✅ Webhook + WebhookLog prontos
- ✅ Automation model pronto

---

## 🎯 PRÓXIMOS PASSOS PARA PIPEFY-LIKE

### O Que JÁ Temos (80% pronto!)
1. ✅ Pipeline (processo)
2. ✅ Stage (fases/colunas)
3. ✅ Deal (pode ser Card)
4. ✅ DealHistory (movimentações)
5. ✅ Activity (log de ações)
6. ✅ Automation (gatilhos)
7. ✅ Webhook (integrações)
8. ✅ CustomFields em JSON (Deal.customFields)

### O Que FALTA Implementar
1. 🔴 **FieldDefinition** - Definir campos customizados por pipeline
2. 🔴 **FieldValue** - Valores tipados (ou usar JSON do Deal?)
3. 🔴 **StartForm** / **FormDefinition** - Formulário de entrada
4. 🔴 **Database** - Tabelas internas (exemplo: base de produtos)
5. 🔴 **Connection** - Conectar Card → Database records
6. 🔴 **API de Pipelines** - Endpoints CRUD
7. 🔴 **API de Cards** - Endpoints CRUD + mover fase
8. 🔴 **UI Kanban** - Componente drag & drop
9. 🔴 **UI Card Details** - Drawer com campos dinâmicos

### Vantagens da Base Atual
- Multi-tenant nativo ✅
- RBAC pronto ✅
- Audit log nativo ✅
- Automações prontas ✅
- Webhooks prontos ✅
- AI Agents prontos ✅
- React DnD já instalado ✅

---

## 📊 RESUMO EXECUTIVO

### Status Geral: 🟡 Base Sólida, Implementação Parcial

**Pontos Fortes:**
- ✅ Arquitetura enterprise-grade (multi-tenant + RBAC)
- ✅ Stack moderna e escalável
- ✅ Prisma schema muito bem estruturado
- ✅ Módulo Contacts como referência de qualidade
- ✅ 70% dos models já existem para Pipefy-like

**Pontos de Atenção:**
- ⚠️ Backend mock temporário (sem PostgreSQL)
- ⚠️ Auth desabilitada no frontend
- ⚠️ Maioria das páginas são placeholders
- ⚠️ Falta implementar APIs de Pipelines/Deals

**Recomendação:**
1. **Fase 1:** Habilitar PostgreSQL e rodar migrations
2. **Fase 2:** Re-habilitar autenticação frontend
3. **Fase 3:** Implementar APIs de Pipelines/Deals/Stages
4. **Fase 4:** Construir UI Kanban usando Deal como Card
5. **Fase 5:** Adicionar FieldDefinitions e StartForm
6. **Fase 6:** Implementar Databases e Connections

**Conclusão:** O projeto tem uma base excelente. A migração para Pipefy-like é mais uma **evolução** do que uma reescrita. Muitos conceitos já existem (Pipeline, Stage, Deal). Basta conectar as peças e construir a UI Kanban.
