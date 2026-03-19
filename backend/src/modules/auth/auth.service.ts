import { prisma } from '../../config/database'
import bcrypt from 'bcryptjs'
import { AppError } from '../../utils/app-error'

export interface RegisterDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  companyName: string
}

export interface LoginDTO {
  email: string
  password: string
}

export class AuthService {
  async register(data: RegisterDTO) {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw AppError.conflict('Email already registered')
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Criar empresa
    const slug = data.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        slug: `${slug}-${Date.now()}`,
        isActive: true,
      },
    })

    // Buscar plano Free
    const freePlan = await prisma.plan.findUnique({
      where: { name: 'free' },
    })

    if (!freePlan) {
      throw AppError.internal('Free plan not found. Please run seed.')
    }

    // Criar subscription
    await prisma.subscription.create({
      data: {
        companyId: company.id,
        planId: freePlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    // Criar role Admin para a empresa
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        displayName: 'Administrador',
        description: 'Acesso total',
        level: 10,
        companyId: company.id,
        isSystem: true,
      },
    })

    // Associar todas as permissions ao admin
    const allPermissions = await prisma.permission.findMany()
    for (const perm of allPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      })
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        companyId: company.id,
        roleId: adminRole.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        companyId: true,
        roleId: true,
        createdAt: true,
      },
    })

    return { user, company }
  }

  async login(data: LoginDTO, fastify: any) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        role: true,
        company: true,
      },
    })

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

    // Verificar se empresa está ativa
    if (!user.company.isActive) {
      throw AppError.forbidden('Company is inactive')
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

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

    // Salvar refresh token no banco
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Remover senha do retorno
    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    }
  }

  async refreshToken(oldRefreshToken: string, fastify: any) {
    // Buscar refresh token no banco
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    })

    if (!refreshTokenRecord) {
      throw AppError.unauthorized('Invalid refresh token')
    }

    // Verificar se expirou
    if (refreshTokenRecord.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token expired')
    }

    // Deletar token antigo
    await prisma.refreshToken.delete({
      where: { id: refreshTokenRecord.id },
    })

    // Gerar novos tokens
    const payload = {
      id: refreshTokenRecord.user.id,
      email: refreshTokenRecord.user.email,
      companyId: refreshTokenRecord.user.companyId,
      roleId: refreshTokenRecord.user.roleId,
    }

    const newToken = fastify.jwt.sign(payload)
    const newRefreshToken = fastify.jwt.sign(payload, {
      expiresIn: '7d',
    })

    // Salvar novo refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: refreshTokenRecord.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    }
  }

  async logout(refreshToken: string) {
    // Deletar refresh token
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })

    return { message: 'Logged out successfully' }
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        phone: true,
        timezone: true,
        language: true,
        isActive: true,
        companyId: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            level: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        createdAt: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      throw AppError.notFound('User not found')
    }

    return user
  }
}
