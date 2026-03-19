import { FastifyRequest, FastifyReply } from 'fastify'
import { MedicalRecordsService, CreateMedicalRecordDTO, UpdateMedicalRecordDTO, ListMedicalRecordsQuery } from './medical-records.service'

const medicalRecordsService = new MedicalRecordsService()

export class MedicalRecordsController {
  /**
   * GET /medical-records
   * Lista prontuários com filtros
   */
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId

    const query = request.query as any
    const filters: ListMedicalRecordsQuery = {
      patientId: query.patientId,
      doctorId: query.doctorId,
      type: query.type,
    }

    const result = await medicalRecordsService.listRecords(companyId, filters)

    return reply.send(result)
  }

  /**
   * GET /medical-records/:id
   * Busca prontuário por ID
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const record = await medicalRecordsService.getRecordById(id, companyId)

    return reply.send(record)
  }

  /**
   * POST /medical-records
   * Cria novo prontuário
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const data = request.body as CreateMedicalRecordDTO

    const record = await medicalRecordsService.createRecord(companyId, data)

    return reply.status(201).send(record)
  }

  /**
   * PUT /medical-records/:id
   * Atualiza prontuário existente
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }
    const data = request.body as UpdateMedicalRecordDTO

    const record = await medicalRecordsService.updateRecord(id, companyId, data)

    return reply.send(record)
  }

  /**
   * DELETE /medical-records/:id
   * Deleta prontuário
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { id } = request.params as { id: string }

    const result = await medicalRecordsService.deleteRecord(id, companyId)

    return reply.send(result)
  }

  /**
   * GET /medical-records/types
   * Retorna tipos de prontuário disponíveis
   */
  async getTypes(_request: FastifyRequest, reply: FastifyReply) {
    const types = await medicalRecordsService.getTypes()

    return reply.send(types)
  }

  /**
   * GET /patients/:patientId/timeline
   * Retorna timeline completa do paciente
   */
  async getPatientTimeline(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const companyId = user.companyId
    const { patientId } = request.params as { patientId: string }

    const timeline = await medicalRecordsService.getPatientTimeline(patientId, companyId)

    return reply.send(timeline)
  }
}
