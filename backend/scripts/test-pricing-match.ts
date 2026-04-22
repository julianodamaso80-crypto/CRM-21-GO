/**
 * Teste de paridade: PDF deve devolver EXATAMENTE o mesmo plano/valor que o site.
 *
 * Roda: npx tsx scripts/test-pricing-match.ts
 *
 * Cenários cobertos:
 *  1. BYD Dolphin Mini (elétrico, FIPE 119.560) — site mostra ESPECIAL R$ 606,75
 *     Bug histórico: PDF caía em BASICO R$ 418,48 porque o Lead não guarda combustivel.
 *     Esperado: detectPlanByValue identifica ESPECIAL pelo valor 606,75 ⇒ PDF correto.
 *
 *  2. Carro normal (Onix, FIPE 65.000) — site mostra VIP R$ 314,99
 *     Esperado: PDF retorna 4 planos do segmento Carro (Básico/Do Seu Jeito/VIP/Premium).
 *
 *  3. SUV (Compass, FIPE 95.000) — site mostra SUV R$ 472,90
 *     Esperado: PDF retorna 1 plano SUV.
 *
 *  4. Moto 400cc (CB300, FIPE 18.000) — site mostra MOTO_400 R$ 186,84
 *     Esperado: PDF retorna planos de moto.
 *
 *  5. Carro de luxo (FIPE 200k) — automaticamente vira ESPECIAL (FIPE > 150k)
 *     Esperado: PDF retorna ESPECIAL R$ 1.110,00.
 */

import { resolvePlans, detectPlanByValue, type QuotePdfInput } from '../src/modules/plate-lookup/pdf-quote.service'
import { planIdFromName } from '../src/modules/plate-lookup/plan-features'
import { findPrice, PRICING_TABLES, formatPrice } from '../src/modules/plate-lookup/pricing'

interface TestCase {
  name: string
  input: QuotePdfInput
  expectedPlanId: string
  expectedMonthly: number
  expectedPlansCount?: number
}

// Constrói os casos de teste cruzando PRICING_TABLES (fonte de verdade)
const BYD_FIPE = 119560
const BYD_PRICE = findPrice(PRICING_TABLES.especial, BYD_FIPE)!
const ONIX_FIPE = 65000
const ONIX_PRICE = findPrice(PRICING_TABLES.vip, ONIX_FIPE)!
const SUV_FIPE = 95000
const SUV_PRICE = findPrice(PRICING_TABLES.suv, SUV_FIPE)!
const MOTO_FIPE = 18000
const MOTO_PRICE = findPrice(PRICING_TABLES['moto-400'], MOTO_FIPE)!
const LUXO_FIPE = 200000
const LUXO_PRICE = findPrice(PRICING_TABLES.especial, LUXO_FIPE)!

const cases: TestCase[] = [
  {
    name: 'BYD Dolphin Mini (elétrico, sem combustivel no input — bug histórico)',
    input: {
      nome: 'Cliente Teste',
      whatsapp: '21999999999',
      marca: 'BYD',
      modelo: 'DOLPHIN MINI GS',
      ano: 2024,
      fipe: BYD_FIPE,
      planoNome: 'Veículos Especiais',
      mensalidade: BYD_PRICE,
      // INTENCIONALMENTE NÃO PASSA combustivel/categoria — replica o cenário do Lead
    },
    expectedPlanId: 'especial',
    expectedMonthly: BYD_PRICE,
    expectedPlansCount: 1,
  },
  {
    name: 'Carro normal (Onix VIP)',
    input: {
      nome: 'Cliente',
      whatsapp: '21999999999',
      marca: 'CHEVROLET',
      modelo: 'ONIX',
      ano: 2022,
      fipe: ONIX_FIPE,
      planoNome: 'VIP',
      mensalidade: ONIX_PRICE,
    },
    expectedPlanId: 'vip',
    expectedMonthly: ONIX_PRICE,
    expectedPlansCount: 4, // basico, do-seu-jeito, vip, premium
  },
  {
    name: 'SUV (Compass)',
    input: {
      nome: 'Cliente',
      whatsapp: '21999999999',
      marca: 'JEEP',
      modelo: 'COMPASS',
      ano: 2023,
      fipe: SUV_FIPE,
      planoNome: 'SUV',
      mensalidade: SUV_PRICE,
    },
    expectedPlanId: 'suv',
    expectedMonthly: SUV_PRICE,
    expectedPlansCount: 1,
  },
  {
    name: 'Moto 400cc (CB300)',
    input: {
      nome: 'Cliente',
      whatsapp: '21999999999',
      marca: 'HONDA',
      modelo: 'CB 300',
      ano: 2022,
      fipe: MOTO_FIPE,
      planoNome: 'VIP Moto até 400cc',
      mensalidade: MOTO_PRICE,
    },
    expectedPlanId: 'moto-400',
    expectedMonthly: MOTO_PRICE,
  },
  {
    name: 'Carro de luxo (FIPE > 150k → automaticamente Especial)',
    input: {
      nome: 'Cliente',
      whatsapp: '21999999999',
      marca: 'BMW',
      modelo: 'X5',
      ano: 2023,
      fipe: LUXO_FIPE,
      planoNome: 'Veículos Especiais',
      mensalidade: LUXO_PRICE,
    },
    expectedPlanId: 'especial',
    expectedMonthly: LUXO_PRICE,
    expectedPlansCount: 1,
  },
]

