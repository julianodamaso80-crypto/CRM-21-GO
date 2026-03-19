import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService, LoginDTO } from './auth.service.simple'
import { z } from 'zod'

const authService = new AuthService()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const data = loginSchema.parse(request.body) as LoginDTO

    const result = await authService.login(data, request.server)

    return reply.send(result)
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = refreshTokenSchema.parse(request.body)

    const result = await authService.logout(refreshToken)

    return reply.send(result)
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const user = await authService.me(request.user.id)

    return reply.send(user)
  }
}
