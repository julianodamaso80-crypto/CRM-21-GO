import { FastifyRequest, FastifyReply } from 'fastify'
import { DoctorsService, CreateDoctorDTO, UpdateDoctorDTO } from './doctors.service'

const doctorsService = new DoctorsService()

export class DoctorsController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const doctors = await doctorsService.listDoctors(user.companyId)
    return reply.send(doctors)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const doctor = await doctorsService.getDoctorById(id, user.companyId)
    return reply.send(doctor)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const data = request.body as CreateDoctorDTO
    const doctor = await doctorsService.createDoctor(user.companyId, data)
    return reply.status(201).send(doctor)
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const data = request.body as UpdateDoctorDTO
    const doctor = await doctorsService.updateDoctor(id, user.companyId, data)
    return reply.send(doctor)
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as any).user
    const { id } = request.params as { id: string }
    const result = await doctorsService.deleteDoctor(id, user.companyId)
    return reply.send(result)
  }

  async getSpecialties(_request: FastifyRequest, reply: FastifyReply) {
    const service = new DoctorsService()
    return reply.send(service.getSpecialties())
  }
}
