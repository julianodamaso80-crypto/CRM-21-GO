import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { processEvolutionWebhook } from './webhook-evolution.service'

/**
 * Rotas públicas (sem auth) que recebem webhooks da Evolution API.
 * Proteção: header `x-evolution-secret` deve bater com EVOLUTION_WEBHOOK_SECRET (se definido).
 */
export async function webhookEvolutionRoutes(fastify: FastifyInstance) {
  const hook = async (request: FastifyRequest, reply: FastifyReply) => {
    const expected = process.env.EVOLUTION_WEBHOOK_SECRET
    if (expected) {
      const provided =
        (request.headers['x-evolution-secret'] as string | undefined) ||
        (request.headers['x-webhook-secret'] as string | undefined) ||
        (request.query as any)?.secret
      if (provided !== expected) {
        return reply.status(401).send({ error: 'invalid secret' })
      }
    }

    try {
      const result = await processEvolutionWebhook(request.body as any)
      return reply.status(200).send({ ok: true, ...result })
    } catch (err: any) {
      request.log.error({ err }, '[EvolutionWebhook] processing failed')
      // IMPORTANTE: sempre 200 pra Evolution não desligar o webhook por falhas.
      return reply.status(200).send({ ok: false, error: err.message })
    }
  }

  // Endpoint principal (uma URL recebe todos os eventos — Webhook by Events = OFF)
  fastify.post('/', {
    schema: {
      description: 'Webhook receiver da Evolution API (WhatsApp)',
      tags: ['Webhook Evolution'],
    },
    handler: hook,
  })

  // Health check específico — útil pra teste manual
  fastify.get('/', async (_req, reply) => {
    return reply.send({
      status: 'ok',
      service: 'webhook-evolution',
      timestamp: new Date().toISOString(),
    })
  })
}
