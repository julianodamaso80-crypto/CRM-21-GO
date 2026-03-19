// @ts-nocheck
/**
 * WHATSAPP INTEGRATION - MOCK VERSION
 *
 * Versão mockada da integração WhatsApp para desenvolvimento/testes
 * sem necessidade de API token real.
 */

import { logger } from '../utils/logger'

export interface MockWhatsAppMessage {
  id: string
  to: string
  type: 'text' | 'template'
  text?: { body: string }
  template?: { name: string; language: { code: string }; components: any[] }
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
}

class WhatsAppIntegrationMock {
  private sentMessages: Map<string, MockWhatsAppMessage> = new Map()

  constructor() {
    logger.info('[WhatsApp Mock] Usando versão MOCKADA do WhatsApp Business API')
  }

  /**
   * Mock: Enviar mensagem de texto
   */
  async sendMessage(to: string, message: string, previewUrl = false): Promise<MockWhatsAppMessage> {
    const mockMessage: MockWhatsAppMessage = {
      id: `wamid_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      to,
      type: 'text',
      text: { body: message },
      timestamp: new Date().toISOString(),
      status: 'sent',
    }

    this.sentMessages.set(mockMessage.id, mockMessage)

    logger.info(`[WhatsApp Mock] Mensagem enviada para ${to}: "${message.substring(0, 50)}..."`)

    // Simular entrega após 1 segundo
    setTimeout(() => {
      mockMessage.status = 'delivered'
      logger.info(`[WhatsApp Mock] Mensagem ${mockMessage.id} entregue`)
    }, 1000)

    return mockMessage
  }

  /**
   * Mock: Enviar template
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    components: any[]
  ): Promise<MockWhatsAppMessage> {
    const mockMessage: MockWhatsAppMessage = {
      id: `wamid_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
      timestamp: new Date().toISOString(),
      status: 'sent',
    }

    this.sentMessages.set(mockMessage.id, mockMessage)

    logger.info(`[WhatsApp Mock] Template "${templateName}" enviado para ${to}`)

    return mockMessage
  }

  /**
   * Mock: Processar mensagem recebida
   */
  async handleIncomingMessage(payload: any): Promise<any> {
    logger.info('[WhatsApp Mock] Mensagem recebida processada')

    const mockIncoming = {
      id: `wamid_incoming_${Date.now()}`,
      from: payload.from || '5511999998888',
      type: 'text',
      text: { body: payload.text?.body || 'Mensagem mock' },
      timestamp: new Date().toISOString(),
    }

    return mockIncoming
  }

  /**
   * Mock: Verificar webhook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    logger.info(`[WhatsApp Mock] Webhook verificado: mode=${mode}, token=${token}`)

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge
    }
    return null
  }

  /**
   * Mock: Buscar URL de mídia
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    logger.info(`[WhatsApp Mock] URL de mídia recuperada: ${mediaId}`)
    return `https://mock-whatsapp-media.com/${mediaId}.jpg`
  }

  /**
   * Mock: Download de mídia
   */
  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    logger.info(`[WhatsApp Mock] Mídia baixada: ${mediaUrl}`)
    return Buffer.from('fake-image-data')
  }

  /**
   * Mock: Marcar como lido
   */
  async markAsRead(messageId: string): Promise<{ success: boolean }> {
    const message = this.sentMessages.get(messageId)
    if (message) {
      message.status = 'read'
    }

    logger.info(`[WhatsApp Mock] Mensagem marcada como lida: ${messageId}`)
    return { success: true }
  }

  /**
   * Obter mensagens enviadas (para testes)
   */
  getSentMessages(): MockWhatsAppMessage[] {
    return Array.from(this.sentMessages.values())
  }

  /**
   * Limpar histórico (para testes)
   */
  clearHistory(): void {
    this.sentMessages.clear()
    logger.info('[WhatsApp Mock] Histórico de mensagens limpo')
  }
}

// Export singleton
export const whatsappServiceMock = new WhatsAppIntegrationMock()
