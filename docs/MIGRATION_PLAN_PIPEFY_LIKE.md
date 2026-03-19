# MIGRATION PLAN - CRM para Pipefy-like Platform

**Data:** 2026-01-23
**Objetivo:** Evoluir CRM para plataforma no-code/low-code de processos inspirada em Pipefy

---

## 🎯 VISÃO GERAL

### O Que É
Transformar o CRM atual em uma plataforma de processos onde:
- **Pipes** = Processos customizáveis
- **Phases** = Fases/colunas do processo
- **Cards** = Itens no processo
- **Fields** = Campos dinâmicos por pipe
- **Start Forms** = Formulários de entrada
- **Databases** = Tabelas internas conectáveis
- **Automations** = Gatilhos e ações
- **Portals** = Áreas públicas para submissão

### O Que NÃO É
- ❌ Não vamos copiar marca ou textos de Pipefy
- ❌ Não vamos reescrever tudo do zero
- ❌ Não vamos quebrar funcionalidades existentes

### Filosofia
- ✅ **Evolução incremental**, não reescrita
- ✅ **Manter o que funciona** (Contacts, Auth, RBAC)
- ✅ **Aproveitar 70% do schema** já existente
- ✅ **PRs pequenos e testáveis**

---

## 📋 O QUE SERÁ MANTIDO

### ✅ Permanece 100% Como Está

1. **Identity & Access**
   - User, Role, Permission, RolePermission
   - JWT auth system
   - RBAC granular

2. **Multi-tenant**
   - Company model
   - Subscription & billing
   - Plan limits

3. **Contact Module**
   - Contact model e CRUD
   - Frontend completo em `/contacts`
   - Vai virar uma "Database interna"

4. **Communication**
   - Channel, Conversation, Message
   - Inbox (chat)

5. **AI & Webhooks**
   - AIAgent
   - Webhook, WebhookLog
   - Automation model (só ajustar estrutura JSON)

6. **Audit**
   - Activity
   - AuditLog

---

## 🔄 O QUE SERÁ RENOMEADO/ADAPTADO

### Pipeline → Pipe
**Antes:**
```prisma
model Pipeline {
  id          String
  name        String
  description String?
  isDefault   Boolean
  isActive    Boolean
  order       Int
  stages      Stage[]
  deals       Deal[]
}
```

**Depois:**
```prisma
model Pipe {
  id          String
  companyId   String
  name        String
  description String?
  icon        String?
  color       String?

  // Tipo de pipe (flexibilidade futura)
  type        String  @default("process") // process, database, portal

  isActive    Boolean
  isTemplate  Boolean @default(false) // templates de pipes
  order       Int

  phases          Phase[]
  cards           Card[]
  fieldDefinitions FieldDefinition[]
  startForm       StartForm?

  createdAt   DateTime
  updatedAt   DateTime
}
```

**Mudanças:**
- ✅ Pipeline vira Pipe
- ✅ Stage vira Phase
- ✅ Deal vira Card
- ✅ Adiciona `icon`, `color`, `type`
- ✅ Adiciona `isTemplate` (para criar pipes a partir de templates)
- ✅ Relacionamento com FieldDefinitions

---

### Stage → Phase
**Antes:**
```prisma
model Stage {
  name        String
  order       Int
  probability Int
  isWon       Boolean
  isLost      Boolean
}
```

**Depois:**
```prisma
model Phase {
  id          String
  pipeId      String
  pipe        Pipe

  name        String
  description String?
  color       String

  order       Int

  // Automações quando card entra nesta fase
  onEnterAutomations Json?

  // SLA (tempo máximo nesta fase)
  slaHours    Int?

  // Flags especiais
  isDone      Boolean @default(false)  // fase final de sucesso
  isCanceled  Boolean @default(false)  // fase final de cancelamento

  cards       Card[]

  createdAt   DateTime
  updatedAt   DateTime
}
```

**Mudanças:**
- ✅ Stage vira Phase
- ✅ isWon/isLost viram isDone/isCanceled (mais genérico)
- ✅ Remove `probability` (isso será calculado dinamicamente)
- ✅ Adiciona `onEnterAutomations`
- ✅ Adiciona `slaHours`

---

### Deal → Card
**Antes:**
```prisma
model Deal {
  title           String
  value           Decimal
  currency        String
  probability     Int
  status          String
  assignedTo      User?
  customFields    Json
}
```

