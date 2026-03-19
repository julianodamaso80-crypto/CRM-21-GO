import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Criar Planos
  console.log('📦 Creating plans...')

  const planFree = await prisma.plan.upsert({
    where: { name: 'free' },
    update: {},
    create: {
      name: 'free',
      displayName: 'Free',
      description: 'Plano gratuito para começar',
      price: 0,
      currency: 'BRL',
      billingInterval: 'month',
      maxUsers: 2,
      maxLeadsPerMonth: 100,
      maxDealsPerMonth: 50,
      maxAIMessages: 50,
      maxWebhooks: 0,
      maxAPICallsPerDay: 100,
      maxStorageGB: 1,
      features: {
        basic_crm: true,
        ai_chatbot: false,
        omnichannel: false,
        analytics: false,
        webhooks: false,
        api_access: false,
      },
      isActive: true,
      isPopular: false,
    },
  })

  const planPro = await prisma.plan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      displayName: 'Pro',
      description: 'Plano profissional completo',
      price: 297,
      currency: 'BRL',
      billingInterval: 'month',
      maxUsers: 10,
      maxLeadsPerMonth: 5000,
      maxDealsPerMonth: 1000,
      maxAIMessages: 1000,
      maxWebhooks: 10,
      maxAPICallsPerDay: 10000,
      maxStorageGB: 50,
      features: {
        basic_crm: true,
        ai_chatbot: true,
        omnichannel: true,
        analytics: true,
        webhooks: true,
        api_access: true,
      },
      isActive: true,
      isPopular: true,
    },
  })

  const planEnterprise = await prisma.plan.upsert({
    where: { name: 'enterprise' },
    update: {},
    create: {
      name: 'enterprise',
      displayName: 'Enterprise',
      description: 'Plano enterprise com recursos ilimitados',
      price: 1997,
      currency: 'BRL',
      billingInterval: 'month',
      maxUsers: 999999,
      maxLeadsPerMonth: 999999,
      maxDealsPerMonth: 999999,
      maxAIMessages: 999999,
      maxWebhooks: 999999,
      maxAPICallsPerDay: 999999,
      maxStorageGB: 999999,
      features: {
        basic_crm: true,
        ai_chatbot: true,
        omnichannel: true,
        analytics: true,
        webhooks: true,
        api_access: true,
        white_label: true,
        sso: true,
        dedicated_ip: true,
        sla: true,
      },
      isActive: true,
      isPopular: false,
    },
  })

  console.log('✅ Plans created!')

  // 2. Criar Permissions
  console.log('🔐 Creating permissions...')

  const permissions = [
    // Leads
    { resource: 'leads', action: 'create', scope: null, code: 'leads:create' },
    { resource: 'leads', action: 'read', scope: 'own', code: 'leads:read:own' },
    { resource: 'leads', action: 'read', scope: 'team', code: 'leads:read:team' },
    { resource: 'leads', action: 'read', scope: 'all', code: 'leads:read:all' },
    { resource: 'leads', action: 'update', scope: 'own', code: 'leads:update:own' },
    { resource: 'leads', action: 'update', scope: 'all', code: 'leads:update:all' },
    { resource: 'leads', action: 'delete', scope: null, code: 'leads:delete' },
    { resource: 'leads', action: 'assign', scope: null, code: 'leads:assign' },

    // Deals
    { resource: 'deals', action: 'create', scope: null, code: 'deals:create' },
    { resource: 'deals', action: 'read', scope: 'own', code: 'deals:read:own' },
    { resource: 'deals', action: 'read', scope: 'team', code: 'deals:read:team' },
    { resource: 'deals', action: 'read', scope: 'all', code: 'deals:read:all' },
    { resource: 'deals', action: 'update', scope: 'own', code: 'deals:update:own' },
    { resource: 'deals', action: 'update', scope: 'all', code: 'deals:update:all' },
    { resource: 'deals', action: 'delete', scope: null, code: 'deals:delete' },

    // Contacts
    { resource: 'contacts', action: 'create', scope: null, code: 'contacts:create' },
    { resource: 'contacts', action: 'read', scope: 'all', code: 'contacts:read:all' },
    { resource: 'contacts', action: 'update', scope: null, code: 'contacts:update' },
    { resource: 'contacts', action: 'delete', scope: null, code: 'contacts:delete' },
    { resource: 'contacts', action: 'export', scope: null, code: 'contacts:export' },

    // Users
    { resource: 'users', action: 'create', scope: null, code: 'users:create' },
    { resource: 'users', action: 'read', scope: 'all', code: 'users:read:all' },
    { resource: 'users', action: 'update', scope: null, code: 'users:update' },
    { resource: 'users', action: 'delete', scope: null, code: 'users:delete' },
    { resource: 'users', action: 'invite', scope: null, code: 'users:invite' },

    // Settings
    { resource: 'settings', action: 'billing', scope: null, code: 'settings:billing' },
    { resource: 'settings', action: 'integrations', scope: null, code: 'settings:integrations' },
    { resource: 'settings', action: 'company', scope: null, code: 'settings:company' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    })
  }

  console.log('✅ Permissions created!')

  // 3. Criar Empresa Demo
  console.log('🏢 Creating demo company...')

  const company = await prisma.company.upsert({
    where: { slug: 'empresa-demo' },
    update: {},
    create: {
      name: 'Empresa Demo',
      slug: 'empresa-demo',
      email: 'contato@empresademo.com',
      isActive: true,
    },
  })

  console.log('✅ Company created!')

  // 4. Criar Role Admin
  console.log('👑 Creating admin role...')

  const roleAdmin = await prisma.role.upsert({
    where: {
      name_companyId: {
        name: 'admin',
        companyId: company.id
      }
    },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrador',
      description: 'Acesso total ao sistema',
      level: 10,
      companyId: company.id,
      isSystem: true,
    },
  })

  // Associar TODAS as permissions ao admin
  const allPermissions = await prisma.permission.findMany()
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleAdmin.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: roleAdmin.id,
        permissionId: perm.id,
      },
    })
  }

  console.log('✅ Admin role created with all permissions!')

  // 5. Criar Subscription Free para a empresa
  console.log('💳 Creating subscription...')

  const subscription = await prisma.subscription.upsert({
    where: {
      id: 'seed-subscription-demo'
    },
    update: {},
    create: {
      id: 'seed-subscription-demo',
      companyId: company.id,
      planId: planPro.id, // Começar com Pro para testar tudo
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
  })

  console.log('✅ Subscription created!')

  // 6. Criar Usuário Admin
  console.log('👤 Creating admin user...')

  const hashedPassword = await bcrypt.hash('Admin123!', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      companyId: company.id,
      roleId: roleAdmin.id,
      isActive: true,
    },
  })

  console.log('✅ Admin user created!')

  // 7. Criar Pipe Vendas (Pipefy-like)
  console.log('🔧 Creating Sales Pipe...')

  const salesPipe = await prisma.pipe.upsert({
    where: { id: 'seed-pipe-vendas' },
    update: {},
    create: {
      id: 'seed-pipe-vendas',
      companyId: company.id,
      name: 'Vendas',
      description: 'Pipeline principal de vendas',
      color: '#3B82F6',
      tags: ['vendas', 'comercial'],
    },
  })

  const salesPhases = [
    { name: 'Prospecção', color: '#3B82F6', position: 0, probability: 10, isWon: false, isLost: false },
    { name: 'Contato Realizado', color: '#8B5CF6', position: 1, probability: 25, isWon: false, isLost: false },
    { name: 'Proposta Enviada', color: '#F59E0B', position: 2, probability: 50, isWon: false, isLost: false },
    { name: 'Negociação', color: '#F97316', position: 3, probability: 75, isWon: false, isLost: false },
    { name: 'Fechado (Ganho)', color: '#10B981', position: 4, probability: 100, isWon: true, isLost: false },
    { name: 'Fechado (Perdido)', color: '#EF4444', position: 5, probability: 0, isWon: false, isLost: true },
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
        isWon: phase.isWon,
        isLost: phase.isLost,
      },
    })
  }

  const salesFields = [
    { name: 'nome_cliente', label: 'Nome do Cliente', type: 'text', required: true, position: 0 },
    { name: 'email', label: 'Email', type: 'email', required: true, position: 1 },
    { name: 'telefone', label: 'Telefone', type: 'phone', required: false, position: 2 },
    { name: 'produto', label: 'Produto', type: 'select', required: false, position: 3, configJson: { options: ['Tubos', 'Conexões', 'Válvulas', 'Outros'] } },
    { name: 'valor', label: 'Valor', type: 'currency', required: false, position: 4 },
    { name: 'prioridade', label: 'Prioridade', type: 'select', required: false, position: 5, configJson: { options: ['alta', 'media', 'baixa'] } },
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

  console.log('✅ Sales Pipe created with 6 phases and 6 fields!')

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('📝 Login credentials:')
  console.log('   Email: admin@crm.com')
  console.log('   Password: Admin123!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
