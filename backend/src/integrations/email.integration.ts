import nodemailer, { Transporter } from 'nodemailer'
import { env } from '../config/env'
import { logger } from '../utils/logger'
import { AppError } from '../utils/app-error'

// Types
export interface SendEmailParams {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content?: string | Buffer
  path?: string
  contentType?: string
}

export interface SendTemplateParams {
  to: string | string[]
  templateId: string
  data: Record<string, any>
  subject?: string
}

export interface BatchRecipient {
  to: string
  subject: string
  html?: string
  text?: string
  data?: Record<string, any>
}

export interface SendBatchParams {
  recipients: BatchRecipient[]
  from?: string
}

export interface EmailResponse {
  messageId: string
  accepted: string[]
  rejected: string[]
}

class EmailIntegration {
  private transporter: Transporter | null = null
  private isConfigured: boolean = false
  private fromAddress: string

  constructor() {
    const smtpHost = env.SMTP_HOST
    const smtpPort = env.SMTP_PORT
    const smtpUser = env.SMTP_USER
    const smtpPassword = env.SMTP_PASSWORD
    const emailFrom = env.EMAIL_FROM

    this.fromAddress = emailFrom || 'noreply@crm.local'

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      logger.warn('Email integration not configured - missing SMTP credentials')
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        tls: {
          rejectUnauthorized: env.NODE_ENV === 'production',
        },
      })

      this.isConfigured = true
      logger.info('Email integration initialized with SMTP')
    } catch (error) {
      logger.error('Failed to initialize email integration')
      this.isConfigured = false
    }
  }

  /**
   * Check if email is configured
   */
  private checkConfiguration(): void {
    if (!this.isConfigured || !this.transporter) {
      throw new AppError('Email service is not configured', 503, 'EMAIL_NOT_CONFIGURED')
    }
  }

  /**
   * Send a single email
   */
  async sendEmail(params: SendEmailParams): Promise<EmailResponse> {
    this.checkConfiguration()

    try {
      const { to, subject, html, text, cc, bcc, replyTo, attachments } = params

      if (!html && !text) {
        throw new AppError('Either html or text content must be provided', 400, 'EMAIL_INVALID_CONTENT')
      }

      const info = await this.transporter!.sendMail({
        from: this.fromAddress,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
        subject,
        text,
        html,
        replyTo,
        attachments,
      })

      logger.info(`Email sent successfully: ${info.messageId}`)

      return {
        messageId: info.messageId,
        accepted: info.accepted as string[],
        rejected: info.rejected as string[],
      }
    } catch (error: any) {
      logger.error('Error sending email')
      throw new AppError(error.message || 'Failed to send email', 500, 'EMAIL_SEND_ERROR')
    }
  }

  /**
   * Send email using a template
   * Note: This is a simple template implementation using string replacement
   * For production, consider using a template engine like Handlebars or EJS
   */
  async sendTemplate(params: SendTemplateParams): Promise<EmailResponse> {
    this.checkConfiguration()

    try {
      const { to, templateId, data, subject } = params

      // Load template (in production, load from database or file system)
      const template = this.loadTemplate(templateId)

      if (!template) {
        throw new AppError(`Email template not found: ${templateId}`, 404, 'EMAIL_TEMPLATE_NOT_FOUND')
      }

      // Replace template variables
      let html = template.html
      let text = template.text || ''
      const finalSubject = subject || template.subject

      // Simple template variable replacement {{variableName}}
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
        html = html.replace(regex, String(value))
        text = text.replace(regex, String(value))
      }

      return await this.sendEmail({
        to,
        subject: finalSubject,
        html,
        text,
      })
    } catch (error: any) {
      logger.error('Error sending template email')
      throw new AppError(error.message || 'Failed to send template email', 500, 'EMAIL_TEMPLATE_ERROR')
    }
  }

  /**
   * Send batch emails
   */
  async sendBatch(params: SendBatchParams): Promise<EmailResponse[]> {
    this.checkConfiguration()

    try {
      const { recipients } = params

      if (recipients.length === 0) {
        throw new AppError('No recipients provided', 400, 'EMAIL_NO_RECIPIENTS')
      }

      logger.info(`Sending batch email to ${recipients.length} recipients`)

      const results: EmailResponse[] = []

      // Send emails in parallel with a concurrency limit
      const batchSize = 10
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)

        const batchResults = await Promise.allSettled(
          batch.map(async (recipient) => {
            let html = recipient.html
            let text = recipient.text

            // If template data is provided, apply it
            if (recipient.data && html) {
              for (const [key, value] of Object.entries(recipient.data)) {
                const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
                html = html.replace(regex, String(value))
                if (text) {
                  text = text.replace(regex, String(value))
                }
              }
            }

            return await this.sendEmail({
              to: recipient.to,
              subject: recipient.subject,
              html,
              text,
            })
          })
        )

        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            logger.error('Batch email failed')
            results.push({
              messageId: '',
              accepted: [],
              rejected: [result.reason?.message || 'Unknown error'],
            })
          }
        }
      }

      logger.info(`Batch email completed: ${results.length} emails processed`)

      return results
    } catch (error: any) {
      logger.error('Error sending batch email')
      throw new AppError(error.message || 'Failed to send batch email', 500, 'EMAIL_BATCH_ERROR')
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    this.checkConfiguration()

    try {
      await this.transporter!.verify()
      logger.info('Email SMTP connection verified')
      return true
    } catch (error: any) {
      logger.error('Email SMTP connection failed')
      throw new AppError('Failed to verify email connection', 500, 'EMAIL_CONNECTION_ERROR')
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<EmailResponse> {
    return await this.sendEmail({
      to,
      subject: 'Bem-vindo ao CRM!',
      html: this.getWelcomeEmailTemplate(name),
      text: `Olá ${name},\n\nBem-vindo ao CRM! Estamos felizes em tê-lo conosco.`,
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<EmailResponse> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`

    return await this.sendEmail({
      to,
      subject: 'Redefinição de Senha - CRM',
      html: this.getPasswordResetTemplate(resetUrl),
      text: `Clique no link para redefinir sua senha: ${resetUrl}`,
    })
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(
    to: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date
  ): Promise<EmailResponse> {
    return await this.sendEmail({
      to,
      subject: `Fatura ${invoiceNumber} - CRM`,
      html: this.getInvoiceEmailTemplate(invoiceNumber, amount, dueDate),
    })
  }

  /**
   * Load email template by ID
   * In production, this should load from database or file system
   */
  private loadTemplate(templateId: string): {
    subject: string
    html: string
    text?: string
  } | null {
    // Basic template storage (replace with database in production)
    const templates: Record<string, any> = {
      welcome: {
        subject: 'Bem-vindo ao CRM!',
        html: this.getWelcomeEmailTemplate('{{name}}'),
        text: 'Olá {{name}},\n\nBem-vindo ao CRM!',
      },
      'password-reset': {
        subject: 'Redefinição de Senha',
        html: this.getPasswordResetTemplate('{{resetUrl}}'),
      },
    }

    return templates[templateId] || null
  }

  /**
   * Email templates
   */
  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Bem-vindo</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Bem-vindo ao CRM!</h1>
            <p>Olá <strong>${name}</strong>,</p>
            <p>Estamos muito felizes em tê-lo conosco! Você agora tem acesso a todas as funcionalidades da nossa plataforma.</p>
            <p>Comece explorando o dashboard e criando seus primeiros contatos e oportunidades.</p>
            <p style="margin-top: 30px;">
              <a href="${env.FRONTEND_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Acessar Dashboard
              </a>
            </p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Atenciosamente,<br>
              Equipe CRM
            </p>
          </div>
        </body>
      </html>
    `
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Redefinição de Senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Redefinição de Senha</h1>
            <p>Você solicitou a redefinição de senha da sua conta.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="margin-top: 30px;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Redefinir Senha
              </a>
            </p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Se você não solicitou esta redefinição, ignore este email.
            </p>
            <p style="color: #666; font-size: 14px;">
              Este link expira em 1 hora.
            </p>
          </div>
        </body>
      </html>
    `
  }

  private getInvoiceEmailTemplate(
    invoiceNumber: string,
    amount: number,
    dueDate: Date
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Fatura</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Fatura ${invoiceNumber}</h1>
            <p>Sua fatura está disponível.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Número da Fatura:</strong> ${invoiceNumber}</p>
              <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Vencimento:</strong> ${dueDate.toLocaleDateString('pt-BR')}</p>
            </div>
            <p style="margin-top: 30px;">
              <a href="${env.FRONTEND_URL}/billing/invoices/${invoiceNumber}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Ver Fatura
              </a>
            </p>
          </div>
        </body>
      </html>
    `
  }
}

// Export singleton instance
export const emailIntegration = new EmailIntegration()
