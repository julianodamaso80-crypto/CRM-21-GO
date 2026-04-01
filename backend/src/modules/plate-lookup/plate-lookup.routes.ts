import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { lookupPlate } from './plate-lookup.service'
import { createPublicLead } from './lead-capture.service'

export async function plateLookupRoutes(fastify: FastifyInstance) {
  // Public endpoints — NO auth required (called from static site)

  // GET /plate/:placa — Consulta veículo
  fastify.get<{ Params: { placa: string } }>(
    '/plate/:placa',
    {
      schema: {
        description: 'Consulta veículo por placa via API Brasil + calcula planos',
        tags: ['Vehicle Lookup'],
        params: {
          type: 'object',
          properties: {
            placa: { type: 'string', minLength: 7, maxLength: 7 },
          },
          required: ['placa'],
        },
      },
    },
    async (request: FastifyRequest<{ Params: { placa: string } }>, reply: FastifyReply) => {
      const { placa } = request.params
      const result = await lookupPlate(placa)
      return reply.send(result)
    },
  )

  // POST /lead — Salva lead do formulário do site
  fastify.post(
    '/lead',
    {
      schema: {
        description: 'Salva lead do formulário de cotação do site no banco',
        tags: ['Lead Capture'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as any
      const result = await createPublicLead(body)
      return reply.status(201).send(result)
    },
  )
}
