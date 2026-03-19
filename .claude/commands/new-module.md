# Criar Novo Módulo CRUD

Crie um módulo CRUD completo para o recurso: $ARGUMENTS

## Checklist de implementação:

### 1. Backend
- [ ] Verificar/criar model em `prisma/schema.prisma`
- [ ] Criar migration se necessário
- [ ] Criar `backend/src/modules/{module}/{module}.service.ts`
- [ ] Criar `backend/src/modules/{module}/{module}.controller.ts`
- [ ] Criar `backend/src/modules/{module}/{module}.routes.ts`
- [ ] Registrar rotas em `server.ts` e `server.mock.ts`

### 2. Shared Types
- [ ] Adicionar tipos em `shared/types/index.ts`

### 3. Frontend
- [ ] Criar `frontend/src/services/{module}.service.ts`
- [ ] Criar `frontend/src/hooks/use{Module}.ts`
- [ ] Criar `frontend/src/pages/{module}/{Module}Page.tsx`
- [ ] Criar `frontend/src/pages/{module}/{Module}Table.tsx`
- [ ] Criar `frontend/src/pages/{module}/{Module}Form.tsx`
- [ ] Criar `frontend/src/pages/{module}/{Module}Drawer.tsx`
- [ ] Adicionar rota em `Router.tsx`

### Padrão a seguir:
Use o módulo `contacts` como referência. Copie a estrutura e adapte.

### Endpoints esperados:
```
GET    /api/{module}          # Lista com paginação
GET    /api/{module}/:id      # Detalhes
POST   /api/{module}          # Criar
PUT    /api/{module}/:id      # Atualizar
DELETE /api/{module}/:id      # Deletar
```

### Não esquecer:
- Filtrar sempre por `companyId` (multi-tenant)
- Validações com Zod
- Tratamento de erros com AppError
- Loading, empty e error states no frontend
- Toasts de feedback
