# CRM SaaS Platform - Project Context

## About This Project

**CRM SaaS multi-tenant** evoluindo para plataforma **Pipefy-like** (processos no-code/low-code).

- **Stack Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query + Zustand
- **Stack Backend:** Fastify + TypeScript + Prisma ORM + PostgreSQL
- **Auth:** JWT + Refresh Tokens + RBAC granular
- **Real-time:** Socket.io
- **AI:** OpenAI, Anthropic, Google AI SDKs integrados
- **Payments:** Stripe
- **Queues:** Bull + Redis

**Status atual:** Backend mock rodando (PostgreSQL não configurado). Auth desabilitada temporariamente no frontend.

---

## Key Directories

```
CRM TUBOMINAS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database models (MUITO IMPORTANTE)
│   └── src/
│       ├── config/            # env.ts, database.ts
│       ├── middlewares/       # authenticate.ts, check-permission.ts, error-handler.ts
│       ├── modules/
│       │   ├── auth/          # Login, register, JWT
│       │   └── contacts/      # CRUD completo (REFERÊNCIA)
│       ├── utils/             # logger.ts, app-error.ts
│       ├── server.ts          # Servidor real (precisa PostgreSQL)
│       └── server.mock.ts     # Servidor mock (funciona sem DB)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layouts/       # AppLayout, AuthLayout
│   │   ├── hooks/             # useContacts.ts (REFERÊNCIA)
│   │   ├── lib/               # api.ts (Axios client)
│   │   ├── pages/
│   │   │   ├── contacts/      # COMPLETO - usar como template
│   │   │   ├── dashboard/     # Placeholder
│   │   │   ├── deals/         # Placeholder (será Kanban/Pipeline)
│   │   │   ├── leads/         # Placeholder
│   │   │   └── inbox/         # Placeholder
│   │   ├── services/          # contacts.service.ts (REFERÊNCIA)
│   │   ├── store/             # auth-store.ts (Zustand)
│   │   └── Router.tsx
│   └── .env                   # VITE_API_URL=http://localhost:3333
│
├── shared/
│   └── types/
│       └── index.ts           # Types compartilhados frontend/backend
│
└── docs/
    ├── CURRENT_STATE.md       # Auditoria completa do projeto
    └── MIGRATION_PLAN_PIPEFY_LIKE.md  # Plano de evolução
```

---

## Database Models (Prisma)

### Core Models Existentes
```
User, Role, Permission, RolePermission  → Auth + RBAC
Company, Plan, Subscription, Invoice    → Multi-tenant + Billing
Contact                                 → CRUD completo
Lead                                    → Oportunidades
Pipeline, Stage, Deal, DealHistory      → Kanban de vendas
Channel, Conversation, Message          → Chat/Inbox
AIAgent, Webhook, WebhookLog, Automation → IA e automações
Activity, AuditLog                      → Tracking
```

### Migração Pipefy-like (Planejada)
```
Pipeline → Pipe
Stage → Phase
Deal → Card
+ FieldDefinition (campos dinâmicos)
+ FieldValue (valores dos campos)
+ StartForm (formulário de entrada)
+ CardComment, CardAttachment
```

---

## Standards

### TypeScript
- **Type hints obrigatórios** em todas as funções públicas
- Usar types do `shared/types/index.ts` (nunca duplicar)
- `strict: true` no tsconfig

### React/Frontend
- **Componentes funcionais** apenas (sem classes)
- **Hooks customizados** para lógica de negócio (ex: `useContacts`)
- **Services** para chamadas API (ex: `contacts.service.ts`)
- **TanStack Query** para cache/estado servidor
- **Zustand** apenas para estado global (auth)
- **Tailwind CSS** para estilos (sem CSS modules)
- **Lucide React** para ícones
- **Sonner** para toasts

### Backend/Fastify
- **Estrutura modular:** module/service + controller + routes
- **Validação:** Zod schemas
- **Erros:** usar `AppError` para erros de negócio
- **Multi-tenant:** SEMPRE filtrar por `companyId`
- **RBAC:** verificar permissões antes de ações sensíveis

### Padrão de CRUD (usar Contacts como referência)
```
Backend:
  modules/{resource}/
    ├── {resource}.service.ts    # Lógica de negócio
    ├── {resource}.controller.ts # HTTP handlers
    └── {resource}.routes.ts     # Definição de rotas

Frontend:
  services/{resource}.service.ts  # Chamadas API
  hooks/use{Resource}.ts          # React Query hooks
  pages/{resource}/
    ├── {Resource}Page.tsx        # Página principal
    ├── {Resource}Table.tsx       # Tabela/lista
    ├── {Resource}Form.tsx        # Formulário
    └── {Resource}Drawer.tsx      # Modal lateral
```

---

## Common Commands

