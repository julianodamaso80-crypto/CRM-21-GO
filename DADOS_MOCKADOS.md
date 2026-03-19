# 🎭 DADOS MOCKADOS - CRM IA ENTERPRISE

## ✅ Status: 100% IMPLEMENTADO COM DADOS MOCKADOS

Todas as integrações externas agora possuem **versões mockadas completas** que funcionam **sem necessidade de configurar APIs reais**.

---

## 📋 Resumo Executivo

| Integração | Status | Arquivo Mock | Teste |
|------------|--------|--------------|-------|
| **Stripe** | ✅ Funcionando | `stripe.integration.mock.ts` | ✅ Passou |
| **WhatsApp** | ✅ Funcionando | `whatsapp.integration.mock.ts` | ✅ Passou |
| **Email** | ✅ Funcionando | `email.integration.mock.ts` | ✅ Passou |

---

## 🔧 Configurações Mockadas (.env)

Todas as credenciais no arquivo `.env` são **dados falsos/mockados**:

```env
# Stripe - MOCK DATA (não são credenciais reais)
STRIPE_SECRET_KEY=sk_test_51MxYz2L3K4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l
STRIPE_WEBHOOK_SECRET=whsec_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z

# WhatsApp - MOCK DATA
WHATSAPP_API_TOKEN=EAAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=crm_whatsapp_verify_token_mock_12345

# Email - MOCK DATA
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=mock_user_12345abcdef
SMTP_PASSWORD=mock_password_67890ghijkl
EMAIL_FROM=noreply@crmtubominas.com.br

# AI APIs - MOCK DATA
OPENAI_API_KEY=sk-mock1234567890abcdefghijklmnopqrstuvwxyz1234567890AB
ANTHROPIC_API_KEY=sk-ant-mock1234567890abcdefghijklmnopqrstuvwxyz
GOOGLE_AI_API_KEY=AIzaMockKey1234567890abcdefghijklmnopqrstuvwxyz
```

⚠️ **IMPORTANTE**: Estas NÃO são credenciais reais. São apenas strings mockadas para desenvolvimento.

---

## 🚀 Como Usar

### Executar o Servidor Mock

```bash
cd backend
npm run dev:mock
```

O servidor iniciará em `http://localhost:3333` com:
- ✅ Todos os endpoints funcionando
- ✅ Dados mockados em memória
- ✅ Sem necessidade de banco de dados
- ✅ Integrações mockadas ativas

### Testar as Integrações Mockadas

```bash
cd backend
npx tsx src/integrations/test-integrations.mock.ts
```

**Saída esperada:**

```
🧪 TESTANDO INTEGRAÇÕES MOCKADAS
============================================================

💳 Testando Stripe Mock...
✅ Cliente criado: cus_mock_1769806004945_ldbqt
✅ Assinatura criada: sub_mock_1769806004945_8upevo - Status: active
✅ Pagamento criado: pi_mock_1769806004946_qci20d - Status: succeeded
✅ Planos disponíveis: 3
✅ Assinatura cancelada: canceled

💬 Testando WhatsApp Mock...
✅ Mensagem enviada: wamid_mock_1769806004946_wfhx5h
✅ Template enviado: wamid_mock_1769806004947_k4yfap
✅ Mensagem marcada como lida
✅ Total de mensagens enviadas: 2

📧 Testando Email Mock...
✅ Conexão verificada: true
✅ Email enviado: email_mock_1769806004948_rmtaoc
✅ Email de boas-vindas enviado: email_mock_1769806004948_mx3z9p
✅ Email de reset enviado: email_mock_1769806004948_zst3rxj
✅ Email de fatura enviado: email_mock_1769806004962_k1sxen
✅ Lote de emails enviado: 3 emails
✅ Total de emails enviados: 7

============================================================
✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!
```

---

## 📦 Arquivos Criados

### Backend - Integrações Mockadas

