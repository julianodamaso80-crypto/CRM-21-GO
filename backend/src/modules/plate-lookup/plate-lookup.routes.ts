import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { lookupPlate } from './plate-lookup.service'

export async function plateLookupRoutes(fastify: FastifyInstance) {
  // Public endpoint — NO auth required (called from static site)
  // Rate limited by global config + internal daily limit in service

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
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              vehicle: {
                type: 'object',
                properties: {
                  marca: { type: 'string' },
                  modelo: { type: 'string' },
                  ano: { type: 'string' },
                  cor: { type: 'string' },
                  fipeValue: { type: 'number' },
                  fipeCode: { type: 'string' },
                },
              },
              plans: {
                type: 'object',
                properties: {
                  basico: { type: 'object', properties: { monthly: { type: 'number' }, name: { type: 'string' } } },
                  completo: { type: 'object', properties: { monthly: { type: 'number' }, name: { type: 'string' } } },
                  premium: { type: 'object', properties: { monthly: { type: 'number' }, name: { type: 'string' } } },
                },
              },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { placa: string } }>, reply: FastifyReply) => {
      const { placa } = request.params
      const result = await lookupPlate(placa)
      return reply.send(result)
    },
  )
}