### Desenvolvimento
```bash
# Frontend (porta 5173)
cd frontend && npm run dev

# Backend MOCK (porta 3333) - SEM banco de dados
cd backend && npm run dev:mock

# Backend REAL (precisa PostgreSQL rodando)
cd backend && npm run dev
```

### Database (Prisma)
```bash
cd backend

# Gerar cliente Prisma
npx prisma generate

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Ver banco no browser
npx prisma studio

# Executar seed
npm run prisma:seed
```

### Build & Testes
```bash
# Frontend
cd frontend && npm run build
cd frontend && npm run type-check

# Backend
cd backend && npm run build
cd backend && npm run test
```

---

## API Endpoints

### Implementados ✅
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/auth/me

GET    /api/contacts          # Paginação + busca
GET    /api/contacts/:id      # Com relacionamentos
POST   /api/contacts
PUT    /api/contacts/:id
DELETE /api/contacts/:id
GET    /api/contacts/tags
GET    /api/contacts/stats
```

### Não implementados (usar mesmo padrão)
```
/api/leads
/api/pipelines (será /api/pipes)
/api/stages (será /api/phases)
/api/deals (será /api/cards)
/api/conversations
/api/webhooks
/api/automations
```

---

## Workflows

### Criar Novo Módulo CRUD
1. Verificar se model existe em `prisma/schema.prisma`
2. Se não existir, criar model e rodar migration
3. Criar `backend/src/modules/{module}/`
   - Copiar estrutura de `contacts/` como base
   - Adaptar service, controller, routes
4. Registrar rotas em `server.ts`
5. Criar types em `shared/types/index.ts`
6. Criar `frontend/src/services/{module}.service.ts`
7. Criar `frontend/src/hooks/use{Module}.ts`
8. Criar componentes em `frontend/src/pages/{module}/`
9. Adicionar rota em `Router.tsx`

### Implementar Kanban (Pipeline/Deals)
1. Renomear models: Pipeline→Pipe, Stage→Phase, Deal→Card
2. Adicionar FieldDefinition, FieldValue ao schema
3. Rodar migrations
4. Criar APIs: /pipes, /phases, /cards
5. Criar seed do Sales Pipe
6. Usar React DnD para drag & drop
7. Estrutura: KanbanBoard → KanbanColumn → KanbanCard

### Debug de Erros de API
1. Abrir DevTools (F12) → Console
2. Logs automáticos mostram: URL, status, response
3. Se 401: token inválido/expirado
4. Se 404: endpoint não existe ou ID errado
5. Se 500: erro no backend (ver logs do terminal)

---

## Important Notes

### Estado Atual do Projeto
- **Backend mock** rodando em `http://localhost:3333` (sem PostgreSQL)
- **Auth desabilitada** no frontend (usuário sempre logado)
- **Contatos** é o único módulo 100% funcional
- **Outras páginas** são placeholders

### Multi-tenancy
Todos os models têm `companyId`. **NUNCA** esquecer de filtrar por empresa:
```typescript
// CORRETO
const contacts = await prisma.contact.findMany({
  where: { companyId: user.companyId }
})

// ERRADO (vaza dados de outras empresas!)
const contacts = await prisma.contact.findMany()
```

### RBAC
Sistema de permissões: `resource:action:scope`
```
deals:read:own    → só seus deals
deals:read:all    → todos da empresa
deals:delete      → pode deletar
settings:billing  → acesso a faturamento
```

### Evolução Pipefy-like
O projeto está migrando de "CRM de vendas" para "plataforma de processos":
- Pipeline = Pipe (processo genérico)
- Stage = Phase (fase do processo)
- Deal = Card (item no processo)
- Campos dinâmicos via FieldDefinition/FieldValue

Ver `docs/MIGRATION_PLAN_PIPEFY_LIKE.md` para detalhes.

### Bibliotecas Já Instaladas (usar!)
- **React DnD** - drag & drop (para Kanban)
- **Recharts** - gráficos (para Dashboard)
- **React Hook Form + Zod** - formulários com validação
- **date-fns** - manipulação de datas
- **Socket.io** - real-time (para chat/inbox)

---

## Quick Reference

### Criar Hook de Query (TanStack Query)
```typescript
export function useContacts(params = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactsService.list(params),
    staleTime: 1000 * 60 * 5, // 5 min
  })
}
```

### Criar Mutation com Feedback
```typescript
export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => contactsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contato criado!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro')
    },
  })
}
```

### Componente de Tabela Padrão
```tsx
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Coluna
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {items.map(item => (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="px-6 py-4">{item.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Botão Padrão
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Ação
</button>
```

### Loading State
```tsx
{isLoading && (
  <div className="flex justify-center p-12">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
  </div>
)}
```

### Empty State
```tsx
{data?.length === 0 && (
  <div className="text-center p-12">
    <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900">Nenhum item</h3>
    <p className="text-gray-500">Comece criando o primeiro</p>
  </div>
)}
```