```
backend/src/integrations/
├── stripe.integration.ts              # Stripe REAL
├── stripe.integration.mock.ts         # Stripe MOCK ✨ NOVO
├── whatsapp.integration.ts            # WhatsApp REAL
├── whatsapp.integration.mock.ts       # WhatsApp MOCK ✨ NOVO
├── email.integration.ts               # Email REAL
├── email.integration.mock.ts          # Email MOCK ✨ NOVO
├── test-integrations.mock.ts          # Testes ✨ NOVO
├── index.ts                           # Exports (atualizado)
├── README.md                          # Doc APIs reais
└── README.MOCK.md                     # Doc APIs mock ✨ NOVO
```

### Configurações

```
backend/
├── .env                               # Credenciais mockadas ✨ ATUALIZADO
└── .env.example                       # Template completo ✨ ATUALIZADO
```

---

## 💡 Funcionalidades das Versões Mock

### Stripe Mock

- ✅ Criar clientes (`createCustomer`)
- ✅ Criar assinaturas (`createSubscription`)
- ✅ Cancelar assinaturas (`cancelSubscription`)
- ✅ Atualizar assinaturas (`updateSubscription`)
- ✅ Processar pagamentos (`createPaymentIntent`)
- ✅ Processar webhooks (`handleWebhook`)
- ✅ Listar planos (`listPlans`)
- ✅ Buscar dados (`getCustomer`, `getSubscription`)
- ✅ Criar checkout sessions (`createCheckoutSession`)
- ✅ Portal de cobrança (`createBillingPortalSession`)

**Exemplo de uso:**

```typescript
import { stripeServiceMock } from './integrations'

const customer = await stripeServiceMock.createCustomer(
  'user@email.com',
  'Empresa XYZ'
)

const subscription = await stripeServiceMock.createSubscription(
  customer.id,
  'price_pro'
)
```

### WhatsApp Mock

- ✅ Enviar mensagens de texto (`sendMessage`)
- ✅ Enviar templates (`sendTemplate`)
- ✅ Processar mensagens recebidas (`handleIncomingMessage`)
- ✅ Verificar webhooks (`verifyWebhook`)
- ✅ Buscar URLs de mídia (`getMediaUrl`)
- ✅ Download de mídia (`downloadMedia`)
- ✅ Marcar como lido (`markAsRead`)
- ✅ Histórico de mensagens (`getSentMessages`)

**Exemplo de uso:**

```typescript
import { whatsappServiceMock } from './integrations'

await whatsappServiceMock.sendMessage(
  '5511999998888',
  'Olá! Sua consulta foi agendada.'
)

await whatsappServiceMock.sendTemplate(
  '5511999998888',
  'appointment_reminder',
  'pt_BR',
  [{ type: 'body', parameters: [{ type: 'text', text: '25/01 14:00' }] }]
)
```

### Email Mock

- ✅ Enviar emails simples (`sendEmail`)
- ✅ Enviar com templates (`sendTemplate`)
- ✅ Envio em lote (`sendBatch`)
- ✅ Verificar conexão (`verifyConnection`)
- ✅ Email de boas-vindas (`sendWelcomeEmail`)
- ✅ Email de reset de senha (`sendPasswordResetEmail`)
- ✅ Email de fatura (`sendInvoiceEmail`)
- ✅ Histórico de emails (`getSentEmails`)

**Exemplo de uso:**

```typescript
import { emailServiceMock } from './integrations'

await emailServiceMock.sendWelcomeEmail(
  'user@email.com',
  'João Silva'
)

await emailServiceMock.sendEmail(
  'user@email.com',
  'Assunto',
  '<h1>Conteúdo HTML</h1>'
)

await emailServiceMock.sendBatch([
  { to: 'user1@email.com', subject: 'Newsletter', html: '...' },
  { to: 'user2@email.com', subject: 'Newsletter', html: '...' },
])
```

---

## 🎯 Benefícios

### ✅ Desenvolvimento Rápido
- Não precisa configurar credenciais reais
- Funciona offline
- Sem custos de API

### ✅ Testes Confiáveis
- Respostas previsíveis
- Sem rate limits
- Sem falhas de rede

### ✅ Debug Fácil
- Logs detalhados de todas operações
- Histórico completo de chamadas
- Inspeção de dados enviados

