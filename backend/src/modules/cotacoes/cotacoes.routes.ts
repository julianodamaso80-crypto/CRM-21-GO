import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { prisma } from '../../config/database'
import { getApplicablePlans } from '../plate-lookup/pricing'

export async function cotacoesRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate)

  // GET /cotacoes
  fastify.get('/', async (request, reply) => {
    const { companyId } = (request as any).user
    const query = request.query as any
    const page = Math.max(1, parseInt(query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20))
    const skip = (page - 1) * limit

    const where: any = { companyId }
    if (query.status) where.status = query.status

    const [data, total] = await Promise.all([
      prisma.cotacao.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lead: { select: { id: true, nome: true } },
          associado: { select: { id: true, nome: true } },
        },
      }),
      prisma.cotacao.count({ where }),
    ])

    return reply.send({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  })

  // POST /cotacoes
  fastify.post('/', async (request, reply) => {
    const { companyId } = (request as any).user
    const body = request.body as any

    // Busca preco na tabela real
    const applicablePlans = getApplicablePlans(
      body.valorFipe,
      body.categoria,
      body.combustivel,
      body.cilindrada,
    )
    const matched = applicablePlans.find(p => p.id === body.plano) || applicablePlans[0]
    const valorMensal = matched?.monthly || 0
    const taxaPlano = 0
    const taxaAdmin = 0

    const cotacao = await prisma.cotacao.create({
      data: {
        companyId,
        leadId: body.leadId,
        associadoId: body.associadoId,
        veiculoDados: body.veiculoDados || {},
        valorFipe: body.valorFipe,
        plano: body.plano,
        taxaPlano,
        taxaAdmin,
        valorMensal,
        validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pendente',
      },
    })

    return reply.status(201).send(cotacao)
  })

  // POST /cotacoes/calcular — calculo por tabela real
  fastify.post('/calcular', async (request, reply) => {
    const body = request.body as any
    const plans = getApplicablePlans(
      body.valorFipe,
      body.categoria,
      body.combustivel,
      body.cilindrada,
    )

    const resultados = plans.map(p => ({
      plano: p.id,
      nome: p.name,
      valorFipe: body.valorFipe,
      valorMensal: p.monthly,
      popular: p.popular || false,
    }))

    return reply.send({ resultados })
  })

  // GET /cotacoes/:id
  fastify.get('/:id', async (request, reply) => {
    const { companyId } = (request as any).user
    const { id } = request.params as { id: string }

    const cotacao = await prisma.cotacao.findFirst({
      where: { id, companyId },
      include: {
        lead: { select: { id: true, nome: true } },
        associado: { select: { id: true, nome: true } },
      },
    })

    if (!cotacao) return reply.status(404).send({ message: 'Cotacao nao encontrada' })
    return reply.send(cotacao)
  })

  // PUT /cotacoes/:id
  fastify.put('/:id', async (request, reply) => {
    const { companyId } = (request as any).user
    const { id } = request.params as { id: string }
    const body = request.body as any

    const existing = await prisma.cotacao.findFirst({ where: { id, companyId } })
    if (!existing) return reply.status(404).send({ message: 'Cotacao nao encontrada' })

    const cotacao = await prisma.cotacao.update({
      where: { id },
      data: { status: body.status },
    })

    return reply.send(cotacao)
  })
}
