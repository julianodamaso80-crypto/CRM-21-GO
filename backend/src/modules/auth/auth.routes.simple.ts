import { FastifyInstance } from 'fastify'
import { AuthController } from './auth.controller.simple'
import { authenticate } from '../../middlewares/authenticate'

const authController = new AuthController()

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', {
    schema: {
      description: 'Login with email and password',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: authController.login.bind(authController),
  })

  fastify.post('/logout', {
    schema: {
      description: 'Logout and invalidate refresh token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
    handler: authController.logout.bind(authController),
  })

  fastify.get('/me', {
    onRequest: [authenticate],
    schema: {
      description: 'Get current user profile',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
    },
    handler: authController.me.bind(authController),
  })
}
