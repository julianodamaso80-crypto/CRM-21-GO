import { FastifyRequest, FastifyReply } from 'fastify'
import { AppointmentsService, CreateAppointmentDTO, UpdateAppointmentDTO, ListAppointmentsQuery } from './appointments.service'

const appointmentsService = new AppointmentsService()

export class AppointmentsController {
  /**
   * GET /appointments
   * Lista agendamentos com filtros
   */
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const query = request.query as any
    const filters: ListAppointmentsQuery = {
      date: query.date,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      doctorId: query.doctorId,
      patientId: query.patientId,
      status: query.status,
    }

    const result = await appointmentsService.listAppointments(companyId, filters)

    return reply.send(result)
  }

  /**
   * GET /appointments/:id
   * Busca agendamento por ID
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const appointment = await appointmentsService.getAppointmentById(id, companyId)

    return reply.send(appointment)
  }

  /**
   * POST /appointments
   * Cria novo agendamento
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const data = request.body as CreateAppointmentDTO

    const appointment = await appointmentsService.createAppointment(companyId, data)

    return reply.status(201).send(appointment)
  }

  /**
   * PUT /appointments/:id
   * Atualiza agendamento existente
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }
    const data = request.body as UpdateAppointmentDTO

    const appointment = await appointmentsService.updateAppointment(id, companyId, data)

    return reply.send(appointment)
  }

  /**
   * DELETE /appointments/:id
   * Deleta agendamento
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const result = await appointmentsService.deleteAppointment(id, companyId)

    return reply.send(result)
  }

  /**
   * GET /appointments/stats
   * Estatísticas de agendamentos
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const stats = await appointmentsService.getStats(companyId)

    return reply.send(stats)
  }

  /**
   * GET /appointments/types
   * Retorna tipos de agendamento disponíveis
   */
  async getTypes(_request: FastifyRequest, reply: FastifyReply) {
    const types = appointmentsService.getTypes()

    return reply.send(types)
  }

  /**
   * GET /appointments/availability
   * Retorna disponibilidade de horários para um médico
   */
  async getAvailability(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const query = request.query as any
    const doctorId = query.doctorId as string
    const date = query.date as string

    if (!doctorId || !date) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'doctorId and date are required query parameters',
      })
    }

    const availability = await appointmentsService.getAvailability(companyId, doctorId, date)

    return reply.send(availability)
  }
}
