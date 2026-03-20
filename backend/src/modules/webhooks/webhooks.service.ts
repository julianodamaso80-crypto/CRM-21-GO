// Webhook model not in 21Go schema — fallback service

export interface CreateWebhookDTO {
  url?: string
  events?: string[]
  secret?: string
}

export interface UpdateWebhookDTO extends Partial<CreateWebhookDTO> {
  isActive?: boolean
}

export class WebhooksService {
  async listWebhooks(_companyId: string) {
    return []
  }

  async getWebhookById(_id: string, _companyId: string) {
    return null
  }

  async createWebhook(_companyId: string, _data: any) {
    return { id: 'stub', message: 'Webhooks nao disponiveis ainda' }
  }

  async updateWebhook(_id: string, _companyId: string, _data: any) {
    return { id: 'stub', message: 'Webhooks nao disponiveis ainda' }
  }

  async deleteWebhook(_id: string, _companyId: string) {
    return { success: true }
  }
}