**Depois:**
```prisma
model Card {
  id              String
  companyId       String
  pipeId          String
  pipe            Pipe
  phaseId         String
  phase           Phase

  // Identificação
  title           String
  description     String?

  // Responsável
  assignedToId    String?
  assignedTo      User?

  // Datas
  dueDate         DateTime?

  // SLA tracking
  slaStatus       String? // on_time, at_risk, overdue
  slaDeadline     DateTime?

  // Tags
  tags            String[]

  // Relacionamentos
  contactId       String?  // opcional
  contact         Contact?

  // Parent card (para subtasks futuras)
  parentCardId    String?
  parentCard      Card? @relation("ParentChild")
  childCards      Card[] @relation("ParentChild")

  // Campos dinâmicos
  fieldValues     FieldValue[]

  // Histórico
  histories       CardHistory[]
  activities      Activity[]
  comments        CardComment[]
  attachments     CardAttachment[]

  // Metadados
  position        Int // ordem dentro da fase

  createdAt       DateTime
  updatedAt       DateTime
  completedAt     DateTime?
}
```

**Mudanças:**
- ✅ Deal vira Card (mais genérico)
- ✅ Remove value/currency (vira um FieldValue)
- ✅ Remove customFields JSON (vira FieldValues tipados)
- ✅ Adiciona `position` (ordem no Kanban)
- ✅ Adiciona relacionamento com FieldValue
- ✅ Adiciona `parentCard` (para subtarefas)
- ✅ Adiciona `slaStatus` e `slaDeadline`

---

### DealHistory → CardHistory
```prisma
model CardHistory {
  id          String
  cardId      String
  card        Card

  fromPhaseId String?
  fromPhase   Phase?
  toPhaseId   String
  toPhase     Phase

  action      String // moved, created, updated, completed, canceled
  changes     Json?

  userId      String?
  user        User?

  daysInPreviousPhase Int?

  createdAt   DateTime
}
```

---

## ✨ O QUE SERÁ CRIADO DO ZERO

### 1. FieldDefinition
Define os campos customizáveis de cada Pipe.

```prisma
model FieldDefinition {
  id          String
  pipeId      String
  pipe        Pipe

  // Identificação
  label       String // "Valor do Negócio"
  key         String // "deal_value" (usado internamente)
  description String?

  // Tipo do campo
  fieldType   String // text, number, date, select, multiselect, email, phone, url, currency, file, user

  // Configurações específicas do tipo
  options     Json? // para select/multiselect: ["Opção 1", "Opção 2"]
  validation  Json? // regras de validação

  // Comportamento
  isRequired  Boolean @default(false)
  isUnique    Boolean @default(false)
  isVisible   Boolean @default(true)

  // Ordem de exibição
  order       Int

  // Valores preenchidos
  fieldValues FieldValue[]

  createdAt   DateTime
  updatedAt   DateTime

  @@unique([pipeId, key])
}
```

---

### 2. FieldValue
Armazena valores dos campos de cada Card.

```prisma
model FieldValue {
  id                 String
  cardId             String
  card               Card
  fieldDefinitionId  String
  fieldDefinition    FieldDefinition

  // Valor (apenas um será preenchido dependendo do tipo)
  valueText          String? @db.Text
  valueNumber        Decimal? @db.Decimal(20, 6)
  valueDate          DateTime?
  valueBoolean       Boolean?
  valueJson          Json? // para selects múltiplos, arrays, etc

  // Para campos de relacionamento
  valueUserId        String?
  valueUser          User?

  valueContactId     String?
  valueContact       Contact?

  createdAt          DateTime
  updatedAt          DateTime

  @@unique([cardId, fieldDefinitionId])
}
```

---

### 3. StartForm
Formulário de entrada para criar cards.

```prisma
model StartForm {
  id          String
  pipeId      String @unique
  pipe        Pipe

  title       String
  description String?

  // Configuração dos campos
  fields      Json // array de field configs

  // Fase inicial do card
  initialPhaseId String
  initialPhase   Phase @relation(fields: [initialPhaseId])

  // Público ou privado
  isPublic    Boolean @default(false)

  // URL pública
  publicUrl   String? @unique

  // Configurações
  successMessage String?
  redirectUrl    String?

  // Estatísticas
  submissionCount Int @default(0)

  createdAt   DateTime
  updatedAt   DateTime
}
```

---

### 4. Database (tabelas internas)
Futuro: tabelas conectáveis (ex: base de produtos).

