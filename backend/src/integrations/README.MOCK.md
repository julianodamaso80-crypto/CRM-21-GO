# 🔧 Integrações Mockadas - CRM IA Enterprise

## Visão Geral

Este projeto possui **versões mockadas** de todas as integrações externas para facilitar o desenvolvimento e testes **sem necessidade de configurar APIs reais**.

## 🎯 Benefícios

✅ **Desenvolvimento rápido** - Não precisa configurar credenciais de API
✅ **Testes confiáveis** - Respostas previsíveis e controladas
✅ **Sem custos** - Não gasta créditos de APIs pagas
✅ **Offline** - Funciona sem internet
✅ **Debug fácil** - Logs claros de todas as operações

---

## 📦 Integrações Mockadas Disponíveis

### 1. **Stripe Mock** ([stripe.integration.mock.ts](stripe.integration.mock.ts))

Simula todas as operações do Stripe:
- ✅ Criar clientes
- ✅ Criar/cancelar/atualizar assinaturas
- ✅ Processar pagamentos
- ✅ Listar planos
- ✅ Criar checkout sessions
- ✅ Processar webhooks

### 2. **WhatsApp Mock** ([whatsapp.integration.mock.ts](whatsapp.integration.mock.ts))

Simula o WhatsApp Business API:
- ✅ Enviar mensagens de texto
- ✅ Enviar templates
- ✅ Processar mensagens recebidas
- ✅ Upload/download de mídia
- ✅ Marcar como lido
- ✅ Verificar webhooks

### 3. **Email Mock** ([email.integration.mock.ts](email.integration.mock.ts))

Simula servidor SMTP:
- ✅ Enviar emails individuais
- ✅ Enviar com templates
- ✅ Envio em lote
- ✅ Templates pré-definidos (welcome, reset password, invoice)
- ✅ Histórico de emails enviados

---

## 🚀 Como Usar

### Modo Automático (Recomendado)

As versões mockadas são usadas **automaticamente em modo desenvolvimento**:

```typescript
import { stripeServiceMock, whatsappServiceMock, emailServiceMock } from './integrations'

// Usar exatamente como as versões reais
await emailServiceMock.sendEmail('user@email.com', 'Assunto', '<h1>HTML</h1>')
await whatsappServiceMock.sendMessage('5511999998888', 'Olá!')
await stripeServiceMock.createCustomer('user@email.com', 'Nome')
```

### Configuração no .env

As credenciais mockadas já estão no `.env`:

```env
# Stripe - MOCK DATA (não são credenciais reais)
STRIPE_SECRET_KEY=sk_test_51MxYz2L3K4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l
STRIPE_WEBHOOK_SECRET=whsec_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z

# WhatsApp - MOCK DATA
WHATSAPP_API_TOKEN=EAAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=crm_whatsapp_verify_token_mock_12345

# Email - MOCK DATA (Mailtrap é um serviço de email de testes)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=mock_user_12345abcdef
SMTP_PASSWORD=mock_password_67890ghijkl
EMAIL_FROM=noreply@crmtubominas.com.br
```

---

## 🧪 Testar as Integrações

Execute o script de teste:

```bash
cd backend
npx tsx src/integrations/test-integrations.mock.ts
```

**Saída esperada:**

```
🧪 TESTANDO INTEGRAÇÕES MOCKADAS

============================================================

💳 Testando Stripe Mock...

✅ Cliente criado: cus_mock_1738275123_a1b2c3
✅ Assinatura criada: sub_mock_1738275124_d4e5f6 - Status: active
✅ Pagamento criado: pi_mock_1738275125_g7h8i9 - Status: succeeded
✅ Planos disponíveis: 3
✅ Assinatura cancelada: canceled

💬 Testando WhatsApp Mock...

✅ Mensagem enviada: wamid_mock_1738275126_j0k1l2
✅ Template enviado: wamid_mock_1738275127_m3n4o5
✅ Mensagem marcada como lida
✅ Total de mensagens enviadas: 2

📧 Testando Email Mock...

✅ Conexão verificada: true
✅ Email enviado: email_mock_1738275128_p6q7r8
✅ Email de boas-vindas enviado: email_mock_1738275129_s9t0u1
✅ Email de reset enviado: email_mock_1738275130_v2w3x4
✅ Email de fatura enviado: email_mock_1738275131_y5z6a7
✅ Lote de emails enviado: 3 emails
✅ Total de emails enviados: 7

============================================================

✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!

📊 Resumo:
  - Stripe: Funcionando (mock)
  - WhatsApp: Funcionando (mock)
  - Email: Funcionando (mock)

💡 As integrações mockadas estão prontas para uso em desenvolvimento!
```

---

## 📝 Exemplos de Uso

### Stripe Mock

```typescript
import { stripeServiceMock } from '../integrations'

// Criar cliente
const customer = await stripeServiceMock.createCustomer(
  'cliente@empresa.com',
  'Empresa XYZ Ltda'
)

// Criar assinatura no plano Pro
const subscription = await stripeServiceMock.createSubscription(
  customer.id,
  'price_pro'
)

// Processar pagamento único
const payment = await stripeServiceMock.createPaymentIntent(
  9900, // R$ 99.00 em centavos
  'brl',
  customer.id
)

// Listar todos os planos disponíveis
const plans = await stripeServiceMock.listPlans()
```

