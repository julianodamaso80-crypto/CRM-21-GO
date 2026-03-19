/**
 * Integration modules for external services
 *
 * All integrations are exported as singleton instances and configured
 * via environment variables. Each integration handles its own error
 * management and logging.
 *
 * 🔧 MODO DESENVOLVIMENTO: Exporta versões MOCKADAS (sem API real)
 * 💼 MODO PRODUÇÃO: Exporta versões REAIS (com APIs configuradas)
 */

// Exporta integrações REAIS
export { stripeIntegration } from './stripe.integration'
export { whatsappIntegration } from './whatsapp.integration'
export { emailIntegration } from './email.integration'

// Exporta integrações MOCKADAS (para desenvolvimento/testes)
export { stripeServiceMock } from './stripe.integration.mock'
export { whatsappServiceMock } from './whatsapp.integration.mock'
export { emailServiceMock } from './email.integration.mock'

export type {
  CreateCustomerParams,
  CreateSubscriptionParams,
  CreatePaymentIntentParams,
  StripePlan,
  WebhookEvent,
} from './stripe.integration'

export type {
  SendMessageParams,
  SendTemplateParams,
  IncomingMessage,
  MediaUploadResponse,
  WebhookPayload,
} from './whatsapp.integration'

export type {
  SendEmailParams,
  EmailAttachment,
  SendTemplateParams as EmailSendTemplateParams,
  BatchRecipient,
  SendBatchParams,
  EmailResponse,
} from './email.integration'
