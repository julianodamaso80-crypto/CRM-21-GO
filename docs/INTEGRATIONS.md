# Guia de Integrações Externas

## 📱 WhatsApp Business API

### Requisitos
- Conta no Meta Business Manager
- Aplicativo Meta configurado
- Token de acesso do WhatsApp Business API

### Configuração
1. Acesse [Meta Business Suite](https://business.facebook.com)
2. Crie um App no Meta for Developers
3. Adicione WhatsApp Business API ao app
4. Configure webhook para receber mensagens
5. Obtenha o token de acesso

### Variáveis de Ambiente
```env
WHATSAPP_API_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
```

### Endpoints Implementados
- `POST /api/webhooks/whatsapp` - Receber mensagens
- Backend: `backend/src/modules/inbox/inbox.service.ts`

---

## 📷 Instagram Messaging

### Requisitos
- Página do Instagram Business
- Vinculada ao Meta Business Manager
- Permissões de mensagens

### Configuração
1. Conecte Instagram ao Meta Business
2. Obtenha App ID e App Secret
3. Configure webhook para mensagens

### Variáveis de Ambiente
```env
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
```

### Endpoints Implementados
- `POST /api/webhooks/instagram` - Receber mensagens DM
- Backend: `backend/src/modules/inbox/inbox.service.ts`

---

## 💳 Stripe (Pagamentos)

### Requisitos
- Conta Stripe ativa
- Secret Key e Webhook Secret

### Configuração
1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Copie suas API Keys
3. Configure webhook endpoint: `https://your-domain.com/api/billing/webhook`
4. Copie o Webhook Secret

### Variáveis de Ambiente
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_FREE=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

### Funcionalidades
- Assinaturas recorrentes
- Gerenciamento de faturas
- Webhook para atualização automática
- Backend: `backend/src/modules/billing/billing.service.ts`
- Frontend: `frontend/src/pages/billing/BillingPage.tsx`

---

## 📧 Email (SMTP)

### Requisitos
- Servidor SMTP ou serviço como SendGrid/Mailgun

### Configuração SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@yourcompany.com
```

### Configuração Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=your@gmail.com
```

---

## 🤖 AI Providers

### OpenAI
```env
OPENAI_API_KEY=sk-...
DEFAULT_AI_PROVIDER=openai
```
[Obter chave](https://platform.openai.com/api-keys)

### Anthropic (Claude)
```env
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_AI_PROVIDER=anthropic
```
[Obter chave](https://console.anthropic.com)

### Google AI (Gemini)
```env
GOOGLE_AI_API_KEY=AIza...
DEFAULT_AI_PROVIDER=google
```
[Obter chave](https://makersuite.google.com/app/apikey)

### Funcionalidades
- Chat com IA
- Análise de documentos
- Assistente virtual
- Backend: `backend/src/modules/ai/`
- Frontend: `frontend/src/pages/ai/`

---

## ☁️ Storage (MinIO/S3)

### MinIO (Local)
```env
STORAGE_TYPE=minio
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=crm-files
```

### AWS S3
```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

### Upload Implementado
- Endpoint: `POST /api/upload`
- Múltiplos arquivos: `POST /api/upload/multiple`
- Frontend: `frontend/src/components/FileUpload.tsx`

---

## 🔔 Notificações Push (Opcional)

### Firebase Cloud Messaging
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

---

## ✅ Status de Integração

| Serviço | Backend | Frontend | Docs |
|---------|---------|----------|------|
| WhatsApp | ✅ | ✅ (Inbox) | ✅ |
| Instagram | ✅ | ✅ (Inbox) | ✅ |
| Stripe | ✅ | ✅ | ✅ |
| Email/SMTP | ✅ | - | ✅ |
| OpenAI | ✅ | ✅ | ✅ |
| Anthropic | ✅ | ✅ | ✅ |
| Google AI | ✅ | ✅ | ✅ |
| MinIO/S3 | ✅ | ✅ | ✅ |

---

## 📝 Próximos Passos

1. Adicione as variáveis de ambiente em `backend/.env`
2. Reinicie o backend: `npm run dev`
3. Teste as integrações via frontend
4. Configure webhooks nas plataformas externas
5. Monitore logs em `backend/src/utils/logger.ts`

---

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se as chaves estão corretas no `.env`
- Confirme que as variáveis foram carregadas (veja logs do backend)

### Webhook não recebe dados
- Verifique URL pública (ngrok para desenvolvimento)
- Confirme que o webhook está registrado na plataforma
- Veja logs em `backend/src/modules/webhooks/webhooks.service.ts`

### Rate limit excedido
- Ajuste `RATE_LIMIT_MAX_REQUESTS` e `RATE_LIMIT_WINDOW_MS`
- Configure limites por API externa

---

**Documentação completa:** [README.md](../README.md)
