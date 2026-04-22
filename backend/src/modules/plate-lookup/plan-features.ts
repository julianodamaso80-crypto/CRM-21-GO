/* Features por plano — espelha 21go-website/src/data/pricing.ts PLAN_INFO */

export interface PlanFeatureItem {
  text: string
  included: boolean
}

export interface PlanInfo {
  name: string
  features: PlanFeatureItem[]
}

export const PLAN_INFO: Record<string, PlanInfo> = {
  'basico': {
    name: 'Básico',
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Incêndio', included: true },
      { text: 'Colisão', included: true },
      { text: 'Danos a Terceiros R$5.000', included: true },
      { text: 'Monitoramento 24h', included: true },
      { text: 'Reboque 200km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Táxi 25km', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'Clube de Benefícios', included: true },
      { text: 'Fenômenos da Natureza', included: false },
      { text: 'Parabrisa', included: false },
      { text: 'Carro Reserva', included: false },
    ],
  },
  'do-seu-jeito': {
    name: 'Do Seu Jeito',
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Incêndio (proveniente de colisão)', included: true },
      { text: 'Fenômenos da Natureza', included: true },
      { text: 'Colisão', included: true },
      { text: 'Danos a Terceiros R$10.000', included: true },
      { text: 'Parabrisa', included: true },
      { text: 'Carro Amigo 25km de raio', included: true },
      { text: 'Monitoramento 24h', included: true },
      { text: 'Reboque 400km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Táxi 50km', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'Clube de Benefícios', included: true },
    ],
  },
  'vip': {
    name: 'VIP',
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Incêndio (proveniente de colisão)', included: true },
      { text: 'Fenômenos da Natureza', included: true },
      { text: 'Colisão', included: true },
      { text: 'Danos a Terceiros R$50.000', included: true },
      { text: 'Carro Reserva 7 dias (roubo e furto)', included: true },
      { text: 'Parabrisa', included: true },
      { text: 'Carro Amigo 25km de raio', included: true },
      { text: 'Monitoramento 24h', included: true },
      { text: 'Reboque 1.000km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Táxi 100km', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'Clube de Benefícios', included: true },
      { text: 'Funeral familiar até R$5.000', included: true },
    ],
  },
  'premium': {
    name: 'Premium',
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Incêndio (proveniente de colisão)', included: true },
      { text: 'Fenômenos da Natureza', included: true },
      { text: 'Colisão', included: true },
      { text: 'Danos a Terceiros R$100.000', included: true },
      { text: 'Carro Reserva 15 dias', included: true },
      { text: 'Parabrisa', included: true },
      { text: 'Carro Amigo', included: true },
      { text: 'Reboque Adicional 200km', included: true },
      { text: 'Todos os Vidros', included: true },
      { text: 'Monitoramento 24h', included: true },
      { text: 'Reboque 1.200km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Táxi 150km', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'AP morte acidental ou invalidez R$10.000', included: true },
      { text: 'Clube de Benefícios', included: true },
      { text: 'Funeral familiar R$5.000', included: true },
    ],
  },
  'suv': {
    name: 'SUV',
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Incêndio', included: true },
      { text: 'Fenômenos da Natureza', included: true },
      { text: 'Colisão', included: true },
      { text: 'Danos a Terceiros R$50.000', included: true },
      { text: 'Carro Reserva 7 dias (roubo e furto)', included: true },
      { text: 'Parabrisa', included: true },
      { text: 'Carro Amigo 25km', included: true },
      { text: 'Monitoramento 24h', included: true },
      { text: 'Reboque 1.000km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'AP morte/invalidez R$10.000', included: true },
      { text: 'Clube de Benefícios', included: true },
      { text: 'Funeral familiar até R$5.000', included: true },
    ],
  },
  'moto-400': {
    name: 'VIP Moto até 400cc',
    features: [
      { text: 'Roubo', included: true },
      { text: 'Furto', included: true },
      { text: 'Fenômenos da Natureza', included: true },
      { text: 'Colisão', included: true },
      { text: 'Monitoramento 24h (acima de R$8.000)', included: true },
      { text: 'Reboque 1.000km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'AP morte acidental ou invalidez (R$10.000)', included: true },
      { text: 'Clube de Benefícios', included: true },
      { text: 'Funeral familiar', included: true },
    ],
  },
  'moto-1000': {
    name: 'VIP Moto 450-1000cc',
    features: [
      { text: 'Roubo', included: true },
      { text: 'Furto', included: true },
      { text: 'Fenômenos da Natureza', included: true },
      { text: 'Colisão', included: true },
      { text: 'Monitoramento 24h (acima de R$8.000)', included: true },
      { text: 'Reboque 1.000km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'AP morte acidental ou invalidez (R$10.000)', included: true },
      { text: 'Clube de Benefícios', included: true },
      { text: 'Funeral familiar', included: true },
    ],
  },
  'especial': {
    name: 'Veículos Especiais',
    features: [
      { text: 'Roubo e Furto', included: true },
      { text: 'Incêndio (proveniente de colisão)', included: true },
      { text: 'Fenômenos da Natureza', included: true },
      { text: 'Colisão', included: true },
      { text: 'Danos a Terceiros R$50.000', included: true },
      { text: 'Carro Reserva 7 dias (roubo e furto)', included: true },
      { text: 'Parabrisa', included: true },
      { text: 'Carro Amigo 25km', included: true },
      { text: 'Monitoramento 24h', included: true },
      { text: 'Reboque 1.000km', included: true },
      { text: 'Chaveiro', included: true },
      { text: 'Substituição de pneu furado', included: true },
      { text: 'Auxílio na falta de combustível', included: true },
      { text: 'Hospedagem em hotel', included: true },
      { text: 'Retorno a domicílio', included: true },
      { text: 'Socorro mecânico / elétrico', included: true },
      { text: 'Clube de Benefícios', included: true },
      { text: 'Funeral familiar até R$5.000', included: true },
    ],
  },
}

export function planIdFromName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('especial')) return 'especial'
  if (n.includes('suv')) return 'suv'
  if (n.includes('moto') && n.includes('400')) return 'moto-400'
  if (n.includes('moto')) return 'moto-1000'
  if (n.includes('premium')) return 'premium'
  if (n.includes('vip')) return 'vip'
  if (n.includes('jeito')) return 'do-seu-jeito'
  return 'basico'
}
