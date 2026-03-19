import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../config/database'
import { AppError } from '../utils/app-error'

/**
 * Middleware para verificar se o usuário tem permissão para executar uma ação
 *
 * @param permissionCode - Código da permissão (ex: "deals:create", "leads:read:all")
 * @returns Middleware function
 */
export function checkPermission(permissionCode: string) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const { user } = request

    if (!user) {
      throw AppError.unauthorized('User not authenticated')
    }

    // Buscar role com permissões
    const role = await prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    if (!role) {
      throw AppError.forbidden('Role not found')
    }

    // Super admin tem todas as permissões
    if (role.level === 0) {
      return
    }

    // Verificar se tem a permissão específica
    const hasPermission = role.permissions.some(
      (rp) => rp.permission.code === permissionCode
    )

    if (!hasPermission) {
      throw AppError.forbidden(
        `You don't have permission to perform this action: ${permissionCode}`
      )
    }
  }
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões fornecidas
 */
export function checkAnyPermission(permissionCodes: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const { user } = request

    if (!user) {
      throw AppError.unauthorized('User not authenticated')
    }

    const role = await prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    if (!role) {
      throw AppError.forbidden('Role not found')
    }

    // Super admin tem todas as permissões
    if (role.level === 0) {
      return
    }

    // Verificar se tem pelo menos uma permissão
    const hasAnyPermission = role.permissions.some((rp) =>
      permissionCodes.includes(rp.permission.code)
    )

    if (!hasAnyPermission) {
      throw AppError.forbidden(
        `You don't have permission to perform this action`
      )
    }
  }
}

/**
 * Verifica se o usuário pertence à empresa (tenant isolation)
 */
export async function checkCompanyAccess(
  request: FastifyRequest,
  companyId: string
) {
  const { user } = request

  if (!user) {
    throw AppError.unauthorized('User not authenticated')
  }

  // Super admin pode acessar qualquer empresa
  const role = await prisma.role.findUnique({
    where: { id: user.roleId },
  })

  if (role?.level === 0) {
    return true
  }

  // Verificar se pertence à mesma empresa
  if (user.companyId !== companyId) {
    throw AppError.forbidden('Access denied to this company resource')
  }

  return true
}
