import { resolvePlans } from '../src/modules/plate-lookup/pdf-quote.service'

// Mesma simulação que o usuário fez (Compass SUV, FIPE 122456)
const semApp = resolvePlans({
  nome: 'Test', whatsapp: '21999', marca: 'JEEP', modelo: 'COMPASS', ano: 2022,
  fipe: 122456, planoNome: 'SUV', mensalidade: 537,
  carroApp: false,
})
const comApp = resolvePlans({
  nome: 'Test', whatsapp: '21999', marca: 'JEEP', modelo: 'COMPASS', ano: 2022,
  fipe: 122456, planoNome: 'SUV', mensalidade: 537,
  carroApp: true,
})

const semAppMonthly = semApp.find((p) => p.id === 'suv')?.monthly
const comAppMonthly = comApp.find((p) => p.id === 'suv')?.monthly
console.log(`SUV sem carroApp: R$ ${semAppMonthly}`)
console.log(`SUV com carroApp: R$ ${comAppMonthly}`)
console.log(`Diferença: R$ ${(comAppMonthly! - semAppMonthly!).toFixed(2)} (esperado: 20.00)`)

if (Math.abs(comAppMonthly! - semAppMonthly! - 20) < 0.01) {
  console.log('✅ PASS: extra de R$ 20 aplicado corretamente em SUV')
} else {
  console.log('❌ FAIL: extra não aplicado')
  process.exit(1)
}

// Carro normal: 4 planos, todos devem ter +20
const carroComApp = resolvePlans({
  nome: 'Test', whatsapp: '21999', marca: 'CHEVROLET', modelo: 'ONIX', ano: 2022,
  fipe: 65000, planoNome: 'VIP', mensalidade: 314.99,
  carroApp: true,
})
const carroSemApp = resolvePlans({
  nome: 'Test', whatsapp: '21999', marca: 'CHEVROLET', modelo: 'ONIX', ano: 2022,
  fipe: 65000, planoNome: 'VIP', mensalidade: 314.99,
  carroApp: false,
})
let allOk = true
for (const planSem of carroSemApp) {
  const planCom = carroComApp.find((p) => p.id === planSem.id)
  const diff = (planCom?.monthly || 0) - planSem.monthly
  console.log(`  ${planSem.id}: sem=R$ ${planSem.monthly} com=R$ ${planCom?.monthly} diff=R$ ${diff.toFixed(2)}`)
  if (Math.abs(diff - 20) > 0.01) allOk = false
}
if (allOk) {
  console.log('✅ PASS: extra aplicado em TODOS os 4 planos do carro normal')
} else {
  console.log('❌ FAIL: extra não foi aplicado em todos')
  process.exit(1)
}
