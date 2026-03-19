# GUIA DE INÍCIO - CRM IA ENTERPRISE

## Pré-requisitos

- Node.js 20+ ([Download](https://nodejs.org/))
- Docker e Docker Compose ([Download](https://www.docker.com/))
- Git ([Download](https://git-scm.com/))

## 1. Clone e Setup Inicial

```bash
# Clone o repositório
git clone <repo-url>
cd crm-saas

# Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# Edite o .env com suas configurações
# IMPORTANTE: Mude os secrets em produção!
```

## 2. Iniciar com Docker (Recomendado)

```bash
# Iniciar todos os serviços
npm run docker:up

# Acessar:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3333
# - API Docs: http://localhost:3333/docs
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - MinIO: http://localhost:9001 (console)

# Ver logs
npm run docker:logs

# Parar serviços
npm run docker:down
```

## 3. Desenvolvimento Local (Sem Docker)

### 3.1 Instalar Dependências

```bash
# Instalar dependências do monorepo
npm install

# Instalar dependências individuais
npm install --workspace=backend
npm install --workspace=frontend
```

### 3.2 Configurar Banco de Dados

```bash
# Certifique-se que PostgreSQL está rodando
# DATABASE_URL no .env deve estar correto

# Executar migrations
cd backend
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# (Opcional) Popular banco com dados de exemplo
npm run prisma:seed
```

### 3.3 Iniciar Servidores

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## 4. Estrutura do Projeto

```
crm-saas/
├── backend/              # API Node.js + Fastify
│   ├── src/
│   │   ├── controllers/  # HTTP endpoints
│   │   ├── services/     # Lógica de negócio
│   │   ├── repositories/ # Acesso a dados
│   │   ├── middlewares/  # Auth, RBAC, etc
│   │   └── config/       # Configurações
│   └── prisma/
│       └── schema.prisma # Schema do banco
│
├── frontend/             # React + Vite
│   └── src/
│       ├── components/   # Componentes React
│       ├── pages/        # Páginas (rotas)
│       ├── services/     # API clients
│       └── store/        # State management
│
├── shared/               # Código compartilhado
│   └── types/            # TypeScript types
│
├── docker/               # Docker configs
│   └── docker-compose.yml
│
└── docs/                 # Documentação
    ├── ARCHITECTURE.md
    └── ROADMAP.md
```

## 5. Comandos Úteis

### Backend

```bash
# Development
npm run dev:backend

# Build
npm run build --workspace=backend

# Type checking
npm run type-check --workspace=backend

# Prisma Studio (GUI do banco)
npm run prisma:studio

# Criar migration
cd backend
npx prisma migrate dev --name nome_da_migration
```

### Frontend

```bash
# Development
npm run dev:frontend

# Build
npm run build --workspace=frontend

# Preview build
npm run preview --workspace=frontend
```

### Docker

```bash
# Iniciar
npm run docker:up

# Parar
npm run docker:down

# Logs
npm run docker:logs

# Rebuild images
docker-compose -f docker/docker-compose.yml build
```

## 6. Acessar Interfaces

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:3333 | - |
| API Docs | http://localhost:3333/docs | - |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin |
| Prisma Studio | http://localhost:5555 | - |

## 7. Primeiros Passos no Sistema

### 7.1 Criar Primeiro Usuário (via API)

```bash
# POST http://localhost:3333/api/auth/register
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SenhaForte123!",
    "firstName": "Admin",
    "lastName": "Sistema",
    "companyName": "Minha Empresa"
  }'
```

### 7.2 Fazer Login

```bash
# POST http://localhost:3333/api/auth/login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SenhaForte123!"
  }'

# Resposta conterá:
# { "token": "...", "refreshToken": "...", "user": {...} }
```

### 7.3 Usar Token nas Requests

```bash
# Exemplo: Listar leads
curl http://localhost:3333/api/leads \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 8. Variáveis de Ambiente Importantes

### Obrigatórias

```env
DATABASE_URL=postgresql://crm_user:crm_password@localhost:5432/crm_database
JWT_SECRET=seu-secret-super-seguro-aqui
REFRESH_TOKEN_SECRET=outro-secret-diferente
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3333
```

### Opcionais (para recursos avançados)

```env
# IA
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# WhatsApp
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 9. Troubleshooting

### Erro: "Port already in use"

```bash
# Verificar processo usando a porta
# Windows
netstat -ano | findstr :3333

# Linux/Mac
lsof -i :3333

# Matar processo ou mudar PORT no .env
```

### Erro: "Prisma Client não gerado"

```bash
cd backend
npx prisma generate
```

### Erro: "Database connection failed"

1. Verifique se PostgreSQL está rodando
2. Verifique DATABASE_URL no .env
3. Teste conexão: `psql -h localhost -U crm_user -d crm_database`

### Frontend não conecta no backend

1. Verifique CORS no backend (CORS_ORIGIN no .env)
2. Verifique proxy no vite.config.ts
3. Verifique se backend está rodando

## 10. Próximos Passos

1. Explorar [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a arquitetura
2. Ler [ROADMAP.md](./ROADMAP.md) para ver o plano de desenvolvimento
3. Consultar API Docs em http://localhost:3333/docs
4. Começar a desenvolver funcionalidades seguindo o roadmap

## 11. Recursos Adicionais

- [Prisma Docs](https://www.prisma.io/docs)
- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [React Docs](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Suporte

Para dúvidas ou problemas:
1. Consulte a documentação em `/docs`
2. Verifique issues existentes no GitHub
3. Abra uma nova issue com detalhes do problema