let pass = 0
let fail = 0
const failures: string[] = []

console.log('\n═══════════════════════════════════════════════════════════════════')
console.log('  TESTE DE PARIDADE: PDF == SITE (preço idêntico)')
console.log('═══════════════════════════════════════════════════════════════════\n')

for (const tc of cases) {
  console.log(`▶ ${tc.name}`)
  console.log(`  FIPE R$ ${tc.input.fipe.toLocaleString('pt-BR')} · plano "${tc.input.planoNome}" · mensalidade R$ ${formatPrice(tc.input.mensalidade)}`)

  const plans = resolvePlans(tc.input)

  // Reproduz a lógica do generateQuotePdf p/ identificar qual será o card SELECIONADO
  const planoEscolhidoId =
    detectPlanByValue(tc.input.fipe, tc.input.mensalidade) || planIdFromName(tc.input.planoNome)
  const selectedPlan = plans.find(p => p.id === planoEscolhidoId)

  if (!selectedPlan) {
    fail++
    const msg = `  ❌ FAIL: planoEscolhidoId="${planoEscolhidoId}" não encontrado em plans=[${plans.map(p => p.id).join(',')}]`
    console.log(msg)
    failures.push(`${tc.name}: ${msg}`)
    continue
  }

  const idMatch = selectedPlan.id === tc.expectedPlanId
  const priceMatch = Math.abs(selectedPlan.monthly - tc.expectedMonthly) < 0.01
  const countMatch = tc.expectedPlansCount === undefined || plans.length === tc.expectedPlansCount

  if (idMatch && priceMatch && countMatch) {
    pass++
    console.log(`  ✅ PASS: SELECIONADO planId=${selectedPlan.id} · monthly=R$ ${formatPrice(selectedPlan.monthly)} · ${plans.length} plano(s) no PDF [${plans.map(p => `${p.id}=${formatPrice(p.monthly)}`).join(', ')}]`)
  } else {
    fail++
    const msgs: string[] = []
    if (!idMatch) msgs.push(`planId esperado="${tc.expectedPlanId}" recebido="${selectedPlan.id}"`)
    if (!priceMatch) msgs.push(`mensalidade esperada=R$ ${formatPrice(tc.expectedMonthly)} recebida=R$ ${formatPrice(selectedPlan.monthly)}`)
    if (!countMatch) msgs.push(`qtd planos esperada=${tc.expectedPlansCount} recebida=${plans.length}`)
    const msg = `  ❌ FAIL: ${msgs.join(' | ')}`
    console.log(msg)
    failures.push(`${tc.name}: ${msg}`)
  }
  console.log('')
}

console.log('═══════════════════════════════════════════════════════════════════')
console.log(`  RESULTADO: ${pass} passed · ${fail} failed (${cases.length} total)`)
console.log('═══════════════════════════════════════════════════════════════════\n')

if (fail > 0) {
  console.log('FALHAS:')
  failures.forEach(f => console.log(`  • ${f}`))
  console.log('')
  process.exit(1)
}

console.log('✓ Todos os testes passaram. PDF baterá com o site.\n')
process.exit(0)