### WhatsApp Mock

```typescript
import { whatsappServiceMock } from '../integrations'

// Enviar mensagem simples
const message = await whatsappServiceMock.sendMessage(
  '5511999998888',
  'Olá! Sua consulta foi agendada para amanhã às 14h.'
)

// Enviar template (mensagem pré-aprovada)
const template = await whatsappServiceMock.sendTemplate(
  '5511999998888',
  'appointment_reminder',
  'pt_BR',
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'Dr. João Silva' },
        { type: 'text', text: '25/01/2026 14:00' },
      ],
    },
  ]
)

// Marcar mensagem como lida
await whatsappServiceMock.markAsRead(message.id)

// Ver histórico de mensagens enviadas
const history = whatsappServiceMock.getSentMessages()
console.log(`Total de mensagens: ${history.length}`)
```

### Email Mock

```typescript
import { emailServiceMock } from '../integrations'

// Email simples
await emailServiceMock.sendEmail(
  'usuario@email.com',
  'Bem-vindo ao CRM',
  '<h1>Olá!</h1><p>Seja bem-vindo.</p>'
)

// Email de boas-vindas (template pré-definido)
await emailServiceMock.sendWelcomeEmail(
  'novousuario@email.com',
  'João Silva'
)

// Email de reset de senha
await emailServiceMock.sendPasswordResetEmail(
  'usuario@email.com',
  'João Silva',
  'token-abc123'
)

// Email de fatura
await emailServiceMock.sendInvoiceEmail(
  'usuario@email.com',
  'João Silva',
  {
    id: 'INV-001',
    amount: 9900,
    dueDate: new Date(),
    status: 'open',
    url: 'https://...',
  }
)

// Envio em lote
await emailServiceMock.sendBatch([
  { to: 'user1@email.com', subject: 'Newsletter', html: '...' },
  { to: 'user2@email.com', subject: 'Newsletter', html: '...' },
  { to: 'user3@email.com', subject: 'Newsletter', html: '...' },
])

// Ver histórico
const emails = emailServiceMock.getSentEmails()
```

---

## 🔄 Mudar para Integrações Reais

Quando estiver pronto para usar as APIs reais:

1. **Configure as credenciais reais** no `.env`
2. **Importe as versões reais** das integrações:

```typescript
// De:
import { stripeServiceMock } from './integrations'

// Para:
import { stripeIntegration } from './integrations'
```

3. **Teste com cautela** - APIs reais podem ter custos e rate limits

---

## 🐛 Debug e Logs

Todos os mocks têm logs detalhados:

```
[Stripe Mock] Cliente criado: cus_mock_1738275123_a1b2c3
[WhatsApp Mock] Mensagem enviada para 5511999998888: "Olá! Esta é uma..."
[WhatsApp Mock] Mensagem wamid_mock_1738275126_j0k1l2 entregue
[Email Mock] Email enviado para usuario@email.com: "Bem-vindo ao CRM"
[Email Mock] Email email_mock_1738275128_p6q7r8 entregue
```

---

## ✅ Vantagens das Versões Mock

| Aspecto | Mock | Real |
|---------|------|------|
| **Setup** | Nenhum | Configurar credenciais |
| **Custo** | Grátis | Pode ter custos |
| **Internet** | Não precisa | Necessário |
| **Velocidade** | Instantâneo | Depende da API |
| **Previsibilidade** | 100% | Pode ter erros |
| **Debug** | Fácil | Difícil |

---

## 📚 Arquivos

```
backend/src/integrations/
├── stripe.integration.ts          # Stripe REAL
├── stripe.integration.mock.ts     # Stripe MOCK ✨
├── whatsapp.integration.ts        # WhatsApp REAL
├── whatsapp.integration.mock.ts   # WhatsApp MOCK ✨
├── email.integration.ts           # Email REAL
├── email.integration.mock.ts      # Email MOCK ✨
├── test-integrations.mock.ts      # Script de teste ✨
├── index.ts                       # Exports
├── README.md                      # Doc das APIs reais
└── README.MOCK.md                 # Este arquivo ✨
```

---

## 🎓 Quando Usar Cada Versão

### Use MOCK quando:
- ✅ Está desenvolvendo novas features
- ✅ Quer rodar testes automatizados
- ✅ Não tem internet
- ✅ Não quer gastar créditos de API
- ✅ Precisa de respostas previsíveis

### Use REAL quando:
- ✅ Está em produção
- ✅ Precisa integrar com sistemas externos
- ✅ Quer testar o fluxo completo end-to-end
- ✅ Precisa validar webhooks reais

---

## 🚀 Conclusão

As integrações mockadas permitem que você desenvolva e teste **toda a aplicação sem dependências externas**. Quando estiver pronto para produção, basta trocar para as versões reais!

**Happy coding! 🎉**
