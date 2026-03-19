import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed for 21Go Protecao Veicular...')

  // 1. Empresa
  console.log('Creating company...')
  const company = await prisma.company.upsert({
    where: { slug: '21go' },
    update: {},
    create: {
      name: '21Go Protecao Veicular',
      slug: '21go',
      email: 'contato@21go.org',
      phone: '(21) 3333-2100',
      city: 'Rio de Janeiro',
      state: 'RJ',
      settings: {
        planos: ['basico', 'completo', 'premium'],
        taxas: { basico: 0.018, completo: 0.028, premium: 0.038 },
        taxaAdmin: 35.0,
        hinovaIntegration: false,
      },
    },
  })

  // 2. Usuario admin (Juliano)
  console.log('Creating admin user...')
  const hashedPassword = await bcrypt.hash('160807', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'damasojuliano@gmail.com' },
    update: {},
    create: {
      email: 'damasojuliano@gmail.com',
      password: hashedPassword,
      firstName: 'Juliano',
      lastName: 'Damaso',
      role: 'admin',
      companyId: company.id,
      isActive: true,
    },
  })

  // 3. Pipe de Vendas (Pipefy-like)
  console.log('Creating sales pipe...')
  const salesPipe = await prisma.pipe.upsert({
    where: { id: 'seed-pipe-vendas' },
    update: {},
    create: {
      id: 'seed-pipe-vendas',
      companyId: company.id,
      name: 'Vendas',
      description: 'Pipeline de adesao de novos associados',
      color: '#1B4DA1',
      tags: ['vendas', 'comercial'],
    },
  })

  const salesPhases = [
    { name: 'Novo Lead', color: '#3D72DE', position: 0, probability: 10 },
    { name: 'Qualificado', color: '#A78BFA', position: 1, probability: 25 },
    { name: 'Cotacao Enviada', color: '#FBBF24', position: 2, probability: 50 },
    { name: 'Negociacao', color: '#F08C28', position: 3, probability: 75 },
    { name: 'Fechado (Aderiu)', color: '#34D399', position: 4, probability: 100, isWon: true },
    { name: 'Perdido', color: '#FB7185', position: 5, probability: 0, isLost: true },
  ]

  for (const phase of salesPhases) {
    await prisma.phase.upsert({
      where: { id: `seed-phase-${phase.position}` },
      update: {},
      create: {
        id: `seed-phase-${phase.position}`,
        companyId: company.id,
        pipeId: salesPipe.id,
        name: phase.name,
        color: phase.color,
        position: phase.position,
        probability: phase.probability,
        isWon: phase.isWon || false,
        isLost: phase.isLost || false,
      },
    })
  }

  const salesFields = [
    { name: 'nome_lead', label: 'Nome do Lead', type: 'text', required: true, position: 0 },
    { name: 'whatsapp', label: 'WhatsApp', type: 'phone', required: true, position: 1 },
    { name: 'veiculo', label: 'Veiculo de Interesse', type: 'text', required: false, position: 2 },
    { name: 'plano', label: 'Plano', type: 'select', required: false, position: 3, configJson: { options: ['Basico', 'Completo', 'Premium'] } },
    { name: 'valor_cotacao', label: 'Valor Cotacao', type: 'currency', required: false, position: 4 },
    { name: 'origem', label: 'Origem', type: 'select', required: false, position: 5, configJson: { options: ['Google Ads', 'Meta Ads', 'Instagram', 'Indicacao', 'WhatsApp', 'Direto'] } },
  ]

  for (const field of salesFields) {
    await prisma.fieldDefinition.upsert({
      where: { pipeId_name: { pipeId: salesPipe.id, name: field.name } },
      update: {},
      create: {
        companyId: company.id,
        pipeId: salesPipe.id,
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        position: field.position,
        configJson: (field as any).configJson || {},
      },
    })
  }

  // 4. Pipe de Sinistros
  console.log('Creating sinistros pipe...')
  const sinistrosPipe = await prisma.pipe.upsert({
    where: { id: 'seed-pipe-sinistros' },
    update: {},
    create: {
      id: 'seed-pipe-sinistros',
      companyId: company.id,
      name: 'Sinistros',
      description: 'Acompanhamento de sinistros da abertura ao encerramento',
      color: '#FB7185',
      tags: ['operacao', 'sinistros'],
    },
  })

  const sinistrosPhases = [
    { name: 'Aberto', color: '#FB7185', position: 0, probability: 0 },
    { name: 'Em Analise', color: '#FBBF24', position: 1, probability: 20 },
    { name: 'Na Oficina', color: '#F08C28', position: 2, probability: 50 },
    { name: 'Aguardando Peca', color: '#A78BFA', position: 3, probability: 60 },
    { name: 'Em Reparo', color: '#3D72DE', position: 4, probability: 80 },
    { name: 'Pronto', color: '#34D399', position: 5, probability: 95 },
    { name: 'Entregue', color: '#34D399', position: 6, probability: 100, isWon: true },
  ]

  for (const phase of sinistrosPhases) {
    await prisma.phase.upsert({
      where: { id: `seed-sinistro-phase-${phase.position}` },
      update: {},
      create: {
        id: `seed-sinistro-phase-${phase.position}`,
        companyId: company.id,
        pipeId: sinistrosPipe.id,
        name: phase.name,
        color: phase.color,
        position: phase.position,
        probability: phase.probability,
        isWon: phase.isWon || false,
        isLost: phase.isLost || false,
      },
    })
  }

  console.log('')
  console.log('Seed completed successfully!')
  console.log('')
  console.log('Company: 21Go Protecao Veicular')
  console.log('Admin: damasojuliano@gmail.com')
  console.log('Pipes: Vendas (6 fases), Sinistros (7 fases)')
  console.log('')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