### ✅ Zero Configuração
- Já vem configurado no `.env`
- Funciona out-of-the-box
- Pronto para usar

---

## 📊 Dados Mockados no Server.mock.ts

O arquivo `server.mock.ts` também possui dados mockados completos:

### Convênios (6 mockados)
- Unimed
- Amil
- Bradesco Saúde
- SulAmérica
- Golden Cross
- NotreDame Intermédica

### Médicos (5 mockados)
- Dr. Carlos Silva (Cardiologia)
- Dra. Ana Santos (Pediatria)
- Dr. Roberto Lima (Ortopedia)
- Dra. Maria Costa (Dermatologia)
- Dr. João Oliveira (Clínico Geral)

### Pacientes (10 mockados)
- Maria Silva
- João Santos
- Ana Oliveira
- Pedro Costa
- Juliana Lima
- E mais 5...

### Consultas (15 mockadas)
- Distribuídas entre médicos e pacientes
- Diferentes tipos (primeira consulta, retorno, exame)
- Status variados (agendada, confirmada, concluída)

### Contatos (15 mockados)
- Dados completos (nome, email, telefone, empresa)
- Com tags e campos customizados

### Leads (20 mockados)
- Diferentes fontes (website, WhatsApp, Instagram, Google, Facebook)
- Com UTM tracking completo
- Status variados (new, contacted, qualified)

### E mais...
- ✅ Pipelines e Kanban boards
- ✅ Webhooks
- ✅ Automations
- ✅ AI Agents e Knowledge Bases
- ✅ Analytics e Dashboard stats
- ✅ Billing e Invoices

---

## 🔄 Migrar para Produção

Quando estiver pronto para usar APIs reais:

### 1. Configure credenciais reais no `.env`:

```env
# Stripe REAL
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp REAL
WHATSAPP_API_TOKEN=EAAreal_token_here...
WHATSAPP_PHONE_NUMBER_ID=real_phone_id

# Email REAL (ex: SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.real_api_key_here
```

### 2. Altere os imports no código:

```typescript
// De:
import { stripeServiceMock } from './integrations'

// Para:
import { stripeIntegration } from './integrations'
```

### 3. Teste com cautela
- APIs reais têm custos
- APIs reais têm rate limits
- Webhooks precisam de URLs públicas

---

## 📚 Documentação Completa

- **Integrações Reais**: Ver `backend/src/integrations/README.md`
- **Integrações Mock**: Ver `backend/src/integrations/README.MOCK.md`
- **Variáveis de Ambiente**: Ver `backend/.env.example`

---

## ✅ Status Final

### Backend
- ✅ Todas integrações com versão mock
- ✅ Todos os testes passando
- ✅ TypeScript sem erros
- ✅ Build compilando
- ✅ Dados mockados completos no .env
- ✅ Server.mock.ts com dados ricos

### Frontend
- ✅ Serviços healthcare criados
- ✅ Hooks React Query criados
- ✅ Rotas configuradas
- ✅ Socket.io implementado
- ✅ TypeScript sem erros
- ✅ Build compilando

### Integrações
- ✅ Stripe Mock: 10 métodos implementados
- ✅ WhatsApp Mock: 8 métodos implementados
- ✅ Email Mock: 8 métodos implementados
- ✅ Testes: 100% passando

---

## 🎉 Conclusão

**TUDO ESTÁ MOCKADO E FUNCIONANDO!**

Você pode desenvolver e testar toda a aplicação sem precisar:
- ❌ Configurar contas em APIs externas
- ❌ Gastar créditos de API
- ❌ Depender de internet
- ❌ Configurar banco de dados

Basta rodar `npm run dev:mock` e começar a desenvolver! 🚀

---

## 🆘 Suporte

Problemas com as integrações mockadas?

1. **Verificar logs**: Todas operações têm logs detalhados
2. **Executar testes**: `npx tsx src/integrations/test-integrations.mock.ts`
3. **Verificar .env**: Conferir se as variáveis estão corretas
4. **Limpar histórico**: Use `.clearHistory()` nos mocks

**Happy coding com dados mockados! 🎭**
