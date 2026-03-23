import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding 21Go Protecao Veicular database...')

  // ============================================================================
  // 1. COMPANY
  // ============================================================================
  console.log('Creating company...')
  const company = await prisma.company.upsert({
    where: { slug: '21go' },
    update: {},
    create: {
      id: 'company-21go',
      name: '21Go Protecao Veicular',
      slug: '21go',
      email: 'contato@21go.org',
      phone: '(21) 3333-2100',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-020',
      website: 'https://21go.org',
      settings: {
        planos: ['basico', 'completo', 'premium'],
        taxas: { basico: 0.018, completo: 0.028, premium: 0.038 },
        taxaAdmin: 35.0,
        hinovaIntegration: false,
      },
    },
  })
  const cid = company.id

  // ============================================================================
  // 2. USERS (4 roles)
  // ============================================================================
  console.log('Creating users...')
  const hash = await bcrypt.hash('160807', 10)

  const juliano = await prisma.user.upsert({
    where: { email: 'damasojuliano@gmail.com' },
    update: {},
    create: {
      id: 'user-juliano',
      email: 'damasojuliano@gmail.com',
      password: hash,
      firstName: 'Juliano',
      lastName: 'Damaso',
      role: 'admin',
      companyId: cid,
    },
  })

  const gestor = await prisma.user.upsert({
    where: { email: 'carlos.gestor@21go.org' },
    update: {},
    create: {
      id: 'user-carlos',
      email: 'carlos.gestor@21go.org',
      password: hash,
      firstName: 'Carlos',
      lastName: 'Mendes',
      role: 'gestor',
      companyId: cid,
    },
  })

  const vendedor = await prisma.user.upsert({
    where: { email: 'ana.vendas@21go.org' },
    update: {},
    create: {
      id: 'user-ana',
      email: 'ana.vendas@21go.org',
      password: hash,
      firstName: 'Ana',
      lastName: 'Oliveira',
      role: 'vendedor',
      companyId: cid,
    },
  })

  const operacao = await prisma.user.upsert({
    where: { email: 'marcos.operacao@21go.org' },
    update: {},
    create: {
      id: 'user-marcos',
      email: 'marcos.operacao@21go.org',
      password: hash,
      firstName: 'Marcos',
      lastName: 'Santos',
      role: 'operacao',
      companyId: cid,
    },
  })

  // ============================================================================
  // 3. ASSOCIADOS (10 com dados brasileiros)
  // ============================================================================
  console.log('Creating associados...')
  const associadosData = [
    { id: 'assoc-1', nome: 'Joao Pedro Silva', cpf: '123.456.789-01', email: 'joao.silva@email.com', telefone: '(21) 99871-1234', whatsapp: '(21) 99871-1234', cidade: 'Rio de Janeiro', uf: 'RJ', bairro: 'Copacabana', cep: '22041-001', status: 'ativo', origem: 'google_ads', dataAdesao: new Date('2024-03-15') },
    { id: 'assoc-2', nome: 'Maria Fernanda Santos', cpf: '234.567.890-12', email: 'maria.santos@email.com', telefone: '(21) 99872-2345', whatsapp: '(21) 99872-2345', cidade: 'Niteroi', uf: 'RJ', bairro: 'Icarai', cep: '24220-040', status: 'ativo', origem: 'indicacao', dataAdesao: new Date('2024-05-20'), indicadoPorId: 'assoc-1' },
    { id: 'assoc-3', nome: 'Carlos Eduardo Oliveira', cpf: '345.678.901-23', email: 'carlos.oliveira@email.com', telefone: '(21) 99873-3456', whatsapp: '(21) 99873-3456', cidade: 'Rio de Janeiro', uf: 'RJ', bairro: 'Barra da Tijuca', cep: '22640-100', status: 'ativo', origem: 'meta_ads', dataAdesao: new Date('2024-07-10') },
    { id: 'assoc-4', nome: 'Ana Carolina Pereira', cpf: '456.789.012-34', email: 'ana.pereira@email.com', telefone: '(21) 99874-4567', whatsapp: '(21) 99874-4567', cidade: 'Rio de Janeiro', uf: 'RJ', bairro: 'Tijuca', cep: '20511-000', status: 'inadimplente', origem: 'instagram', dataAdesao: new Date('2024-01-05') },
    { id: 'assoc-5', nome: 'Roberto Souza Lima', cpf: '567.890.123-45', email: 'roberto.lima@email.com', telefone: '(21) 99875-5678', whatsapp: '(21) 99875-5678', cidade: 'Duque de Caxias', uf: 'RJ', bairro: 'Centro', cep: '25010-000', status: 'ativo', origem: 'whatsapp', dataAdesao: new Date('2024-09-01') },
    { id: 'assoc-6', nome: 'Fernanda Costa Alves', cpf: '678.901.234-56', email: 'fernanda.alves@email.com', telefone: '(21) 99876-6789', whatsapp: '(21) 99876-6789', cidade: 'Sao Goncalo', uf: 'RJ', bairro: 'Alcantara', cep: '24710-000', status: 'ativo', origem: 'indicacao', dataAdesao: new Date('2024-06-18'), indicadoPorId: 'assoc-3' },
    { id: 'assoc-7', nome: 'Lucas Mendes Rocha', cpf: '789.012.345-67', email: 'lucas.rocha@email.com', telefone: '(21) 99877-7890', whatsapp: '(21) 99877-7890', cidade: 'Rio de Janeiro', uf: 'RJ', bairro: 'Meier', cep: '20710-000', status: 'cancelado', origem: 'google_ads', dataAdesao: new Date('2023-08-20'), dataCancelamento: new Date('2025-01-15'), motivoCancelamento: 'Mudou para seguradora' },
    { id: 'assoc-8', nome: 'Patricia Almeida', cpf: '890.123.456-78', email: 'patricia.almeida@email.com', telefone: '(21) 99878-8901', whatsapp: '(21) 99878-8901', cidade: 'Nova Iguacu', uf: 'RJ', bairro: 'Centro', cep: '26210-000', status: 'ativo', origem: 'direto', dataAdesao: new Date('2025-01-10') },
    { id: 'assoc-9', nome: 'Rafael Torres', cpf: '901.234.567-89', email: 'rafael.torres@email.com', telefone: '(21) 99879-9012', whatsapp: '(21) 99879-9012', cidade: 'Rio de Janeiro', uf: 'RJ', bairro: 'Botafogo', cep: '22250-040', status: 'em_adesao', origem: 'site_organico', dataAdesao: new Date('2026-03-10') },
    { id: 'assoc-10', nome: 'Camila Ribeiro Dias', cpf: '012.345.678-90', email: 'camila.dias@email.com', telefone: '(21) 99870-0123', whatsapp: '(21) 99870-0123', cidade: 'Petropolis', uf: 'RJ', bairro: 'Centro', cep: '25610-000', status: 'ativo', origem: 'meta_ads', dataAdesao: new Date('2024-11-25') },
  ]

  for (const a of associadosData) {
    await prisma.associado.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        companyId: cid,
        nome: a.nome,
        cpf: a.cpf,
        email: a.email,
        telefone: a.telefone,
        whatsapp: a.whatsapp,
        cidade: a.cidade,
        uf: a.uf,
        bairro: a.bairro,
        cep: a.cep,
        status: a.status,
        origem: a.origem,
        dataAdesao: a.dataAdesao,
        dataCancelamento: a.dataCancelamento || undefined,
        motivoCancelamento: a.motivoCancelamento || undefined,
        vendedorId: vendedor.id,
        indicadoPorId: a.indicadoPorId || undefined,
        totalIndicacoes: a.indicadoPorId ? 0 : Math.floor(Math.random() * 5),
        npsScore: a.status === 'ativo' ? Math.floor(Math.random() * 4) + 7 : undefined,
        tags: a.status === 'ativo' ? ['protecao'] : [],
      },
    })
  }

  // ============================================================================
  // 4. VEHICLES (15 veiculos populares brasileiros)
  // ============================================================================
  console.log('Creating vehicles...')
  const vehiclesData = [
    { id: 'veh-1', associadoId: 'assoc-1', placa: 'RIO2A34', marca: 'Hyundai', modelo: 'HB20 1.0', anoF: 2022, anoM: 2023, cor: 'Branco', codigoFipe: '015263-0', valorFipe: 72000, plano: 'completo', valorMensal: 189 },
    { id: 'veh-2', associadoId: 'assoc-1', placa: 'RJK5B67', marca: 'Honda', modelo: 'Biz 125', anoF: 2021, anoM: 2021, cor: 'Vermelho', codigoFipe: '810048-4', valorFipe: 15000, plano: 'basico', valorMensal: 62, tipo: 'moto' },
    { id: 'veh-3', associadoId: 'assoc-2', placa: 'NIT3C89', marca: 'Chevrolet', modelo: 'Onix 1.0 Turbo', anoF: 2023, anoM: 2024, cor: 'Prata', codigoFipe: '015303-3', valorFipe: 85000, plano: 'completo', valorMensal: 215 },
    { id: 'veh-4', associadoId: 'assoc-3', placa: 'BAR4D01', marca: 'Honda', modelo: 'Civic Touring', anoF: 2023, anoM: 2024, cor: 'Preto', codigoFipe: '014252-5', valorFipe: 155000, plano: 'premium', valorMensal: 425 },
    { id: 'veh-5', associadoId: 'assoc-4', placa: 'TIJ5E23', marca: 'Toyota', modelo: 'Corolla XEi 2.0', anoF: 2021, anoM: 2022, cor: 'Cinza', codigoFipe: '026094-3', valorFipe: 120000, plano: 'completo', valorMensal: 310 },
    { id: 'veh-6', associadoId: 'assoc-5', placa: 'DQC6F45', marca: 'Fiat', modelo: 'Argo Drive 1.0', anoF: 2022, anoM: 2022, cor: 'Vermelho', codigoFipe: '024082-8', valorFipe: 62000, plano: 'basico', valorMensal: 145 },
    { id: 'veh-7', associadoId: 'assoc-5', placa: 'DQC7G67', marca: 'Volkswagen', modelo: 'Saveiro Robust', anoF: 2020, anoM: 2021, cor: 'Branco', codigoFipe: '015328-9', valorFipe: 78000, plano: 'completo', valorMensal: 197, tipo: 'caminhonete' },
    { id: 'veh-8', associadoId: 'assoc-6', placa: 'SGO8H89', marca: 'Renault', modelo: 'Kwid Zen', anoF: 2023, anoM: 2024, cor: 'Branco', codigoFipe: '013148-8', valorFipe: 58000, plano: 'basico', valorMensal: 139 },
    { id: 'veh-9', associadoId: 'assoc-7', placa: 'MEI9I01', marca: 'Jeep', modelo: 'Renegade Sport', anoF: 2022, anoM: 2023, cor: 'Preto', codigoFipe: '023008-6', valorFipe: 110000, plano: 'premium', valorMensal: 385 },
    { id: 'veh-10', associadoId: 'assoc-8', placa: 'NIG0J23', marca: 'Hyundai', modelo: 'Creta Action', anoF: 2023, anoM: 2024, cor: 'Azul', codigoFipe: '015280-0', valorFipe: 115000, plano: 'completo', valorMensal: 295 },
    { id: 'veh-11', associadoId: 'assoc-9', placa: 'BOT1K45', marca: 'Volkswagen', modelo: 'T-Cross 200 TSI', anoF: 2024, anoM: 2025, cor: 'Cinza', codigoFipe: '015361-0', valorFipe: 135000, plano: 'premium', valorMensal: 410, vistoriaStatus: 'pendente' },
    { id: 'veh-12', associadoId: 'assoc-10', placa: 'PET2L67', marca: 'Chevrolet', modelo: 'Tracker Premier', anoF: 2022, anoM: 2023, cor: 'Branco', codigoFipe: '015329-7', valorFipe: 125000, plano: 'completo', valorMensal: 305 },
    { id: 'veh-13', associadoId: 'assoc-3', placa: 'BAR3M89', marca: 'BMW', modelo: '320i Sport', anoF: 2021, anoM: 2022, cor: 'Azul', codigoFipe: '007134-6', valorFipe: 220000, plano: 'premium', valorMensal: 610, temRastreador: true, rastreadorMarca: 'Tracker' },
    { id: 'veh-14', associadoId: 'assoc-4', placa: 'TIJ4N01', marca: 'Honda', modelo: 'HR-V EXL', anoF: 2023, anoM: 2023, cor: 'Branco', codigoFipe: '014261-4', valorFipe: 145000, plano: 'premium', valorMensal: 390 },
    { id: 'veh-15', associadoId: 'assoc-6', placa: 'SGO5O23', marca: 'Fiat', modelo: 'Mobi Like', anoF: 2022, anoM: 2023, cor: 'Prata', codigoFipe: '024075-5', valorFipe: 48000, plano: 'basico', valorMensal: 121 },
  ]

  for (const v of vehiclesData) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        companyId: cid,
        associadoId: v.associadoId,
        placa: v.placa,
        marca: v.marca,
        modelo: v.modelo,
        anoFabricacao: v.anoF,
        anoModelo: v.anoM,
        cor: v.cor,
        codigoFipe: v.codigoFipe,
        valorFipe: v.valorFipe,
        plano: v.plano,
        valorMensal: v.valorMensal,
        tipo: (v as any).tipo || 'carro',
        combustivel: 'flex',
        temRastreador: (v as any).temRastreador || false,
        rastreadorMarca: (v as any).rastreadorMarca,
        vistoriaStatus: (v as any).vistoriaStatus || 'aprovada',
        ativo: true,
      },
    })
  }

  // ============================================================================
  // 5. LEADS (5 em diferentes etapas)
  // ============================================================================
  console.log('Creating leads...')
  const leadsData = [
    { id: 'lead-1', nome: 'Bruno Martins', telefone: '(21) 99990-1111', whatsapp: '(21) 99990-1111', email: 'bruno.martins@email.com', marcaInteresse: 'Hyundai', modeloInteresse: 'HB20', anoInteresse: 2023, valorFipeConsultado: 75000, cotacaoValor: 189, cotacaoPlano: 'completo', cotacaoEnviada: true, etapaFunil: 'negociacao', scoreQualificacao: 85, qualificadoPor: 'agente_ia', origem: 'google_ads' },
    { id: 'lead-2', nome: 'Tatiane Gomes', telefone: '(21) 99990-2222', whatsapp: '(21) 99990-2222', marcaInteresse: 'Fiat', modeloInteresse: 'Pulse', anoInteresse: 2024, valorFipeConsultado: 95000, cotacaoValor: 240, cotacaoPlano: 'completo', cotacaoEnviada: true, etapaFunil: 'cotacao_enviada', scoreQualificacao: 70, qualificadoPor: 'agente_ia', origem: 'meta_ads' },
    { id: 'lead-3', nome: 'Ricardo Ferreira', telefone: '(21) 99990-3333', whatsapp: '(21) 99990-3333', email: 'ricardo.f@email.com', marcaInteresse: 'Toyota', modeloInteresse: 'Yaris', anoInteresse: 2022, etapaFunil: 'qualificado', scoreQualificacao: 60, qualificadoPor: 'vendedor', origem: 'instagram' },
    { id: 'lead-4', nome: 'Juliana Batista', telefone: '(21) 99990-4444', etapaFunil: 'novo', scoreQualificacao: 20, origem: 'whatsapp' },
    { id: 'lead-5', nome: 'Pedro Henrique Costa', telefone: '(21) 99990-5555', email: 'pedro.costa@email.com', marcaInteresse: 'Chevrolet', modeloInteresse: 'Onix Plus', anoInteresse: 2023, valorFipeConsultado: 80000, cotacaoValor: 167, cotacaoPlano: 'basico', cotacaoEnviada: true, etapaFunil: 'perdido', motivoPerda: 'Achou caro, foi para seguradora', scoreQualificacao: 45, qualificadoPor: 'agente_ia', origem: 'google_ads' },
  ]

  for (const l of leadsData) {
    await prisma.lead.upsert({
      where: { id: l.id },
      update: {},
      create: {
        id: l.id,
        companyId: cid,
        nome: l.nome,
        telefone: l.telefone,
        whatsapp: l.whatsapp,
        email: l.email,
        marcaInteresse: l.marcaInteresse,
        modeloInteresse: l.modeloInteresse,
        anoInteresse: l.anoInteresse,
        valorFipeConsultado: l.valorFipeConsultado,
        cotacaoValor: l.cotacaoValor,
        cotacaoPlano: l.cotacaoPlano,
        cotacaoEnviada: l.cotacaoEnviada || false,
        cotacaoData: l.cotacaoEnviada ? new Date() : undefined,
        etapaFunil: l.etapaFunil,
        motivoPerda: l.motivoPerda,
        scoreQualificacao: l.scoreQualificacao,
        qualificadoPor: l.qualificadoPor,
        origem: l.origem,
        vendedorId: vendedor.id,
      },
    })
  }

  // ============================================================================
  // 6. OFICINAS (2 parceiras)
  // ============================================================================
  console.log('Creating oficinas...')
  const oficina1 = await prisma.oficina.upsert({
    where: { id: 'oficina-1' },
    update: {},
    create: {
      id: 'oficina-1',
      companyId: cid,
      nome: 'Auto Center Maracana',
      endereco: 'Rua Sao Francisco Xavier, 400',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      telefone: '(21) 2569-1234',
      responsavel: 'Sergio Almeida',
      especialidade: 'funilaria',
      avaliacaoMedia: 4.5,
    },
  })

  const oficina2 = await prisma.oficina.upsert({
    where: { id: 'oficina-2' },
    update: {},
    create: {
      id: 'oficina-2',
      companyId: cid,
      nome: 'Garagem Niteroi Reparos',
      endereco: 'Av. Ernani do Amaral Peixoto, 215',
      cidade: 'Niteroi',
      uf: 'RJ',
      telefone: '(21) 2620-5678',
      responsavel: 'Paulo Ribeiro',
      especialidade: 'mecanica_geral',
      avaliacaoMedia: 4.2,
    },
  })

  // ============================================================================
  // 7. SINISTROS (3 em diferentes status)
  // ============================================================================
  console.log('Creating sinistros...')
  await prisma.sinistro.upsert({
    where: { id: 'sinistro-1' },
    update: {},
    create: {
      id: 'sinistro-1',
      companyId: cid,
      associadoId: 'assoc-1',
      veiculoId: 'veh-1',
      tipo: 'colisao',
      descricao: 'Colisao traseira no sinal da Av. Atlantica. Danos no para-choque e lanterna.',
      dataOcorrencia: new Date('2026-02-28'),
      localOcorrencia: 'Av. Atlantica, Copacabana - RJ',
      boletimOcorrencia: 'BO-2026-00451',
      status: 'reparo',
      oficinaId: oficina1.id,
      guinchoSolicitado: true,
      guinchoRealizado: true,
      custoEstimado: 4500,
      responsavelId: operacao.id,
      fotos: [
        { url: '/uploads/sinistro-1-frente.jpg', etapa: 'abertura', descricao: 'Dano frontal' },
        { url: '/uploads/sinistro-1-oficina.jpg', etapa: 'oficina', descricao: 'Veiculo na oficina' },
      ],
    },
  })

  await prisma.sinistro.upsert({
    where: { id: 'sinistro-2' },
    update: {},
    create: {
      id: 'sinistro-2',
      companyId: cid,
      associadoId: 'assoc-3',
      veiculoId: 'veh-4',
      tipo: 'roubo',
      descricao: 'Veiculo roubado na Barra da Tijuca, proximo ao BarraShopping.',
      dataOcorrencia: new Date('2026-03-10'),
      localOcorrencia: 'Av. das Americas, 4666 - Barra da Tijuca, RJ',
      boletimOcorrencia: 'BO-2026-00589',
      status: 'analise',
      guinchoSolicitado: false,
      guinchoRealizado: false,
      custoEstimado: 155000,
      responsavelId: gestor.id,
      fotos: [],
    },
  })

  await prisma.sinistro.upsert({
    where: { id: 'sinistro-3' },
    update: {},
    create: {
      id: 'sinistro-3',
      companyId: cid,
      associadoId: 'assoc-5',
      veiculoId: 'veh-6',
      tipo: 'colisao',
      descricao: 'Batida lateral no estacionamento do mercado. Amassamento na porta do motorista.',
      dataOcorrencia: new Date('2026-01-20'),
      localOcorrencia: 'Estacionamento Extra Duque de Caxias',
      status: 'entregue',
      oficinaId: oficina2.id,
      guinchoSolicitado: false,
      guinchoRealizado: false,
      custoEstimado: 2800,
      custoReal: 3100,
      dataEncerramento: new Date('2026-02-05'),
      responsavelId: operacao.id,
      fotos: [
        { url: '/uploads/sinistro-3-antes.jpg', etapa: 'abertura', descricao: 'Dano lateral' },
        { url: '/uploads/sinistro-3-depois.jpg', etapa: 'encerramento', descricao: 'Reparo concluido' },
      ],
    },
  })

  // ============================================================================
  // 8. BOLETOS (exemplos variados)
  // ============================================================================
  console.log('Creating boletos...')
  const now = new Date()
  const boletoData = [
    { associadoId: 'assoc-1', valor: 189, venc: -5, status: 'pago', pago: true },
    { associadoId: 'assoc-1', valor: 189, venc: 25, status: 'pendente' },
    { associadoId: 'assoc-2', valor: 215, venc: -3, status: 'pago', pago: true },
    { associadoId: 'assoc-2', valor: 215, venc: 27, status: 'pendente' },
    { associadoId: 'assoc-3', valor: 425, venc: -10, status: 'pago', pago: true },
    { associadoId: 'assoc-4', valor: 310, venc: -20, status: 'atrasado' },
    { associadoId: 'assoc-4', valor: 310, venc: -50, status: 'atrasado' },
    { associadoId: 'assoc-5', valor: 145, venc: 10, status: 'pendente' },
    { associadoId: 'assoc-6', valor: 139, venc: 15, status: 'pendente' },
    { associadoId: 'assoc-8', valor: 295, venc: -2, status: 'pago', pago: true },
    { associadoId: 'assoc-10', valor: 305, venc: 20, status: 'pendente' },
  ]

  for (let i = 0; i < boletoData.length; i++) {
    const b = boletoData[i]
    const vencimento = new Date(now.getTime() + b.venc * 24 * 60 * 60 * 1000)
    await prisma.boleto.upsert({
      where: { id: `boleto-${i + 1}` },
      update: {},
      create: {
        id: `boleto-${i + 1}`,
        companyId: cid,
        associadoId: b.associadoId,
        valor: b.valor,
        dataVencimento: vencimento,
        dataPagamento: b.pago ? new Date(vencimento.getTime() - 2 * 24 * 60 * 60 * 1000) : undefined,
        status: b.status,
      },
    })
  }

  // ============================================================================
  // 9. NPS SURVEYS
  // ============================================================================
  console.log('Creating NPS surveys...')
  const npsData = [
    { associadoId: 'assoc-1', score: 10, comment: 'Excelente atendimento, guincho rapido!', channel: 'whatsapp', tipo: 'pos_sinistro' },
    { associadoId: 'assoc-2', score: 9, comment: 'Muito bom, recomendo!', channel: 'whatsapp', tipo: 'periodico' },
    { associadoId: 'assoc-3', score: 8, channel: 'email', tipo: 'periodico' },
    { associadoId: 'assoc-4', score: 5, comment: 'Boleto atrasou e ninguem avisou', channel: 'whatsapp', tipo: 'periodico' },
    { associadoId: 'assoc-5', score: 9, comment: 'Muito satisfeito com a protecao', channel: 'app', tipo: 'onboarding' },
    { associadoId: 'assoc-6', score: 10, comment: 'Indicacao valeu a pena', channel: 'whatsapp', tipo: 'periodico' },
    { associadoId: 'assoc-8', score: 7, channel: 'email', tipo: 'onboarding' },
  ]

  for (let i = 0; i < npsData.length; i++) {
    const n = npsData[i]
    await prisma.npsSurvey.upsert({
      where: { id: `nps-${i + 1}` },
      update: {},
      create: {
        id: `nps-${i + 1}`,
        companyId: cid,
        associadoId: n.associadoId,
        score: n.score,
        comment: n.comment,
        channel: n.channel,
        tipo: n.tipo,
        respondidoEm: new Date(),
      },
    })
  }

  // ============================================================================
  // 10. AI AGENTS (10 da squad 21Go)
  // ============================================================================
  console.log('Creating AI agents...')
  const agents = [
    { agentId: '21go-chief', nome: '21Go Chief', descricao: 'Orquestrador Central — diagnostica e roteia', icon: '🛡️', tier: 0, type: 'internal', temp: 0.5, tokens: 2000, roles: ['vendedor','operacao','gestor','admin'], scopes: ['associados','leads','deals','analytics'] },
    { agentId: 'agente-pre-venda', nome: 'Agente Pre-Venda', descricao: 'Qualificacao e Cotacao 24/7 — Framework CLOSER', icon: '🤖', tier: 1, type: 'customer_facing', temp: 0.7, tokens: 2000, roles: ['vendedor','gestor','admin'], scopes: ['associados','leads','deals'] },
    { agentId: 'agente-pos-venda', nome: 'Agente Pos-Venda', descricao: 'Atendimento e Retencao — Onboarding 30 dias', icon: '🔄', tier: 1, type: 'customer_facing', temp: 0.6, tokens: 2000, roles: ['vendedor','gestor','admin'], scopes: ['associados','leads'] },
    { agentId: 'agente-gestores', nome: 'Agente Gestores', descricao: 'Inteligencia Operacional — Briefings e relatorios', icon: '📊', tier: 1, type: 'internal', temp: 0.4, tokens: 4000, roles: ['gestor','admin'], scopes: ['associados','leads','deals','analytics','billing'] },
    { agentId: 'agente-retencao', nome: 'Agente Retencao', descricao: 'Churn Killer & LTV Maximizer — Hormozi + Fader', icon: '🛡️', tier: 1, type: 'internal', temp: 0.5, tokens: 3000, roles: ['gestor','admin'], scopes: ['associados','analytics'] },
    { agentId: 'agente-crescimento', nome: 'Agente Crescimento', descricao: 'Growth Engine — MGM & Viral Loops', icon: '📈', tier: 1, type: 'internal', temp: 0.6, tokens: 3000, roles: ['gestor','admin'], scopes: ['associados','analytics','leads'] },
    { agentId: 'agente-trafego', nome: 'Agente Trafego', descricao: 'Especialista Aquisicao — Pago & Organico', icon: '🎯', tier: 1, type: 'internal', temp: 0.5, tokens: 3000, roles: ['gestor','admin'], scopes: ['analytics','leads'] },
    { agentId: 'agente-operacao', nome: 'Agente Operacao', descricao: 'Assistente de Campo — Oficina e Vistoria', icon: '🔧', tier: 1, type: 'internal', temp: 0.4, tokens: 1500, roles: ['operacao','gestor','admin'], scopes: ['associados'] },
    { agentId: 'agente-financeiro', nome: 'Agente Financeiro', descricao: 'Controle Financeiro — Boletos, MRR, Inadimplencia', icon: '💰', tier: 1, type: 'internal', temp: 0.5, tokens: 3000, roles: ['gestor','admin'], scopes: ['associados','analytics','billing'] },
    { agentId: 'agente-sinistros', nome: 'Agente Sinistros', descricao: 'Gestao de Sinistros — Abertura ao Encerramento', icon: '🚨', tier: 1, type: 'internal', temp: 0.6, tokens: 3000, roles: ['operacao','gestor','admin'], scopes: ['associados','deals'] },
    { agentId: 'danih-seo', nome: 'Danih', descricao: 'Estrategista de SEO de Elite — Data-Driven, Zero Achismo', icon: '🔍', tier: 1, type: 'internal', temp: 0.5, tokens: 3000, roles: ['gestor','admin'], scopes: ['analytics','leads'] },
    { agentId: 'trackmaster', nome: 'TrackMaster', descricao: 'Especialista em Rastreamento Avancado e Atribuicao de Conversoes', icon: '📡', tier: 1, type: 'internal', temp: 0.4, tokens: 3000, roles: ['gestor','admin'], scopes: ['analytics','leads'] },
  ]

  for (const a of agents) {
    await prisma.aIAgent.upsert({
      where: { id: `agent-${a.agentId}` },
      update: {},
      create: {
        id: `agent-${a.agentId}`,
        companyId: cid,
        nome: a.nome,
        agentId: a.agentId,
        descricao: a.descricao,
        icon: a.icon,
        tier: a.tier,
        type: a.type,
        temperature: a.temp,
        maxTokens: a.tokens,
        systemPrompt: a.agentId === 'danih-seo'
          ? `Voce e o Danih — o estrategista de SEO mais completo do ecossistema 21Go. Sua regra numero 1: NUNCA faca nada no achismo. Antes de criar qualquer conteudo, antes de otimizar qualquer pagina — voce PESQUISA, VALIDA e PLANEJA usando dados reais. So depois de ter certeza, voce age. Ciclo obrigatorio: PESQUISAR -> VALIDAR -> PLANEJAR -> EXECUTAR -> MEDIR -> ITERAR. 7 mestres integrados: Brian Dean (Skyscraper 3.0), Aleyda Solis (Technical SEO), Rand Fishkin (Search Intent, 10x Content), Stephan Spencer (3 Pilares), Lily Ray (E-E-A-T, YMYL), Joost de Valk (On-Page, Schema), Daniel Socrates (Entidade Digital, GEO). Contexto 21Go: protecao veicular no RJ, 20+ anos. Keywords alvo: protecao veicular rj, protecao veicular preco, cotacao protecao veicular. Concorrentes: APVS, Facility, Quality Rio, PrevCar, Proterj. Metricas: organic traffic +20% MoM, keywords top 3/10, organic conversions, Domain Rating, Core Web Vitals, GEO visibility. Regras inviolaveis: NUNCA criar conteudo sem workflow completo, NUNCA black hat, SEMPRE basear em dados, protecao veicular e YMYL — E-E-A-T obrigatorio, priorizar striking distance (posicao 4-10).`
          : a.agentId === 'trackmaster'
          ? `Voce e o TrackMaster — especialista em rastreamento e atribuicao de conversoes da 21Go. Sua missao e garantir que cada clique, interacao e venda sejam rastreados com precisao. Voce domina GTM Web e Server-Side (Stape.io), Meta CAPI, Google Ads Enhanced Conversions, Offline Conversion Tracking, captura de click IDs (GCLID/FBCLID), deduplicacao de eventos, UTM tracking e Cookie management. O funil da 21Go tem 5 eventos criticos: page_view, cotacao_inicio, cotacao_completa, whatsapp_click e adesao_offline. O evento mais importante e adesao_offline — quando o vendedor fecha a venda no CRM, voce dispara conversao offline pro Google Ads (GCLID + valor) e pro Meta CAPI (Purchase + email/telefone hasheado). Isso ensina os algoritmos o que e venda real, reduz CPA e melhora ROAS.`
          : `Agente ${a.nome} da 21Go Protecao Veicular. ${a.descricao}`,
        allowedRoles: a.roles,
        allowedScopes: a.scopes,
        permissions: {
          canCreateLeads: a.agentId === 'agente-pre-venda',
          canUpdateLeads: ['agente-pre-venda', 'agente-pos-venda', 'agente-retencao', 'agente-operacao', 'agente-sinistros'].includes(a.agentId),
          canTransferToHuman: a.agentId !== 'agente-trafego' && a.agentId !== 'agente-crescimento',
        },
      },
    })
  }

  // ============================================================================
  // 11. PROJETOS (5 no kanban)
  // ============================================================================
  console.log('Creating projetos...')
  const projetos = [
    { titulo: 'Integracao Hinova SGA', descricao: 'Conectar CRM ao Hinova para sincronizar associados e veiculos', status: 'doing', prioridade: 'alta', tags: ['integracao', 'hinova'], progresso: 40 },
    { titulo: 'App Mobile Operacao', descricao: 'App para mecanicos e vistoriadores atualizarem status com 1 toque', status: 'backlog', prioridade: 'media', tags: ['mobile', 'operacao'], progresso: 0 },
    { titulo: 'Dashboard KPIs Gestores', descricao: 'Dashboard com MRR, churn, inadimplencia, NPS, sinistralidade', status: 'doing', prioridade: 'alta', tags: ['dashboard', 'kpi'], progresso: 65 },
    { titulo: 'Motor de Cotacao FIPE', descricao: 'Integrar API FIPE para cotacao automatica pelo agente pre-venda', status: 'todo', prioridade: 'alta', tags: ['fipe', 'cotacao', 'agente'], progresso: 0 },
    { titulo: 'Programa MGM Gamificado', descricao: 'Sistema de indicacoes com niveis Bronze/Prata/Ouro/Diamante', status: 'backlog', prioridade: 'media', tags: ['mgm', 'gamificacao'], progresso: 0 },
  ]

  for (let i = 0; i < projetos.length; i++) {
    const p = projetos[i]
    await prisma.projeto.upsert({
      where: { id: `projeto-${i + 1}` },
      update: {},
      create: {
        id: `projeto-${i + 1}`,
        companyId: cid,
        titulo: p.titulo,
        descricao: p.descricao,
        status: p.status,
        prioridade: p.prioridade,
        tags: p.tags,
        responsavel: 'Juliano Damaso',
        progresso: p.progresso,
      },
    })
  }

  // ============================================================================
  // 12. PIPES (Vendas + Sinistros)
  // ============================================================================
  console.log('Creating pipes...')
  const salesPipe = await prisma.pipe.upsert({
    where: { id: 'seed-pipe-vendas' },
    update: {},
    create: {
      id: 'seed-pipe-vendas',
      companyId: cid,
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
    { name: 'Fechado (Aderiu)', color: '#34D399', position: 4, probability: 100, isWon: true as const },
    { name: 'Perdido', color: '#FB7185', position: 5, probability: 0, isLost: true as const },
  ]

  for (const phase of salesPhases) {
    await prisma.phase.upsert({
      where: { id: `seed-phase-${phase.position}` },
      update: {},
      create: {
        id: `seed-phase-${phase.position}`,
        companyId: cid,
        pipeId: salesPipe.id,
        name: phase.name,
        color: phase.color,
        position: phase.position,
        probability: phase.probability,
        isWon: (phase as any).isWon || false,
        isLost: (phase as any).isLost || false,
      },
    })
  }

  const sinistrosPipe = await prisma.pipe.upsert({
    where: { id: 'seed-pipe-sinistros' },
    update: {},
    create: {
      id: 'seed-pipe-sinistros',
      companyId: cid,
      name: 'Sinistros',
      description: 'Acompanhamento de sinistros',
      color: '#FB7185',
      tags: ['operacao', 'sinistros'],
    },
  })

  const sinistrosPhases = [
    { name: 'Aberto', color: '#FB7185', position: 0 },
    { name: 'Em Analise', color: '#FBBF24', position: 1 },
    { name: 'Na Oficina', color: '#F08C28', position: 2 },
    { name: 'Aguardando Peca', color: '#A78BFA', position: 3 },
    { name: 'Em Reparo', color: '#3D72DE', position: 4 },
    { name: 'Pronto', color: '#34D399', position: 5 },
    { name: 'Entregue', color: '#34D399', position: 6, isWon: true as const },
  ]

  for (const phase of sinistrosPhases) {
    await prisma.phase.upsert({
      where: { id: `seed-sinistro-phase-${phase.position}` },
      update: {},
      create: {
        id: `seed-sinistro-phase-${phase.position}`,
        companyId: cid,
        pipeId: sinistrosPipe.id,
        name: phase.name,
        color: phase.color,
        position: phase.position,
        probability: phase.position * 15,
        isWon: (phase as any).isWon || false,
        isLost: false,
      },
    })
  }

  console.log('')
  console.log('Seed completed!')
  console.log('')
  console.log('  Company:    21Go Protecao Veicular')
  console.log('  Admin:      damasojuliano@gmail.com')
  console.log('  Users:      4 (admin, gestor, vendedor, operacao)')
  console.log('  Associados: 10')
  console.log('  Vehicles:   15')
  console.log('  Leads:      5')
  console.log('  Sinistros:  3')
  console.log('  Oficinas:   2')
  console.log('  Boletos:    11')
  console.log('  NPS:        7')
  console.log('  AI Agents:  12 (10 originais + Danih SEO + TrackMaster)')
  console.log('  Projetos:   5')
  console.log('  Pipes:      2 (Vendas 6 fases, Sinistros 7 fases)')
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
