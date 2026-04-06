import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { lookupPlate } from './plate-lookup.service'
import { createPublicLead } from './lead-capture.service'
import { convertLead } from './lead-convert.service'
import { sendFollowUp } from './lead-followup.service'

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
      const ip = request.ip
      const userAgent = request.headers['user-agent'] || ''
      const result = await createPublicLead(body, ip, userAgent)
      return reply.status(201).send(result)
    },
  )

  // POST /lead/:id/followup — Envia mensagem de follow-up via WhatsApp
  fastify.post<{ Params: { id: string } }>(
    '/lead/:id/followup',
    {
      schema: {
        description: 'Envia mensagem de follow-up via WhatsApp (Evolution API) para lead que não converteu',
        tags: ['Lead Follow-Up'],
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params
      const result = await sendFollowUp({ leadId: id })
      return reply.send(result)
    },
  )

  // PATCH /lead/:id/convert — Converte lead em cliente (webhook ou manual)
  fastify.patch<{ Params: { id: string } }>(
    '/lead/:id/convert',
    {
      schema: {
        description: 'Converte lead em cliente ativo e dispara conversões offline (Meta CAPI + Google Ads)',
        tags: ['Lead Conversion'],
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params
      const body = request.body as any
      const result = await convertLead(id, body)
      return reply.send(result)
    },
  )
}
