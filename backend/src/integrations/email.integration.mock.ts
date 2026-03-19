// @ts-nocheck
/**
 * EMAIL INTEGRATION - MOCK VERSION
 *
 * Versão mockada da integração de Email para desenvolvimento/testes
 * sem necessidade de servidor SMTP real.
 */

import { logger } from '../utils/logger'

export interface MockEmailMessage {
  id: string
  from: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  timestamp: string
  status: 'sent' | 'delivered' | 'failed'
}

class EmailIntegrationMock {
  private sentEmails: Map<string, MockEmailMessage> = new Map()

  constructor() {
    logger.info('[Email Mock] Usando versão MOCKADA do Email SMTP')
  }

  /**
   * Mock: Enviar email
   */
  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string
  ): Promise<MockEmailMessage> {
    const mockEmail: MockEmailMessage = {
      id: `email_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      from: process.env.EMAIL_FROM || 'noreply@crmtubominas.com.br',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      timestamp: new Date().toISOString(),
      status: 'sent',
    }

    this.sentEmails.set(mockEmail.id, mockEmail)

    const recipients = Array.isArray(to) ? to.join(', ') : to
    logger.info(`[Email Mock] Email enviado para ${recipients}: "${subject}"`)

    // Simular entrega após 500ms
    setTimeout(() => {
      mockEmail.status = 'delivered'
      logger.info(`[Email Mock] Email ${mockEmail.id} entregue`)
    }, 500)

    return mockEmail
  }

  /**
   * Mock: Enviar email com template
   */
  async sendTemplate(
    to: string | string[],
    templateName: string,
    data: Record<string, any>
  ): Promise<MockEmailMessage> {
    logger.info(`[Email Mock] Enviando template "${templateName}" para ${to}`)

    // Gerar HTML mock baseado no template
    const html = this.generateMockHtml(templateName, data)
    const subject = this.getTemplateSubject(templateName, data)

    return this.sendEmail(to, subject, html)
  }

  /**
   * Mock: Enviar em lote
   */
  async sendBatch(recipients: Array<{
    to: string
    subject: string
    html: string
    text?: string
  }>): Promise<MockEmailMessage[]> {
    logger.info(`[Email Mock] Enviando ${recipients.length} emails em lote`)

    const results: MockEmailMessage[] = []

    for (const recipient of recipients) {
      const email = await this.sendEmail(
        recipient.to,
        recipient.subject,
        recipient.html,
        recipient.text
      )
      results.push(email)

      // Pequeno delay para simular processamento
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    logger.info(`[Email Mock] Lote de ${results.length} emails processado`)
    return results
  }

  /**
   * Mock: Verificar conexão
   */
  async verifyConnection(): Promise<boolean> {
    logger.info('[Email Mock] Conexão verificada (mock sempre retorna true)')
    return true
  }

  /**
   * Mock: Email de boas-vindas
   */
  async sendWelcomeEmail(to: string, name: string): Promise<MockEmailMessage> {
    logger.info(`[Email Mock] Email de boas-vindas enviado para ${name} (${to})`)

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Bem-vindo ao CRM Tubominas, ${name}!</h1>
        <p>Estamos muito felizes em ter você conosco.</p>
        <p>Sua conta foi criada com sucesso e você já pode começar a usar todas as funcionalidades.</p>
        <a href="http://localhost:5173/dashboard" style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          Acessar Dashboard
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte.
        </p>
      </div>
    `

    return this.sendEmail(to, 'Bem-vindo ao CRM Tubominas!', html)
  }

  /**
   * Mock: Email de reset de senha
   */
  async sendPasswordResetEmail(to: string, name: string, resetToken: string): Promise<MockEmailMessage> {
    logger.info(`[Email Mock] Email de reset de senha enviado para ${name} (${to})`)

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Redefinir Senha</h1>
        <p>Olá ${name},</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          Redefinir Senha
        </a>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Este link expira em 1 hora. Se você não solicitou a redefinição de senha, ignore este email.
        </p>
      </div>
    `

    return this.sendEmail(to, 'Redefinir sua senha - CRM Tubominas', html)
  }

  /**
   * Mock: Email de fatura
   */
  async sendInvoiceEmail(to: string, name: string, invoiceData: any): Promise<MockEmailMessage> {
    logger.info(`[Email Mock] Email de fatura enviado para ${name} (${to})`)

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Nova Fatura Disponível</h1>
        <p>Olá ${name},</p>
        <p>Sua fatura do mês está disponível.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Valor:</strong> R$ ${(invoiceData.amount / 100).toFixed(2)}</p>
          <p><strong>Vencimento:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString('pt-BR')}</p>
          <p><strong>Status:</strong> ${invoiceData.status === 'paid' ? 'Pago' : 'Pendente'}</p>
        </div>
        <a href="${invoiceData.url || '#'}" style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px;">
          Ver Fatura
        </a>
      </div>
    `

    return this.sendEmail(to, `Fatura #${invoiceData.id} - CRM Tubominas`, html)
  }

  /**
   * Gerar HTML mock baseado no template
   */
  private generateMockHtml(templateName: string, data: Record<string, any>): string {
    let html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">`
    html += `<h1>Template: ${templateName}</h1>`
    html += `<div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">`

    for (const [key, value] of Object.entries(data)) {
      html += `<p><strong>${key}:</strong> ${value}</p>`
    }

    html += `</div></div>`
    return html
  }

  /**
   * Obter assunto baseado no template
   */
  private getTemplateSubject(templateName: string, data: Record<string, any>): string {
    const subjects: Record<string, string> = {
      welcome: `Bem-vindo ${data.name}!`,
      reset_password: 'Redefinir sua senha',
      invoice: `Fatura #${data.invoiceId}`,
      appointment_reminder: `Lembrete: Consulta ${data.date}`,
      nps_survey: 'Avalie sua experiência',
    }

    return subjects[templateName] || `Email: ${templateName}`
  }

  /**
   * Obter emails enviados (para testes)
   */
  getSentEmails(): MockEmailMessage[] {
    return Array.from(this.sentEmails.values())
  }

  /**
   * Limpar histórico (para testes)
   */
  clearHistory(): void {
    this.sentEmails.clear()
    logger.info('[Email Mock] Histórico de emails limpo')
  }
}

// Export singleton
export const emailServiceMock = new EmailIntegrationMock()
