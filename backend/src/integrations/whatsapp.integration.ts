import axios, { AxiosInstance } from 'axios'
import { env } from '../config/env'
import { logger } from '../utils/logger'
import { AppError } from '../utils/app-error'

// Types
export interface SendMessageParams {
  to: string
  message: string
  previewUrl?: boolean
}

export interface SendTemplateParams {
  to: string
  templateName: string
  languageCode?: string
  params?: string[]
  headerParams?: string[]
}

export interface IncomingMessage {
  from: string
  messageId: string
  timestamp: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location'
  text?: string
  mediaUrl?: string
  mediaId?: string
  mimeType?: string
  caption?: string
  latitude?: number
  longitude?: number
}

export interface MediaUploadResponse {
  id: string
  url?: string
}

export interface WebhookPayload {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        messaging_product: string
        metadata: {
          display_phone_number: string
          phone_number_id: string
        }
        contacts?: Array<{
          profile: {
            name: string
          }
          wa_id: string
        }>
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: {
            body: string
          }
          image?: {
            id: string
            mime_type: string
            sha256: string
            caption?: string
          }
          video?: {
            id: string
            mime_type: string
            sha256: string
            caption?: string
          }
          audio?: {
            id: string
            mime_type: string
            sha256: string
          }
          document?: {
            id: string
            mime_type: string
            sha256: string
            filename: string
            caption?: string
          }
          location?: {
            latitude: number
            longitude: number
            name?: string
            address?: string
          }
        }>
        statuses?: Array<{
          id: string
          status: 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: string
          recipient_id: string
        }>
      }
      field: string
    }>
  }>
}

class WhatsAppIntegration {
  private client: AxiosInstance
  private phoneNumberId: string
  private verifyToken: string
  private baseUrl = 'https://graph.facebook.com/v18.0'

