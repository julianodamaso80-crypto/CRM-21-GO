import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { lookupPlate } from './plate-lookup.service'
import {
  listMarcas,
  listModelos,
  listAnos,
  lookupFipePrice,
  type VehicleKind,
} from './fipe-lookup.service'
import { createPublicLead } from './lead-capture.service'
import { convertLead } from './lead-convert.service'
import { sendFollowUp } from './lead-followup.service'

function normalizeKind(v: string | undefined): VehicleKind {
  return v === 'motos' ? 'motos' : 'carros'
}

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

  // ── FIPE Lookup (para clientes sem placa) ──────────────────────────
  // GET /fipe/marcas?tipo=carros|motos
  fastify.get(
    '/fipe/marcas',
    {
      schema: {
        description: 'Lista marcas FIPE (carros ou motos)',
        tags: ['FIPE Lookup'],
        querystring: {
          type: 'object',
          properties: { tipo: { type: 'string', enum: ['carros', 'motos'] } },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { tipo?: string } }>, reply: FastifyReply) => {
      const kind = normalizeKind(request.query.tipo)
      try {
        const marcas = await listMarcas(kind)
        return reply.send({ success: true, data: marcas })
      } catch {
        return reply.status(502).send({ success: false, error: 'Falha ao buscar marcas' })
      }
    },
  )

  // GET /fipe/modelos?tipo=&marca=
  fastify.get(
    '/fipe/modelos',
    {
      schema: {
        description: 'Lista modelos FIPE de uma marca',
        tags: ['FIPE Lookup'],
        querystring: {
          type: 'object',
          required: ['marca'],
          properties: {
            tipo: { type: 'string', enum: ['carros', 'motos'] },
            marca: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { tipo?: string; marca: string } }>, reply: FastifyReply) => {
      const kind = normalizeKind(request.query.tipo)
      try {
        const modelos = await listModelos(kind, request.query.marca)
        return reply.send({ success: true, data: modelos })
      } catch {
        return reply.status(502).send({ success: false, error: 'Falha ao buscar modelos' })
      }
    },
  )

  // GET /fipe/anos?tipo=&marca=&modelo=
  fastify.get(
    '/fipe/anos',
    {
      schema: {
        description: 'Lista anos FIPE de um modelo',
        tags: ['FIPE Lookup'],
        querystring: {
          type: 'object',
          required: ['marca', 'modelo'],
          properties: {
            tipo: { type: 'string', enum: ['carros', 'motos'] },
            marca: { type: 'string' },
            modelo: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { tipo?: string; marca: string; modelo: string } }>, reply: FastifyReply) => {
      const kind = normalizeKind(request.query.tipo)
      try {
        const anos = await listAnos(kind, request.query.marca, request.query.modelo)
        return reply.send({ success: true, data: anos })
      } catch {
        return reply.status(502).send({ success: false, error: 'Falha ao buscar anos' })
      }
    },
  )

  // GET /fipe/preco?tipo=&marca=&modelo=&ano=
  fastify.get(
    '/fipe/preco',
    {
      schema: {
        description: 'Retorna preço FIPE + planos aplicáveis (sem placa)',
        tags: ['FIPE Lookup'],
        querystring: {
          type: 'object',
          required: ['marca', 'modelo', 'ano'],
          properties: {
            tipo: { type: 'string', enum: ['carros', 'motos'] },
            marca: { type: 'string' },
            modelo: { type: 'string' },
            ano: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Querystring: { tipo?: string; marca: string; modelo: string; ano: string } }>, reply: FastifyReply) => {
      const kind = normalizeKind(request.query.tipo)
      const result = await lookupFipePrice(kind, request.query.marca, request.query.modelo, request.query.ano)
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
