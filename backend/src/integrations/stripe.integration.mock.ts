// @ts-nocheck
/**
 * STRIPE INTEGRATION - MOCK VERSION
 *
 * Versão mockada da integração Stripe para desenvolvimento/testes
 * sem necessidade de API key real.
 */

import { logger } from '../utils/logger'

export interface MockStripeCustomer {
  id: string
  email: string
  name: string
  created: number
}

export interface MockStripeSubscription {
  id: string
  customer: string
  status: string
  current_period_start: number
  current_period_end: number
  items: {
    data: Array<{
      price: {
        id: string
        product: string
        unit_amount: number
      }
    }>
  }
}

export interface MockStripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  customer: string
}

class StripeIntegrationMock {
  private mockCustomers: Map<string, MockStripeCustomer> = new Map()
  private mockSubscriptions: Map<string, MockStripeSubscription> = new Map()
  private mockPaymentIntents: Map<string, MockStripePaymentIntent> = new Map()

  constructor() {
    logger.info('[Stripe Mock] Usando versão MOCKADA do Stripe')
  }

  /**
   * Mock: Criar cliente Stripe
   */
  async createCustomer(email: string, name: string): Promise<MockStripeCustomer> {
    const customer: MockStripeCustomer = {
      id: `cus_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      email,
      name,
      created: Math.floor(Date.now() / 1000),
    }

    this.mockCustomers.set(customer.id, customer)
    logger.info(`[Stripe Mock] Cliente criado: ${customer.id}`)

    return customer
  }

  /**
   * Mock: Criar assinatura
   */
  async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<MockStripeSubscription> {
    const now = Math.floor(Date.now() / 1000)
    const subscription: MockStripeSubscription = {
      id: `sub_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      customer: customerId,
      status: 'active',
      current_period_start: now,
      current_period_end: now + 30 * 24 * 60 * 60, // +30 days
      items: {
        data: [
          {
            price: {
              id: priceId,
              product: 'prod_mock_123',
              unit_amount: 9900, // R$ 99.00
            },
          },
        ],
      },
    }

    this.mockSubscriptions.set(subscription.id, subscription)
    logger.info(`[Stripe Mock] Assinatura criada: ${subscription.id}`)

    return subscription
  }

  /**
   * Mock: Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<MockStripeSubscription> {
    const subscription = this.mockSubscriptions.get(subscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`)
    }

    subscription.status = 'canceled'
    logger.info(`[Stripe Mock] Assinatura cancelada: ${subscriptionId}`)

    return subscription
  }

  /**
   * Mock: Atualizar assinatura
   */
  async updateSubscription(
    subscriptionId: string,
    priceId: string
  ): Promise<MockStripeSubscription> {
    const subscription = this.mockSubscriptions.get(subscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`)
    }

    subscription.items.data[0].price.id = priceId
    logger.info(`[Stripe Mock] Assinatura atualizada: ${subscriptionId}`)

    return subscription
  }

  /**
   * Mock: Criar PaymentIntent
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string
  ): Promise<MockStripePaymentIntent> {
    const paymentIntent: MockStripePaymentIntent = {
      id: `pi_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount,
      currency,
      status: 'succeeded',
      customer: customerId,
    }

    this.mockPaymentIntents.set(paymentIntent.id, paymentIntent)
    logger.info(`[Stripe Mock] PaymentIntent criado: ${paymentIntent.id}`)

    return paymentIntent
  }

  /**
   * Mock: Processar webhook
   */
  async handleWebhook(body: any, signature: string): Promise<any> {
    logger.info(`[Stripe Mock] Webhook recebido (signature: ${signature?.substring(0, 20)}...)`)

    // Simular evento de webhook
    return {
      type: body.type || 'payment_intent.succeeded',
      data: {
        object: body.data?.object || { id: 'mock_event' },
      },
    }
  }

  /**
   * Mock: Listar planos
   */
  async listPlans(): Promise<any[]> {
    logger.info('[Stripe Mock] Listando planos')

    return [
      {
        id: 'price_free',
        product: 'prod_free',
        nickname: 'Plano Gratuito',
        unit_amount: 0,
        currency: 'brl',
        recurring: { interval: 'month' },
      },
      {
        id: 'price_pro',
        product: 'prod_pro',
        nickname: 'Plano Pro',
        unit_amount: 9900,
        currency: 'brl',
        recurring: { interval: 'month' },
      },
      {
        id: 'price_enterprise',
        product: 'prod_enterprise',
        nickname: 'Plano Enterprise',
        unit_amount: 29900,
        currency: 'brl',
        recurring: { interval: 'month' },
      },
    ]
  }

  /**
   * Mock: Buscar cliente
   */
  async getCustomer(customerId: string): Promise<MockStripeCustomer> {
    const customer = this.mockCustomers.get(customerId)
    if (!customer) {
      throw new Error(`Customer not found: ${customerId}`)
    }
    return customer
  }

  /**
   * Mock: Buscar assinatura
   */
  async getSubscription(subscriptionId: string): Promise<MockStripeSubscription> {
    const subscription = this.mockSubscriptions.get(subscriptionId)
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`)
    }
    return subscription
  }

  /**
   * Mock: Criar sessão de checkout
   */
  async createCheckoutSession(priceId: string, customerId: string): Promise<any> {
    logger.info(`[Stripe Mock] Checkout session criado para ${customerId}`)

    return {
      id: `cs_mock_${Date.now()}`,
      url: `https://checkout.stripe.com/mock/${customerId}`,
      customer: customerId,
      mode: 'subscription',
      success_url: 'http://localhost:5173/billing/success',
      cancel_url: 'http://localhost:5173/billing',
    }
  }

  /**
   * Mock: Criar sessão do portal de cobrança
   */
  async createBillingPortalSession(customerId: string): Promise<any> {
    logger.info(`[Stripe Mock] Portal session criado para ${customerId}`)

    return {
      id: `bps_mock_${Date.now()}`,
      url: `https://billing.stripe.com/mock/${customerId}`,
      customer: customerId,
      return_url: 'http://localhost:5173/billing',
    }
  }
}

// Export singleton
export const stripeServiceMock = new StripeIntegrationMock()
