import { FastifyInstance } from 'fastify'
import { MedicalRecordsController } from './medical-records.controller'
import { authenticate } from '../../middlewares/authenticate'

const medicalRecordsController = new MedicalRecordsController()

export async function medicalRecordsRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authenticate)

  // GET /medical-records/types - deve vir antes de /medical-records/:id
  fastify.get('/types', {
    schema: {
      description: 'Get available medical record types',
      tags: ['medical-records'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            anamnesis: { type: 'string' },
            follow_up: { type: 'string' },
            exam_result: { type: 'string' },
            prescription: { type: 'string' },
            referral: { type: 'string' },
            procedure_note: { type: 'string' },
            evolution: { type: 'string' },
          },
        },
      },
    },
    handler: medicalRecordsController.getTypes.bind(medicalRecordsController),
  })

  // GET /medical-records
  fastify.get('/', {
    schema: {
      description: 'List medical records with filters',
      tags: ['medical-records'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
        },
      },
    },
    handler: medicalRecordsController.list.bind(medicalRecordsController),
  })

  // GET /medical-records/:id
  fastify.get('/:id', {
    schema: {
      description: 'Get medical record by ID with related data',
      tags: ['medical-records'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: medicalRecordsController.getById.bind(medicalRecordsController),
  })

  // POST /medical-records
  fastify.post('/', {
    schema: {
      description: 'Create a new medical record',
      tags: ['medical-records'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['patientId', 'doctorId', 'type', 'date'],
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          appointmentId: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          chiefComplaint: { type: 'string' },
          anamnesis: { type: 'string' },
          physicalExam: { type: 'string' },
          diagnosis: { type: 'string' },
          diagnosisCid: { type: 'string' },
          prescription: { type: 'string' },
          procedures: { type: 'string' },
          notes: { type: 'string' },
          referral: { type: 'string' },
          referralSpecialty: { type: 'string' },
          vitalSigns: {
            type: 'object',
            properties: {
              bloodPressure: { type: 'string' },
              heartRate: { type: 'number' },
              temperature: { type: 'number' },
              weight: { type: 'number' },
              height: { type: 'number' },
              oxygenSaturation: { type: 'number' },
            },
          },
          isConfidential: { type: 'boolean' },
        },
      },
    },
    handler: medicalRecordsController.create.bind(medicalRecordsController),
  })

  // PUT /medical-records/:id
  fastify.put('/:id', {
    schema: {
      description: 'Update an existing medical record',
      tags: ['medical-records'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          doctorId: { type: 'string', format: 'uuid' },
          appointmentId: { type: 'string', format: 'uuid' },
          type: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          chiefComplaint: { type: 'string' },
          anamnesis: { type: 'string' },
          physicalExam: { type: 'string' },
          diagnosis: { type: 'string' },
          diagnosisCid: { type: 'string' },
          prescription: { type: 'string' },
          procedures: { type: 'string' },
          notes: { type: 'string' },
          referral: { type: 'string' },
          referralSpecialty: { type: 'string' },
          vitalSigns: {
            type: 'object',
            properties: {
              bloodPressure: { type: 'string' },
              heartRate: { type: 'number' },
              temperature: { type: 'number' },
              weight: { type: 'number' },
              height: { type: 'number' },
              oxygenSaturation: { type: 'number' },
            },
          },
          isConfidential: { type: 'boolean' },
        },
      },
    },
    handler: medicalRecordsController.update.bind(medicalRecordsController),
  })

  // DELETE /medical-records/:id
  fastify.delete('/:id', {
    schema: {
      description: 'Delete a medical record',
      tags: ['medical-records'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
      },
    },
    handler: medicalRecordsController.delete.bind(medicalRecordsController),
  })
}

/**
 * Rotas de timeline do paciente
 * Registrar separadamente em: /api/patients
 */
export async function patientTimelineRoutes(fastify: FastifyInstance) {
  // Todas as rotas requerem autenticação
  fastify.addHook('onRequest', authenticate)

  // GET /patients/:patientId/timeline
  fastify.get('/:patientId/timeline', {
    schema: {
      description: 'Get complete patient timeline (medical records + appointments)',
      tags: ['medical-records', 'patients'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['patientId'],
        properties: {
          patientId: { type: 'string', format: 'uuid' },
        },
      },
    },
    handler: medicalRecordsController.getPatientTimeline.bind(medicalRecordsController),
  })
}
