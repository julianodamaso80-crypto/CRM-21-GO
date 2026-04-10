import { prisma } from '../../config/database'

interface CreateOuvidoriaInput {
  tipo: string
  nome?: string
  telefone?: string
  assunto?: string
  mensagem?: string
  comentario?: string
  arquivos?: string[]
  companyId?: string
}

export async function createOuvidoria(input: CreateOuvidoriaInput) {
  return prisma.ouvidoria.create({
    data: {
      companyId: input.companyId || 'company-21go',
      tipo: input.tipo,
      nome: input.nome || null,
      telefone: input.telefone || null,
      assunto: input.assunto || null,
      mensagem: input.mensagem || null,
      comentario: input.comentario || null,
      arquivos: input.arquivos || [],
    },
  })
}

export async function listOuvidoria(companyId: string, filters?: { tipo?: string; status?: string }) {
  return prisma.ouvidoria.findMany({
    where: {
      companyId,
      ...(filters?.tipo && { tipo: filters.tipo }),
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: { createdAt: 'desc' },
  })
}
