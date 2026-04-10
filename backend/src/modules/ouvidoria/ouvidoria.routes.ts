import { FastifyInstance } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { createOuvidoriaHandler, listOuvidoriaHandler } from './ouvidoria.controller'

export async function ouvidoriaRoutes(app: FastifyInstance) {
  // Público — site envia sem auth
  app.post('/api/ouvidoria', createOuvidoriaHandler)

  // Autenticado — gestor/admin consulta
  app.get('/api/ouvidoria', { preHandler: [authenticate] }, listOuvidoriaHandler)
}
