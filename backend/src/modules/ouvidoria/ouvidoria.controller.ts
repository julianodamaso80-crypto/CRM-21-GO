import { FastifyRequest, FastifyReply } from 'fastify'
import { createOuvidoria, listOuvidoria } from './ouvidoria.service'

export async function createOuvidoriaHandler(
  request: FastifyRequest<{ Body: { tipo: string; nome?: string; telefone?: string; assunto?: string; mensagem?: string; comentario?: string; arquivos?: string[] } }>,
  reply: FastifyReply,
) {
  const { tipo, nome, telefone, assunto, mensagem, comentario, arquivos } = request.body

  if (!tipo) {
    return reply.status(400).send({ error: 'Campo tipo é obrigatório' })
  }

  const record = await createOuvidoria({ tipo, nome, telefone, assunto, mensagem, comentario, arquivos, companyId: 'company-21go' })

  return reply.status(201).send({ success: true, id: record.id })
}

export async function listOuvidoriaHandler(
  request: FastifyRequest<{ Querystring: { tipo?: string; status?: string } }>,
  reply: FastifyReply,
) {
  const user = request.user as any
  const { tipo, status } = request.query
  const records = await listOuvidoria(user.companyId, { tipo, status })
  return reply.send(records)
}
