# 🚀 QUICK START - CRM IA ENTERPRISE

## ⚡ Start em 3 Passos

### 1️⃣ Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2️⃣ Iniciar Servidor Mock

```bash
# Terminal 1 - Backend
cd backend
npm run dev:mock
```

✅ Backend rodando em `http://localhost:3333`

### 3️⃣ Iniciar Frontend

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

---

## 🎭 TUDO ESTÁ MOCKADO!

### Login

```
Email: admin@crm.com
Senha: Admin123!
```

### Dados Disponíveis

- ✅ 6 Convênios
- ✅ 5 Médicos
- ✅ 10 Pacientes
- ✅ 15 Consultas
- ✅ 15 Contatos
- ✅ 20 Leads

### Integrações Mockadas

- ✅ **Stripe** - Pagamentos e assinaturas
- ✅ **WhatsApp** - Envio de mensagens
- ✅ **Email** - SMTP mockado

---

## 🧪 Testar Integrações

```bash
cd backend
npx tsx src/integrations/test-integrations.mock.ts
```

Você verá:
```
✅ Stripe: 5/5 operações OK
✅ WhatsApp: 4/4 operações OK
✅ Email: 7/7 emails enviados
```

---

## 📁 Rotas Disponíveis

### Frontend

```
http://localhost:5173/
http://localhost:5173/doctors       # Médicos
http://localhost:5173/convenios     # Convênios
http://localhost:5173/agenda        # Consultas
http://localhost:5173/prontuario    # Prontuários
http://localhost:5173/nps           # NPS
http://localhost:5173/patients      # Pacientes
http://localhost:5173/leads         # Leads
http://localhost:5173/deals         # Negócios
http://localhost:5173/pipes         # Processos Kanban
http://localhost:5173/inbox         # Chat
http://localhost:5173/ai            # IA
http://localhost:5173/analytics     # Analytics
http://localhost:5173/billing       # Cobrança
```

### Backend

```
http://localhost:3333/health
http://localhost:3333/api/doctors
http://localhost:3333/api/convenios
http://localhost:3333/api/appointments
http://localhost:3333/api/medical-records
http://localhost:3333/api/nps
http://localhost:3333/api/contacts
http://localhost:3333/api/leads
http://localhost:3333/api/pipes
```

---

## 📚 Documentação

| Tópico | Arquivo |
|--------|---------|
| **Dados Mockados** | [DADOS_MOCKADOS.md](DADOS_MOCKADOS.md) |
| **Implementação Completa** | [IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md) |
| **Integrações Mock** | [backend/src/integrations/README.MOCK.md](backend/src/integrations/README.MOCK.md) |
| **Socket.io** | [docs/SOCKET_IO_IMPLEMENTATION.md](docs/SOCKET_IO_IMPLEMENTATION.md) |

---

## 💡 Comandos Úteis

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

# Gerar cliente
npx prisma generate

# Criar migration
npx prisma migrate dev

# Ver banco no browser
npx prisma studio

# Executar seed
npm run prisma:seed
```

---

## 🎯 Próximos Passos

### Para Desenvolvimento

1. ✅ Tudo pronto! Comece a codificar
2. Explore as páginas healthcare
3. Teste as integrações mockadas
4. Implemente features real-time com Socket.io

### Para Produção

1. Configure PostgreSQL
2. Configure APIs reais (Stripe, WhatsApp, Email)
3. Deploy backend (Railway, Render, AWS)
4. Deploy frontend (Vercel, Netlify)

---

## ❓ FAQ

**Q: Preciso configurar banco de dados?**
A: Não! O `server.mock.ts` funciona sem DB.

**Q: Preciso configurar Stripe/WhatsApp/Email?**
A: Não! Versões mockadas funcionam sem APIs reais.

**Q: Como testar as integrações?**
A: Execute `npx tsx src/integrations/test-integrations.mock.ts`

**Q: Socket.io já está funcionando?**
A: Sim! Backend e frontend já estão integrados.

**Q: Posso usar em produção?**
A: Sim, mas configure as APIs reais primeiro.

---

## 📞 Suporte

Encontrou algum problema?

1. Verifique os logs no terminal
2. Leia a documentação em [IMPLEMENTACAO_COMPLETA.md](IMPLEMENTACAO_COMPLETA.md)
3. Teste as integrações mock

---

**Desenvolvido com ❤️**

Bom desenvolvimento! 🚀