```prisma
model Database {
  id          String
  companyId   String
  company     Company

  name        String
  description String?
  icon        String?

  // Schema da database
  fieldDefinitions DatabaseFieldDefinition[]
  records          DatabaseRecord[]

  isActive    Boolean @default(true)

  createdAt   DateTime
  updatedAt   DateTime
}

model DatabaseFieldDefinition {
  id         String
  databaseId String
  database   Database

  label      String
  key        String
  fieldType  String
  options    Json?
  isRequired Boolean
  order      Int

  @@unique([databaseId, key])
}

model DatabaseRecord {
  id         String
  databaseId String
  database   Database

  data       Json // valores dos campos

  createdAt  DateTime
  updatedAt  DateTime
}
```

---

### 5. CardComment
Comentários nos cards.

```prisma
model CardComment {
  id        String
  cardId    String
  card      Card

  userId    String
  user      User

  content   String @db.Text

  createdAt DateTime
  updatedAt DateTime
}
```

---

### 6. CardAttachment
Anexos nos cards.

```prisma
model CardAttachment {
  id        String
  cardId    String
  card      Card

  userId    String
  user      User

  fileName  String
  fileUrl   String
  fileSize  Int
  mimeType  String

  createdAt DateTime
}
```

---

## 📦 VERTICAL SLICE - SALES PIPE

### Objetivo
Implementar um fluxo completo end-to-end:
- **Pipe:** Sales (Vendas)
- **Phases:** New → Contacted → Qualified → Proposal → Won / Lost
- **Fields:** Nome, Email, Phone, Source, Deal Value, Notes
- **Start Form:** Criar novo card
- **Kanban:** Visualização drag & drop
- **Card Detail:** Drawer com campos editáveis

---

### Fase 1: Core Models + Migration

**Arquivos:**
- `backend/prisma/migrations/xxx_rename_pipeline_to_pipe.sql`
- `backend/prisma/migrations/xxx_add_field_definitions.sql`

**Tarefas:**
1. ✅ Renomear Pipeline → Pipe
2. ✅ Renomear Stage → Phase
3. ✅ Renomear Deal → Card
4. ✅ Renomear DealHistory → CardHistory
5. ✅ Criar FieldDefinition
6. ✅ Criar FieldValue
7. ✅ Criar StartForm
8. ✅ Criar CardComment
9. ✅ Criar CardAttachment
10. ✅ Rodar `prisma migrate dev`

---

### Fase 2: Backend APIs (Vertical Slice)

**Arquivos:**
- `backend/src/modules/pipes/pipes.service.ts`
- `backend/src/modules/pipes/pipes.controller.ts`
- `backend/src/modules/pipes/pipes.routes.ts`
- `backend/src/modules/phases/phases.service.ts`
- `backend/src/modules/cards/cards.service.ts`
- `backend/src/modules/cards/cards.controller.ts`
- `backend/src/modules/cards/cards.routes.ts`

**Endpoints Mínimos:**

```typescript
// Pipes
GET    /api/pipes
POST   /api/pipes
GET    /api/pipes/:id
PUT    /api/pipes/:id
DELETE /api/pipes/:id

// Phases (dentro do pipe)
GET    /api/pipes/:pipeId/phases
POST   /api/pipes/:pipeId/phases
PUT    /api/phases/:id
DELETE /api/phases/:id

// Cards
GET    /api/pipes/:pipeId/cards
POST   /api/pipes/:pipeId/cards
GET    /api/cards/:id
PUT    /api/cards/:id
PATCH  /api/cards/:id/move  // mover para outra fase
DELETE /api/cards/:id

// Field Values
PUT    /api/cards/:cardId/fields/:fieldDefinitionId

// Comments
GET    /api/cards/:cardId/comments
POST   /api/cards/:cardId/comments
```

**Seed do Sales Pipe:**
```typescript
// prisma/seeds/sales-pipe.seed.ts
const salesPipe = await prisma.pipe.create({
  data: {
    name: 'Sales Pipeline',
    companyId: company.id,
    phases: {
      create: [
        { name: 'New', order: 1, color: '#94A3B8' },
        { name: 'Contacted', order: 2, color: '#60A5FA' },
        { name: 'Qualified', order: 3, color: '#A78BFA' },
        { name: 'Proposal', order: 4, color: '#FBBF24' },
        { name: 'Won', order: 5, color: '#34D399', isDone: true },
        { name: 'Lost', order: 6, color: '#F87171', isCanceled: true },
      ],
    },
    fieldDefinitions: {
      create: [
        { label: 'Name', key: 'name', fieldType: 'text', isRequired: true, order: 1 },
        { label: 'Email', key: 'email', fieldType: 'email', order: 2 },
        { label: 'Phone', key: 'phone', fieldType: 'phone', order: 3 },
        { label: 'Source', key: 'source', fieldType: 'select', options: ['Website', 'Referral', 'Cold Call'], order: 4 },
        { label: 'Deal Value', key: 'value', fieldType: 'currency', order: 5 },
        { label: 'Notes', key: 'notes', fieldType: 'text', order: 6 },
      ],
    },
  },
})
```

