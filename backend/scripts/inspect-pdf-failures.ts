/**
 * Script de DIAGNÓSTICO — só leitura.
 * Investiga por que clientes não estão recebendo PDF.
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET = '32999904031'
const TARGET_LAST = '999904031'

async function main() {
  console.log('\nDB:', process.env.DATABASE_URL?.replace(/:[^@]+@/, ':***@'))

  // Conta total de leads no banco (descobrir se é o banco certo)
  const totalLeads = await prisma.lead.count()
  console.log(`\nTotal de leads no banco: ${totalLeads}`)

  // Últimos 10 leads, qualquer status
  const last10 = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true, nome: true, whatsapp: true, telefone: true,
      placaInteresse: true, marcaInteresse: true,
      qualificadoPor: true, etapaFunil: true,
      followUpEnviado: true, pdfEnviado: true,
      cotacaoEnviada: true,
      createdAt: true,
    },
  })
  console.log(`\n=== ÚLTIMOS 10 LEADS (qualquer origem) ===`)
  for (const l of last10) {
    console.log(`${l.createdAt.toISOString()} | ${l.id} | ${l.nome} | ws=${l.whatsapp} tel=${l.telefone} | qual=${l.qualificadoPor} etapa=${l.etapaFunil} | cot=${l.cotacaoEnviada} fu=${l.followUpEnviado} pdf=${l.pdfEnviado}`)
  }

  // Procura pelo número alvo em qualquer formato
  console.log(`\n=== BUSCA PELO NÚMERO ${TARGET} ===`)
  const matches = await prisma.lead.findMany({
    where: {
      OR: [
        { whatsapp: { contains: TARGET_LAST } },
        { telefone: { contains: TARGET_LAST } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  })
  console.log(`Matches: ${matches.length}`)
  for (const l of matches) {
    console.log(JSON.stringify({
      id: l.id, nome: l.nome,
      whatsapp: l.whatsapp, telefone: l.telefone,
      marca: l.marcaInteresse, modelo: l.modeloInteresse,
      ano: l.anoInteresse, fipe: l.valorFipeConsultado,
      plano: l.cotacaoPlano, valor: l.cotacaoValor,
      etapa: l.etapaFunil, qual: l.qualificadoPor,
      cotacaoEnviada: l.cotacaoEnviada,
      followUpEnviado: l.followUpEnviado, followUpData: l.followUpData?.toISOString(),
      pdfEnviado: l.pdfEnviado, pdfEnviadoEm: l.pdfEnviadoEm?.toISOString(),
      pdfUrl: l.pdfUrl?.slice(0, 60),
      createdAt: l.createdAt.toISOString(),
    }, null, 2))
  }

  // Padrão últimas 48h — qualquer origem
  console.log(`\n=== ÚLTIMAS 48h (qualquer origem) ===`)
  const since48h = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const recent = await prisma.lead.findMany({
    where: { createdAt: { gte: since48h } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, nome: true, whatsapp: true,
      placaInteresse: true, marcaInteresse: true, valorFipeConsultado: true, cotacaoValor: true,
      qualificadoPor: true, etapaFunil: true,
      followUpEnviado: true, pdfEnviado: true, pdfUrl: true,
      createdAt: true,
    },
  })
  console.log(`Total: ${recent.length}`)
  const semPdf = recent.filter(l => !l.pdfEnviado)
  console.log(`Sem pdfEnviado: ${semPdf.length}`)
  for (const l of semPdf) {
    const missing: string[] = []
    if (!l.marcaInteresse) missing.push('marca')
    if (!l.valorFipeConsultado) missing.push('fipe')
    if (!l.cotacaoValor) missing.push('valor')
    console.log(`  ${l.createdAt.toISOString()} | ${l.nome} ws=${l.whatsapp} placa=${l.placaInteresse} qual=${l.qualificadoPor} etapa=${l.etapaFunil} fu=${l.followUpEnviado} — falta: ${missing.join(',') || 'NADA'}`)
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
