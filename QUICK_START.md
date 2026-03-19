# QUICK START - 21Go CRM

## Start em 3 Passos

### 1. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Iniciar Servidor Mock

```bash
# Terminal 1 - Backend
cd backend
npm run dev:mock
```

Backend rodando em `http://localhost:3333`

### 3. Iniciar Frontend

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend rodando em `http://localhost:5173`

---

## Login

```
Email: damasojuliano@gmail.com
Senha: (definida pelo admin)
```

### Dados Disponiveis (Mock)

- 15 Associados
- 20 Leads
- Funil de vendas com 6 fases
- 10 Agentes de IA

### Integracoes Mockadas

- Stripe - Pagamentos e assinaturas
- WhatsApp - Envio de mensagens
- Email - SMTP mockado

---

## Testar Integracoes

```bash
cd backend
npx tsx src/integrations/test-integrations.mock.ts
```

---

## Rotas Disponiveis

### Frontend

```
http://localhost:5173/
http://localhost:5173/associados     # Associados
http://localhost:5173/leads          # Leads
http://localhost:5173/deals          # Negocios
http://localhost:5173/pipes          # Processos Kanban
http://localhost:5173/inbox          # Chat
http://localhost:5173/ai             # IA (10 agentes)
http://localhost:5173/nps            # NPS
http://localhost:5173/analytics      # Analytics
http://localhost:5173/billing        # Cobranca
http://localhost:5173/projects       # Projetos
```

### Backend

```
http://localhost:3333/health
http://localhost:3333/api/contacts
http://localhost:3333/api/leads
http://localhost:3333/api/pipes
http://localhost:3333/api/nps
```

---

## Comandos Uteis

### Build

```bash
# Backend
cd backend
npm run build
npm run type-check

# Frontend
cd frontend
npm run build
npm run type-check
```

### Desenvolvimento

```bash
# Backend com PostgreSQL (requer DB configurado)
cd backend
npm run dev

# Backend mock (sem DB)
cd backend
npm run dev:mock

# Frontend
cd frontend
npm run dev
```

### Prisma (se usar DB real)

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma studio
npm run prisma:seed
```

---

## FAQ

**Q: Preciso configurar banco de dados?**
A: Nao! O `server.mock.ts` funciona sem DB.

**Q: Preciso configurar Stripe/WhatsApp/Email?**
A: Nao! Versoes mockadas funcionam sem APIs reais.

**Q: Posso usar em producao?**
A: Sim, mas configure as APIs reais primeiro.

---

**21Go Protecao Veicular** | CRM + IA
