import { FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from '../utils/app-error'

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  try {
    await request.jwtVerify()

    // O payload do JWT estará em request.user após jwtVerify()
    if (!request.user) {
      throw AppError.unauthorized('Invalid token payload')
    }

    // Validar estrutura do payload
    const { id, email, companyId, roleId } = request.user

    if (!id || !email || !companyId || !roleId) {
      throw AppError.unauthorized('Invalid token payload structure')
    }
  } catch (error) {
    throw AppError.unauthorized('Authentication failed')
  }
}
