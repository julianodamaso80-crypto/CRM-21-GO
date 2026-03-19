import { FastifyRequest, FastifyReply } from 'fastify'
import { ContactsService, CreateContactDTO, UpdateContactDTO, ListContactsQuery } from './contacts.service'

const contactsService = new ContactsService()

export class ContactsController {
  /**
   * GET /contacts
   * Lista contatos com paginação e filtros
   */
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const query = request.query as any
    const filters: ListContactsQuery = {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      tags: query.tags ? (Array.isArray(query.tags) ? query.tags : [query.tags]) : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    }

    const result = await contactsService.listContacts(companyId, filters)

    return reply.send(result)
  }

  /**
   * GET /contacts/:id
   * Busca contato por ID
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const contact = await contactsService.getContactById(id, companyId)

    return reply.send(contact)
  }

  /**
   * POST /contacts
   * Cria novo contato
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const data = request.body as CreateContactDTO

    const contact = await contactsService.createContact(companyId, data)

    return reply.status(201).send(contact)
  }

  /**
   * PUT /contacts/:id
   * Atualiza contato existente
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }
    const data = request.body as UpdateContactDTO

    const contact = await contactsService.updateContact(id, companyId, data)

    return reply.send(contact)
  }

  /**
   * DELETE /contacts/:id
   * Deleta contato
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const result = await contactsService.deleteContact(id, companyId)

    return reply.send(result)
  }

  /**
   * GET /contacts/tags
   * Lista tags únicas
   */
  async getTags(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const tags = await contactsService.getUniqueTags(companyId)

    return reply.send({ tags })
  }

  /**
   * GET /contacts/stats
   * Estatísticas de contatos
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const stats = await contactsService.getStats(companyId)

    return reply.send(stats)
  }
}
