import { jsonDb } from '../../database/json-db'
import bcrypt from 'bcryptjs'
import { AppError } from '../../utils/app-error'
import { v4 as uuid } from 'uuid'

export interface LoginDTO {
  email: string
  password: string
}

export class AuthService {
  async login(data: LoginDTO, fastify: any) {
    // Buscar usuário
    const user = jsonDb.findUserByEmail(data.email)

    if (!user) {
      throw AppError.unauthorized('Invalid credentials')
    }

    // Verificar se está ativo
    if (!user.isActive) {
      throw AppError.forbidden('User is inactive')
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid credentials')
    }

    // Buscar empresa
    const company = jsonDb.findCompanyById(user.companyId)

    if (!company || !company.isActive) {
      throw AppError.forbidden('Company is inactive')
    }

    // Buscar role
    const role = jsonDb.findRoleById(user.roleId)

    // Atualizar último login
    jsonDb.updateUser(user.id, { lastLoginAt: new Date().toISOString() })

    // Gerar tokens
    const payload = {
      id: user.id,
      email: user.email,
      companyId: user.companyId,
      roleId: user.roleId,
    }

    const token = fastify.jwt.sign(payload)

    const refreshToken = fastify.jwt.sign(payload, {
      expiresIn: '7d',
    })

    // Salvar refresh token
    jsonDb.createRefreshToken({
      id: uuid(),
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    })

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    return {
      user: {
        ...userWithoutPassword,
        role,
        company,
      },
      token,
      refreshToken,
    }
  }

  async me(userId: string) {
    const user = jsonDb.findUserById(userId)

    if (!user) {
      throw AppError.notFound('User not found')
    }

    const company = jsonDb.findCompanyById(user.companyId)
    const role = jsonDb.findRoleById(user.roleId)

    const { password: _, ...userWithoutPassword } = user

    return {
      ...userWithoutPassword,
      role,
      company,
    }
  }

  async logout(refreshToken: string) {
    jsonDb.deleteRefreshToken(refreshToken)
    return { message: 'Logged out successfully' }
  }
}
