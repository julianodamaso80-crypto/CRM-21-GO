# Integration Modules

Este diretório contém os módulos de integração com serviços externos. Cada módulo é um singleton configurável que encapsula a lógica de comunicação com APIs de terceiros.

## Módulos Disponíveis

### 1. Stripe Integration (`stripe.integration.ts`)

Wrapper para o Stripe SDK, gerenciando pagamentos e assinaturas.

**Funcionalidades:**
- Criar e gerenciar clientes
- Criar e cancelar assinaturas
- Processar pagamentos
- Criar sessões de checkout
- Gerenciar portal de cobrança
- Processar webhooks

**Configuração (.env):**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_FREE=price_...    # Opcional
STRIPE_PRICE_ID_PRO=price_...     # Opcional
STRIPE_PRICE_ID_ENTERPRISE=price_... # Opcional
```

**Uso:**
```typescript
import { stripeIntegration } from '@/integrations'

// Criar cliente
const customer = await stripeIntegration.createCustomer({
  email: 'user@example.com',
  name: 'John Doe',
  metadata: { companyId: '123' }
})

// Criar assinatura
const subscription = await stripeIntegration.createSubscription({
  customerId: customer.id,
  priceId: 'price_xxxxx',
  trialPeriodDays: 14
})

// Criar checkout session
const session = await stripeIntegration.createCheckoutSession({
  customerEmail: 'user@example.com',
  priceId: 'price_xxxxx',
  successUrl: 'https://app.com/success',
  cancelUrl: 'https://app.com/cancel'
})

// Processar webhook
const event = await stripeIntegration.handleWebhook(
  request.rawBody,
  request.headers['stripe-signature']
)
```

---

### 2. WhatsApp Integration (`whatsapp.integration.ts`)

Integração com WhatsApp Business API (Meta/Facebook).

**Funcionalidades:**
- Enviar mensagens de texto
- Enviar templates aprovados
- Receber mensagens (webhook)
- Upload e download de mídia
- Marcar mensagens como lidas
- Verificação de webhook

**Configuração (.env):**
```env
WHATSAPP_API_TOKEN=EAAxxxxx...
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=seu_token_secreto
```

**Uso:**
```typescript
import { whatsappIntegration } from '@/integrations'

// Enviar mensagem simples
await whatsappIntegration.sendMessage({
  to: '5511999999999',
  message: 'Olá! Bem-vindo ao CRM.',
  previewUrl: true
})

// Enviar template
await whatsappIntegration.sendTemplate({
  to: '5511999999999',
  templateName: 'welcome_message',
  languageCode: 'pt_BR',
  params: ['João', 'CRM Platform']
})

// Processar mensagem recebida (no webhook)
const messages = whatsappIntegration.handleIncomingMessage(webhookPayload)
messages.forEach(msg => {
  console.log(`Mensagem de ${msg.from}: ${msg.text}`)
})

// Upload de mídia
const media = await whatsappIntegration.uploadMedia(fileBuffer, 'image/jpeg')
```

**Configuração do Webhook:**

1. Configure o webhook no Meta Business Manager
2. URL: `https://seu-dominio.com/api/webhooks/whatsapp`
3. Verify Token: valor de `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to: `messages`, `message_status`

**Exemplo de rota de webhook:**
```typescript
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  const result = whatsappIntegration.verifyWebhook(mode, token, challenge)
  if (result) {
    return res.status(200).send(result)
  }
  return res.status(403).send('Forbidden')
})

app.post('/api/webhooks/whatsapp', async (req, res) => {
  const messages = whatsappIntegration.handleIncomingMessage(req.body)
  // Processar mensagens...
  res.status(200).send('OK')
})
```

---

### 3. Email Integration (`email.integration.ts`)

Integração com serviço de email via SMTP (compatível com SendGrid, Resend, Gmail, etc.).

**Funcionalidades:**
- Enviar emails individuais
- Enviar emails usando templates
- Enviar emails em lote
- Emails pré-configurados (welcome, password reset, invoice)
- Anexos
- CC/BCC
- Verificação de conexão SMTP

**Configuração (.env):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
EMAIL_FROM=noreply@seudominio.com
```

**Provedores SMTP Comuns:**

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=senha-de-app  # Criar em: myaccount.google.com/apppasswords
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx...
```

**Resend:**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxx...
```

