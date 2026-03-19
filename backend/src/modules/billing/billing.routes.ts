import { FastifyInstance } from 'fastify'
import { BillingController } from './billing.controller'
import { authenticate } from '../../middlewares/authenticate'

const billingController = new BillingController()

export async function billingRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticacao
  fastify.addHook('onRequest', authenticate)

  // GET /billing/plans
  fastify.get('/plans', {
    schema: {
      description: 'List all available plans',
      tags: ['billing'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              displayName: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              currency: { type: 'string' },
              billingInterval: { type: 'string' },
              maxUsers: { type: 'number' },
              maxLeadsPerMonth: { type: 'number' },
              maxDealsPerMonth: { type: 'number' },
              maxAIMessages: { type: 'number' },
              maxWebhooks: { type: 'number' },
              maxAPICallsPerDay: { type: 'number' },
              maxStorageGB: { type: 'number' },
              features: { type: 'object' },
              isPopular: { type: 'boolean' },
            },
          },
        },
      },
    },
    handler: billingController.getPlans.bind(billingController),
  })

  // GET /billing/subscription
  fastify.get('/subscription', {
    schema: {
      description: 'Get active subscription for the company',
      tags: ['billing'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            companyId: { type: 'string' },
            planId: { type: 'string' },
            plan: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                displayName: { type: 'string' },
                price: { type: 'number' },
              },
            },
            status: { type: 'string' },
            currentPeriodStart: { type: 'string', format: 'date-time' },
            currentPeriodEnd: { type: 'string', format: 'date-time' },
            cancelAt: { type: 'string', format: 'date-time' },
            canceledAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    handler: billingController.getSubscription.bind(billingController),
  })

  // GET /billing/invoices
  fastify.get('/invoices', {
    schema: {
      description: 'List invoices for the company',
      tags: ['billing'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              amount: { type: 'number' },
              currency: { type: 'string' },
              status: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              paidAt: { type: 'string', format: 'date-time' },
              invoiceUrl: { type: 'string' },
              invoicePdf: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    handler: billingController.getInvoices.bind(billingController),
  })

  // GET /billing/usage
  fastify.get('/usage', {
    schema: {
      description: 'Get current usage vs plan limits',
      tags: ['billing'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                limit: { type: 'number' },
              },
            },
            leads: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                limit: { type: 'number' },
              },
            },
            deals: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                limit: { type: 'number' },
              },
            },
            aiMessages: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                limit: { type: 'number' },
              },
            },
            webhooks: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                limit: { type: 'number' },
              },
            },
            apiCalls: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                limit: { type: 'number' },
              },
            },
            storage: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                limit: { type: 'number' },
              },
            },
          },
        },
      },
    },
    handler: billingController.getUsage.bind(billingController),
  })

  // POST /billing/change-plan
  fastify.post('/change-plan', {
    schema: {
      description: 'Change the company subscription plan',
      tags: ['billing'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['planId'],
        properties: {
          planId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: billingController.changePlan.bind(billingController),
  })

  // POST /billing/cancel
  fastify.post('/cancel', {
    schema: {
      description: 'Cancel the company subscription',
      tags: ['billing'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            cancelAt: { type: 'string', format: 'date-time' },
            canceledAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    handler: billingController.cancelSubscription.bind(billingController),
  })
}