---

### Fase 3: Frontend Services & Hooks

**Arquivos:**
- `frontend/src/services/pipes.service.ts`
- `frontend/src/services/cards.service.ts`
- `frontend/src/hooks/usePipes.ts`
- `frontend/src/hooks/useCards.ts`

**Exemplo:**
```typescript
// pipes.service.ts
export const pipesService = {
  async list() {
    const { data } = await api.get('/pipes')
    return data
  },

  async getById(id: string) {
    const { data } = await api.get(`/pipes/${id}`)
    return data
  },
}

// cards.service.ts
export const cardsService = {
  async listByPipe(pipeId: string) {
    const { data } = await api.get(`/pipes/${pipeId}/cards`)
    return data
  },

  async move(cardId: string, toPhaseId: string) {
    const { data } = await api.patch(`/cards/${cardId}/move`, { toPhaseId })
    return data
  },
}
```

---

### Fase 4: UI Kanban (React DnD)

**Arquivos:**
- `frontend/src/pages/pipeline/PipelinePage.tsx` (renomear de DealsPage)
- `frontend/src/pages/pipeline/KanbanBoard.tsx`
- `frontend/src/pages/pipeline/KanbanColumn.tsx`
- `frontend/src/pages/pipeline/KanbanCard.tsx`
- `frontend/src/pages/pipeline/CardDrawer.tsx`
- `frontend/src/pages/pipeline/CardForm.tsx`

**Estrutura:**
```tsx
<PipelinePage>
  <PipeSelector /> // dropdown para escolher pipe
  <KanbanBoard>
    {phases.map(phase => (
      <KanbanColumn phase={phase}>
        {cards.map(card => (
          <KanbanCard card={card} />
        ))}
      </KanbanColumn>
    ))}
  </KanbanBoard>
  <CardDrawer /> // modal para ver/editar card
</PipelinePage>
```

**Drag & Drop:**
```tsx
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function KanbanCard({ card }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { id: card.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return <div ref={drag}>...</div>
}

function KanbanColumn({ phase }) {
  const [, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => {
      moveCard.mutate({ cardId: item.id, phaseId: phase.id })
    },
  })

  return <div ref={drop}>...</div>
}
```

---

## 🗺️ ROADMAP DE IMPLEMENTAÇÃO

### Sprint 1: Foundation (5-7 dias)
- ✅ CURRENT_STATE.md (feito)
- ✅ MIGRATION_PLAN.md (este arquivo)
- ⬜ Migrations de renomeação (Pipeline→Pipe, Stage→Phase, Deal→Card)
- ⬜ Migrations de novos models (FieldDefinition, FieldValue, StartForm)
- ⬜ Seed do Sales Pipe
- ⬜ Rodar migrations e validar

### Sprint 2: Backend API (5-7 dias)
- ⬜ PipesService + Controller + Routes
- ⬜ PhasesService + Controller + Routes
- ⬜ CardsService + Controller + Routes
- ⬜ FieldValuesService + Controller + Routes
- ⬜ Testes das APIs com Postman/Insomnia
- ⬜ Documentação Swagger atualizada

### Sprint 3: Frontend Services (3-5 dias)
- ⬜ pipes.service.ts
- ⬜ cards.service.ts
- ⬜ usePipes hook
- ⬜ useCards hook
- ⬜ useMoveCard hook

### Sprint 4: UI Kanban (7-10 dias)
- ⬜ PipelinePage base
- ⬜ KanbanBoard component
- ⬜ KanbanColumn component
- ⬜ KanbanCard component (drag & drop)
- ⬜ CardDrawer (visualização)
- ⬜ CardForm (edição de campos dinâmicos)
- ⬜ Integração completa

### Sprint 5: Refinamento (3-5 dias)
- ⬜ Loading states
- ⬜ Error handling
- ⬜ Optimistic updates
- ⬜ Toasts de feedback
- ⬜ Empty states
- ⬜ UX polish