**Uso:**
```typescript
import { emailIntegration } from '@/integrations'

// Email simples
await emailIntegration.sendEmail({
  to: 'user@example.com',
  subject: 'Bem-vindo!',
  html: '<h1>Olá!</h1><p>Bem-vindo ao CRM.</p>',
  text: 'Olá! Bem-vindo ao CRM.'
})

// Email com template
await emailIntegration.sendTemplate({
  to: 'user@example.com',
  templateId: 'welcome',
  data: {
    name: 'João Silva',
    companyName: 'Acme Corp'
  }
})

// Email em lote
await emailIntegration.sendBatch({
  recipients: [
    {
      to: 'user1@example.com',
      subject: 'Assunto 1',
      html: '<p>Conteúdo 1</p>',
      data: { name: 'User 1' }
    },
    {
      to: 'user2@example.com',
      subject: 'Assunto 2',
      html: '<p>Conteúdo 2</p>',
      data: { name: 'User 2' }
    }
  ]
})

// Emails pré-configurados
await emailIntegration.sendWelcomeEmail('user@example.com', 'João')
await emailIntegration.sendPasswordResetEmail('user@example.com', 'reset-token')
await emailIntegration.sendInvoiceEmail('user@example.com', 'INV-001', 99.90, new Date())

// Verificar conexão
const isConnected = await emailIntegration.verifyConnection()
```

---

## Estrutura Comum

Todos os módulos de integração seguem o mesmo padrão:

### 1. Singleton Pattern
Cada módulo é exportado como uma instância única:
```typescript
export const stripeIntegration = new StripeIntegration()
```

### 2. Configuração via Environment
Todas as credenciais vêm de variáveis de ambiente configuradas em `src/config/env.ts`.

### 3. Error Handling
- Uso de `AppError` para erros de negócio
- Logging automático via `logger`
- Mensagens de erro claras e específicas

### 4. TypeScript Types
- Todas as funções têm tipos bem definidos
- Interfaces exportadas para uso externo
- JSDoc comments para documentação

### 5. Graceful Degradation
- Se credenciais não estiverem configuradas, o módulo loga um warning mas não quebra a aplicação
- Métodos verificam configuração antes de executar (`checkConfiguration()`)

---

## Boas Práticas

### 1. Tratamento de Erros
```typescript
try {
  await stripeIntegration.createCustomer(...)
} catch (error) {
  if (error instanceof AppError) {
    // Erro esperado de negócio
    logger.error(error.message)
  } else {
    // Erro inesperado
    logger.error('Unexpected error:', error)
  }
}
```

### 2. Multi-tenancy
Sempre passe `metadata` com `companyId` para rastreamento:
```typescript
await stripeIntegration.createCustomer({
  email: user.email,
  name: user.name,
  metadata: {
    companyId: user.companyId,
    userId: user.id
  }
})
```

### 3. Logging
Todos os módulos fazem logging automático, mas você pode adicionar contexto:
```typescript
logger.info('Processing payment', { userId, amount, currency })
await stripeIntegration.createPaymentIntent(...)
```

### 4. Testing
Em ambiente de desenvolvimento/teste, configure variáveis de ambiente de teste:
```env
# .env.test
STRIPE_SECRET_KEY=sk_test_...
WHATSAPP_API_TOKEN=test_token
SMTP_HOST=smtp.mailtrap.io  # Serviço de email de teste
```

---

## Webhooks

### Stripe Webhooks
Configure em: https://dashboard.stripe.com/webhooks

Eventos importantes:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### WhatsApp Webhooks
Configure em: Meta Business Manager > WhatsApp > Configuration

Eventos importantes:
- `messages` - Mensagens recebidas
- `message_status` - Status de entrega

---

## Troubleshooting

### Stripe
**Erro: Invalid API Key**
- Verifique se está usando `sk_test_` para teste ou `sk_live_` para produção
- Confirme que a key está correta no `.env`

**Erro: Webhook signature verification failed**
- Verifique `STRIPE_WEBHOOK_SECRET`
- Use `rawBody` do request (não JSON parsed)

### WhatsApp
**Erro: Invalid access token**
- Token expira a cada 60 dias
- Gere novo token no Meta Business Manager

**Erro: Message template not found**
- Template precisa ser aprovado pelo Meta primeiro
- Verifique nome e idioma do template

### Email
**Erro: Connection timeout**
- Verifique firewall/porta SMTP
- Alguns provedores bloqueiam porta 25, use 587 ou 465

**Erro: Authentication failed**
- Para Gmail, use "Senhas de app" ao invés da senha normal
- Ative "Acesso a app menos seguro" se necessário

---

## Roadmap

Integrações futuras planejadas:
- [ ] Telegram Integration
- [ ] Instagram DM Integration
- [ ] SMS Integration (Twilio)
- [ ] Push Notifications (Firebase)
- [ ] Calendar Integration (Google Calendar, Outlook)
- [ ] Storage Integration (AWS S3, MinIO) - parcialmente implementado

---

## Contribuindo

Ao adicionar nova integração:

1. Crie arquivo `{service}.integration.ts`
2. Siga o padrão singleton
3. Adicione tipos TypeScript
4. Implemente `checkConfiguration()`
5. Use `AppError` e `logger`
6. Exporte no `index.ts`
7. Atualize este README
8. Adicione variáveis no `env.ts`
