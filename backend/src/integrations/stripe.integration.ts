import Stripe from 'stripe'
import { env } from '../config/env'
import { logger } from '../utils/logger'
import { AppError } from '../utils/app-error'

// Types
export interface CreateCustomerParams {
  email: string
  name: string
  metadata?: Record<string, string>
}

export interface CreateSubscriptionParams {
  customerId: string
  priceId: string
  metadata?: Record<string, string>
  trialPeriodDays?: number
}

export interface CreatePaymentIntentParams {
  amount: number
  currency: string
  customerId: string
  metadata?: Record<string, string>
  description?: string
}

export interface StripePlan {
  id: string
  name: string
  amount: number
  currency: string
  interval: string
  productId: string
}

export interface WebhookEvent {
  type: string
  data: {
    object: any
  }
}

class StripeIntegration {
  private stripe: Stripe
  private webhookSecret: string

  constructor() {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })

    this.webhookSecret = env.STRIPE_WEBHOOK_SECRET

    logger.info('Stripe integration initialized')
  }

  /**
   * Create a new Stripe customer
   */
  async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      const { email, name, metadata } = params

      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
        },
      })

      logger.info(`Stripe customer created: ${customer.id}`)
      return customer
    } catch (error) {
      logger.error('Error creating Stripe customer')
      throw new AppError('Failed to create customer in payment system', 500, 'STRIPE_CUSTOMER_ERROR')
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(
    params: CreateSubscriptionParams
  ): Promise<Stripe.Subscription> {
    try {
      const { customerId, priceId, metadata, trialPeriodDays } = params

      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
        },
        trial_period_days: trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })

      logger.info(`Stripe subscription created: ${subscription.id}`)
      return subscription
    } catch (error) {
      logger.error('Error creating Stripe subscription')
      throw new AppError('Failed to create subscription', 500, 'STRIPE_SUBSCRIPTION_ERROR')
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId)

      logger.info(`Stripe subscription cancelled: ${subscriptionId}`)
      return subscription
    } catch (error) {
      logger.error('Error cancelling Stripe subscription')
      throw new AppError('Failed to cancel subscription', 500, 'STRIPE_SUBSCRIPTION_ERROR')
    }
  }

  /**
   * Update a subscription (e.g., change plan)
   */
  async updateSubscription(
    subscriptionId: string,
    priceId: string
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)

      const updated = await this.stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
        proration_behavior: 'create_prorations',
      })

      logger.info(`Stripe subscription updated: ${subscriptionId}`)
      return updated
    } catch (error) {
      logger.error('Error updating Stripe subscription')
      throw new AppError('Failed to update subscription', 500, 'STRIPE_SUBSCRIPTION_ERROR')
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<Stripe.PaymentIntent> {
    try {
      const { amount, currency, customerId, metadata, description } = params

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata,
        description,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      logger.info(`Stripe payment intent created: ${paymentIntent.id}`)
      return paymentIntent
    } catch (error) {
      logger.error('Error creating Stripe payment intent')
      throw new AppError('Failed to create payment intent', 500, 'STRIPE_PAYMENT_ERROR')
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleWebhook(body: string | Buffer, signature: string): Promise<WebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.webhookSecret
      )

      logger.info(`Stripe webhook received: ${event.type}`)

      return {
        type: event.type,
        data: event.data,
      }
    } catch (error) {
      logger.error('Error handling Stripe webhook')
      throw new AppError('Invalid webhook signature', 400, 'STRIPE_WEBHOOK_ERROR')
    }
  }

  /**
   * List all available plans (prices)
   */
  async listPlans(): Promise<StripePlan[]> {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
      })

      const plans: StripePlan[] = prices.data.map((price) => {
        const product = price.product as Stripe.Product

        return {
          id: price.id,
          name: product.name,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          interval: price.recurring?.interval || 'one_time',
          productId: product.id,
        }
      })

      logger.info(`Retrieved ${plans.length} Stripe plans`)
      return plans
    } catch (error) {
      logger.error('Error listing Stripe plans')
      throw new AppError('Failed to list plans', 500, 'STRIPE_PLAN_ERROR')
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId)

      if (customer.deleted) {
        throw new AppError('Customer not found', 404, 'STRIPE_CUSTOMER_NOT_FOUND')
      }

      return customer as Stripe.Customer
    } catch (error) {
      logger.error('Error retrieving Stripe customer')
      throw new AppError('Failed to retrieve customer', 500, 'STRIPE_CUSTOMER_ERROR')
    }
  }

  /**
   * Get a subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      return subscription
    } catch (error) {
      logger.error('Error retrieving Stripe subscription')
      throw new AppError('Failed to retrieve subscription', 500, 'STRIPE_SUBSCRIPTION_ERROR')
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(params: {
    customerId?: string
    customerEmail?: string
    priceId: string
    successUrl: string
    cancelUrl: string
    trialPeriodDays?: number
    metadata?: Record<string, string>
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.customerId,
        customer_email: params.customerEmail,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        subscription_data: {
          trial_period_days: params.trialPeriodDays,
          metadata: params.metadata,
        },
      })

      logger.info(`Stripe checkout session created: ${session.id}`)
      return session
    } catch (error) {
      logger.error('Error creating Stripe checkout session')
      throw new AppError('Failed to create checkout session', 500, 'STRIPE_CHECKOUT_ERROR')
    }
  }

  /**
   * Create a billing portal session
   */
  async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      logger.info(`Stripe billing portal session created for customer: ${customerId}`)
      return session
    } catch (error) {
      logger.error('Error creating Stripe billing portal session')
      throw new AppError('Failed to create billing portal session', 500, 'STRIPE_BILLING_PORTAL_ERROR')
    }
  }

  /**
   * Get raw Stripe instance for advanced usage
   */
  getStripeInstance(): Stripe {
    return this.stripe
  }
}

// Export singleton instance
export const stripeIntegration = new StripeIntegration()