### Sprint 6: Start Form (5 dias)
- ⬜ StartFormService
- ⬜ Página pública de submissão
- ⬜ Configuração do formulário
- ⬜ Validações

### Sprint 7: Databases (futuro)
- Database model
- DatabaseRecords
- UI de gestão
- Conexões Card ↔ DatabaseRecord

---

## 📁 ESTRUTURA DE PASTAS (Proposta)

```
backend/src/modules/
├── auth/           # mantém
├── contacts/       # mantém
├── pipes/          # NOVO
│   ├── pipes.service.ts
│   ├── pipes.controller.ts
│   └── pipes.routes.ts
├── phases/         # NOVO
│   ├── phases.service.ts
│   ├── phases.controller.ts
│   └── phases.routes.ts
├── cards/          # NOVO (antes era deals)
│   ├── cards.service.ts
│   ├── cards.controller.ts
│   ├── cards.routes.ts
│   └── field-values/
│       ├── field-values.service.ts
│       └── field-values.controller.ts
├── start-forms/    # NOVO
├── databases/      # FUTURO
└── automations/    # mantém (ajustar lógica)

frontend/src/pages/
├── auth/           # mantém
├── dashboard/      # mantém
├── contacts/       # mantém
├── pipeline/       # RENOMEAR de deals/
│   ├── PipelinePage.tsx
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   ├── KanbanCard.tsx
│   ├── CardDrawer.tsx
│   └── CardForm.tsx
├── inbox/          # mantém
└── leads/          # remover ou adaptar
```

---

## 🎨 DESIGN SYSTEM (Manter Consistência)

Usar o padrão já estabelecido em `/contacts`:
- Cards brancos com border-gray-200
- Botões blue-600
- Estados de loading com Loader2 (lucide-react)
- Toasts com Sonner
- Drawers laterais
- Tabelas com hover

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Migração de Dados Existentes
Se já existirem Deals/Leads:
```sql
-- Migrar Deals para Cards
INSERT INTO cards (...)
SELECT ... FROM deals;

-- Criar FieldValues a partir de customFields JSON
-- Script de migração necessário
```

### 2. Compatibilidade com APIs Antigas
Manter aliases durante transição:
```typescript
// Deprecated: use /api/pipes
app.get('/api/pipelines', ...)

// Deprecated: use /api/cards
app.get('/api/deals', ...)
```

### 3. Autenticação
Antes de ir para produção:
- ⬜ Re-habilitar auth no frontend
- ⬜ Criar tela de login funcional
- ⬜ Proteger rotas
- ⬜ Testar multi-tenant

### 4. Performance
- Índices no campo `position` de Cards
- Pagination na lista de Cards
- Virtual scrolling para muitos cards
- Debounce em drag & drop

---

## ✅ CHECKLIST PRÉ-DEPLOY

### Backend
- [ ] PostgreSQL rodando
- [ ] Migrations aplicadas
- [ ] Seed do Sales Pipe executado
- [ ] APIs testadas (Postman collection)
- [ ] Auth habilitada
- [ ] RBAC configurado
- [ ] Environment variables ok

### Frontend
- [ ] Build sem erros
- [ ] Auth habilitada
- [ ] Kanban drag & drop funcional
- [ ] Mobile responsive
- [ ] Loading states ok
- [ ] Error handling ok

### Documentação
- [ ] API docs (Swagger)
- [ ] README atualizado
- [ ] Guia de migração
- [ ] Changelog

---

## 📊 MÉTRICAS DE SUCESSO

### Funcional
- ✅ Criar pipe
- ✅ Criar phases
- ✅ Criar cards
- ✅ Mover cards entre phases (drag & drop)
- ✅ Editar field values
- ✅ Visualizar histórico de movimentações
- ✅ Start form funcional

### Performance
- < 2s para carregar Kanban com 100 cards
- < 200ms para mover card (otimistic update)
- < 1s para salvar field value

### UX
- Drag & drop smooth (60fps)
- Feedback visual imediato
- Estados de loading claros
- Mensagens de erro úteis

---

## 🚀 CONCLUSÃO

**Status:** Pronto para começar Sprint 1
**Próximo passo:** Executar migrations de renomeação
**Bloqueios:** Nenhum

**Vantagens da base atual:**
- 70% do trabalho já está no schema
- Auth + RBAC + Multi-tenant prontos
- React DnD já instalado
- Módulo Contacts como referência de qualidade

**Estimativa total:** 4-6 semanas para MVP completo (Sales Pipe + Kanban funcional)