  constructor() {
    const apiToken = env.WHATSAPP_API_TOKEN
    const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID
    const verifyToken = env.WHATSAPP_VERIFY_TOKEN

    if (!apiToken || !phoneNumberId) {
      logger.warn('WhatsApp integration not configured - missing credentials')
      // Don't throw error to allow app to run without WhatsApp
    }

    this.phoneNumberId = phoneNumberId || ''
    this.verifyToken = verifyToken || ''

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    })

    logger.info('WhatsApp integration initialized')
  }

  /**
   * Check if WhatsApp is configured
   */
  private checkConfiguration(): void {
    if (!this.phoneNumberId || !env.WHATSAPP_API_TOKEN) {
      throw new AppError('WhatsApp integration is not configured', 503, 'WHATSAPP_NOT_CONFIGURED')
    }
  }

  /**
   * Send a text message
   */
  async sendMessage(params: SendMessageParams): Promise<{ messageId: string }> {
    this.checkConfiguration()

    try {
      const { to, message, previewUrl = false } = params

      // Clean phone number (remove non-digits)
      const cleanPhone = to.replace(/\D/g, '')

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: previewUrl,
          body: message,
        },
      })

      const messageId = response.data.messages[0].id

      logger.info(`WhatsApp message sent to ${cleanPhone}: ${messageId}`)

      return { messageId }
    } catch (error: any) {
      logger.error('Error sending WhatsApp message')
      throw new AppError(
        error.response?.data?.error?.message || 'Failed to send WhatsApp message',
        500,
        'WHATSAPP_SEND_ERROR'
      )
    }
  }

  /**
   * Send a template message
   */
  async sendTemplate(params: SendTemplateParams): Promise<{ messageId: string }> {
    this.checkConfiguration()

    try {
      const { to, templateName, languageCode = 'pt_BR', params: templateParams = [], headerParams = [] } = params

      const cleanPhone = to.replace(/\D/g, '')

      const components = []

      // Add header parameters if provided
      if (headerParams.length > 0) {
        components.push({
          type: 'header',
          parameters: headerParams.map((value) => ({
            type: 'text',
            text: value,
          })),
        })
      }

      // Add body parameters if provided
      if (templateParams.length > 0) {
        components.push({
          type: 'body',
          parameters: templateParams.map((value) => ({
            type: 'text',
            text: value,
          })),
        })
      }

      const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components.length > 0 ? components : undefined,
        },
      })

      const messageId = response.data.messages[0].id

      logger.info(`WhatsApp template sent to ${cleanPhone}: ${templateName}`)

      return { messageId }
    } catch (error: any) {
      logger.error('Error sending WhatsApp template')
      throw new AppError(
        error.response?.data?.error?.message || 'Failed to send WhatsApp template',
        500,
        'WHATSAPP_TEMPLATE_ERROR'
      )
    }
  }

  /**
   * Handle incoming message webhook
   */
  handleIncomingMessage(payload: WebhookPayload): IncomingMessage[] {
    try {
      const messages: IncomingMessage[] = []

      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field !== 'messages') continue

          const value = change.value
          if (!value.messages) continue

          for (const message of value.messages) {
            const incomingMessage: IncomingMessage = {
              from: message.from,
              messageId: message.id,
              timestamp: message.timestamp,
              type: message.type as any,
            }

            // Extract message content based on type
            switch (message.type) {
              case 'text':
                incomingMessage.text = message.text?.body
                break

              case 'image':
                incomingMessage.mediaId = message.image?.id
                incomingMessage.mimeType = message.image?.mime_type
                incomingMessage.caption = message.image?.caption
                break

              case 'video':
                incomingMessage.mediaId = message.video?.id
                incomingMessage.mimeType = message.video?.mime_type
                incomingMessage.caption = message.video?.caption
                break

              case 'audio':
                incomingMessage.mediaId = message.audio?.id
                incomingMessage.mimeType = message.audio?.mime_type
                break

              case 'document':
                incomingMessage.mediaId = message.document?.id
                incomingMessage.mimeType = message.document?.mime_type
                incomingMessage.caption = message.document?.caption
                break

              case 'location':
                incomingMessage.latitude = message.location?.latitude
                incomingMessage.longitude = message.location?.longitude
                break
            }

            messages.push(incomingMessage)
          }
        }
      }

      logger.info(`Processed ${messages.length} incoming WhatsApp messages`)

      return messages
    } catch (error) {
      logger.error('Error handling incoming WhatsApp message')
      throw new AppError('Failed to process incoming message', 500, 'WHATSAPP_WEBHOOK_ERROR')
    }
  }

  /**
   * Verify webhook request (for initial setup)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      logger.info('WhatsApp webhook verified')
      return challenge
    }

    logger.warn('WhatsApp webhook verification failed')
    return null
  }

  /**
   * Upload media file
   */
  async uploadMedia(_file: Buffer, _mimeType: string): Promise<MediaUploadResponse> {
    this.checkConfiguration()

    try {
      // Note: For actual upload, you need to use FormData from 'form-data' package
      // This is a placeholder - implement based on your needs
      logger.warn('uploadMedia not fully implemented - needs form-data package')

      throw new AppError('Media upload not implemented yet', 501, 'WHATSAPP_NOT_IMPLEMENTED')
    } catch (error: any) {
      logger.error('Error uploading WhatsApp media')
      throw new AppError(
        error.response?.data?.error?.message || 'Failed to upload media',
        500,
        'WHATSAPP_UPLOAD_ERROR'
      )
    }
  }

  /**
   * Get media URL by ID
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    this.checkConfiguration()

    try {
      const response = await this.client.get(`/${mediaId}`)
      const mediaUrl = response.data.url

      logger.info(`Retrieved WhatsApp media URL for: ${mediaId}`)

      return mediaUrl
    } catch (error: any) {
      logger.error('Error getting WhatsApp media URL')
      throw new AppError(
        error.response?.data?.error?.message || 'Failed to get media URL',
        500,
        'WHATSAPP_MEDIA_ERROR'
      )
    }
  }

  /**
   * Download media file
   */
  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    this.checkConfiguration()

    try {
      const response = await this.client.get(mediaUrl, {
        responseType: 'arraybuffer',
      })

      logger.info(`Downloaded WhatsApp media from: ${mediaUrl}`)

      return Buffer.from(response.data)
    } catch (error: any) {
      logger.error('Error downloading WhatsApp media')
      throw new AppError('Failed to download media', 500, 'WHATSAPP_DOWNLOAD_ERROR')
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    this.checkConfiguration()

    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      })

      logger.info(`WhatsApp message marked as read: ${messageId}`)
    } catch (error: any) {
      logger.error('Error marking WhatsApp message as read')
      // Don't throw error - this is not critical
    }
  }
}

// Export singleton instance
export const whatsappIntegration = new WhatsAppIntegration()
