import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string
      email: string
      companyId: string
      roleId: string
    }
  }
}
