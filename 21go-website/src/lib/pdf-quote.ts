import puppeteer from 'puppeteer-core'
import {
  PLAN_INFO,
  planIdFromName,
  getAllRelevantPlans,
  findPrice,
  PRICING_TABLES,
  type QuotePlanFull,
  type PlanId,
} from '@/data/pricing'
import { LOGO_21GO_BASE64 } from './assets/logo-base64'

export interface QuotePdfInput {
  nome: string
  whatsapp: string
  email?: string | null
  placa?: string | null
  marca: string
  modelo: string
  ano: string | number
  cor?: string | null
  fipe: number
  planoNome: string
  mensalidade: number
  taxaAtivacao?: number
  isMoto?: boolean
  /** Categoria da API Brasil (ex: "AUTOMOVEL", "MOTOCICLETA"). Opcional. */
  categoria?: string | null
  /** Combustível (ex: "GASOLINA", "ELETRICO"). Opcional. */
  combustivel?: string | null
  /** Cilindrada da moto em cc. Opcional. */
  cilindrada?: number | null
  /** Carro de aplicativo (Uber, 99, etc.) — adiciona +R$ 20/mês em todos os planos. */
  carroApp?: boolean | null
  /** Origem do veículo: "nao" | "leilao" | "remarcado". Quando leilão/remarcado, indenização cobre 80% da FIPE. */
  leilao?: string | null
  /** Seguro/proteção atual do veículo (texto livre — ex: "Porto Seguro", "Allianz"). */
  seguroAtual?: string | null
}

/** Carro de app: +R$ 20/mes em todos os planos exibidos. */
const CARRO_APP_EXTRA = 20

/* ─────────────────────────────────────────────────────────────────────────
 * Logo — embutida em base64 no bundle (sem I/O em runtime)
 * ───────────────────────────────────────────────────────────────────────── */

const LOGO_DATA_URL = `data:image/png;base64,${LOGO_21GO_BASE64}`
function getLogoDataUrl(): string {
  return LOGO_DATA_URL
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function addDaysBR(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('pt-BR')
}

/**
 * Identifica o PlanId do veículo cruzando (mensalidade × FIPE) com PRICING_TABLES.
 * Esta é a defesa mais forte: o valor que o cliente viu no site SÓ pode ter
 * vindo de uma faixa de uma tabela. Se bater, esse é o plano correto —
 * independente do que está em planoNome / categoria / combustivel.
 *
 * Retorna null se nenhum match exato for encontrado.
 */
export function detectPlanByValue(fipe: number, mensalidade: number): PlanId | null {
  const ids: PlanId[] = ['especial', 'premium', 'vip', 'suv', 'do-seu-jeito', 'basico', 'moto-1000', 'moto-400']
  // Tolerância de 1 centavo p/ evitar problema de float
  const matches: PlanId[] = []
  for (const id of ids) {
    const price = findPrice(PRICING_TABLES[id], fipe)
    if (price !== null && Math.abs(price - mensalidade) < 0.01) {
      matches.push(id)
    }
  }
  if (matches.length === 0) return null
  // Se houver ambiguidade (raro), prioriza o mais específico
  const priority: PlanId[] = ['especial', 'suv', 'moto-1000', 'moto-400', 'premium', 'vip', 'do-seu-jeito', 'basico']
  for (const p of priority) {
    if (matches.includes(p)) return p
  }
  return matches[0]
}

/**
 * Resolve quais planos mostrar no PDF baseado no veículo.
 *
 * Estratégia em camadas (do mais confiável para o menos):
 *  1. **Match por valor (mensalidade × FIPE × PRICING_TABLES)** — fonte de verdade
 *     mais robusta: o valor que o cliente viu no site só pôde vir de uma faixa
 *     de uma tabela. Se bater, sabemos exatamente o plano e categoria.
 *  2. Categoria/combustível/cilindrada vindas do input (Brasil API).
 *  3. Inferência pelo nome do plano selecionado (planoNome).
 *
 * Exportada pra ser testável sem rodar Puppeteer.
 */
export function resolvePlans(input: QuotePdfInput): QuotePlanFull[] {
  // 1) Defesa primária: identificar plano pelo valor exato
  const detected = detectPlanByValue(input.fipe, input.mensalidade)

  // 2) Inferência por nome (fallback)
  const fromName = planIdFromName(input.planoNome) as PlanId
  const planId: PlanId = detected || fromName

  let categoria = input.categoria || ''
  let cilindrada = input.cilindrada || 0
  let combustivel = input.combustivel || ''

  if (!categoria) {
    if (planId === 'moto-400' || planId === 'moto-1000') categoria = 'MOTOCICLETA'
    else if (planId === 'suv') categoria = 'CAMINHONETE'
    else categoria = 'AUTOMOVEL'
  }
  if (!cilindrada && planId === 'moto-400') cilindrada = 300
  if (!cilindrada && planId === 'moto-1000') cilindrada = 800

  // Se o plano detectado é "especial" e a FIPE não passa de 150k,
  // o motivo só pode ser veículo elétrico — força a flag pra que
  // getAllRelevantPlans devolva exatamente a tabela ESPECIAL (mesmos
  // valores do site). Esta é a defesa contra o bug do BYD Dolphin Mini.
  if (planId === 'especial' && input.fipe <= 150000) {
    combustivel = 'ELETRICO'
  }

  const plansRaw = getAllRelevantPlans(
    input.fipe,
    categoria,
    combustivel || undefined,
    cilindrada,
    input.modelo,
  )

  // Se nada bateu (pricing band não cobre), devolve pelo menos o plano selecionado
  const plans = plansRaw.length === 0
    ? [{
        id: planId,
        name: input.planoNome,
        monthly: input.mensalidade,
        applicable: true,
        categoryLabel: '',
      }]
    : plansRaw

  // Se for carro de aplicativo, soma +R$ 20/mês em TODOS os planos exibidos.
  if (input.carroApp) {
    return plans.map((p) => ({ ...p, monthly: p.monthly + CARRO_APP_EXTRA }))
  }
  return plans
}

/**
 * Renderiza UMA página completa (estilo imagem de referência):
 * título + veículo + card de benefícios + card de preço com breakdown
 * (1º pagamento, 2º pagamento com 5%, mensalidade regular, adesivo).
 * Cada plano aplicável vira uma página dessas — não há mais card comparativo simplificado.
 */
function renderPlanPage(
  plan: QuotePlanFull,
  input: QuotePdfInput,
  isSelected: boolean,
  ctx: {
    logoUrl: string
    hoje: string
    validade: string
    dueDate: string
    veiculoTitulo: string
    taxa: number
  },
  isFirst: boolean,
): string {
  const info = PLAN_INFO[plan.id as keyof typeof PLAN_INFO]
  const features = info?.features || []

  const incluidos = features.filter((f) => f.included)
  const naoIncluidos = features.filter((f) => !f.included)

  const incluidosHTML = incluidos
    .map((f) => `<li><span class="ico ok">✓</span><span class="txt">${f.text}</span></li>`)
    .join('')
  const naoIncluidosHTML = naoIncluidos.length
    ? naoIncluidos
        .map((f) => `<li><span class="ico no">×</span><span class="txt">${f.text}</span></li>`)
        .join('')
    : '<li class="empty">Todas as coberturas deste plano estão incluídas</li>'

  const mensalidade = plan.monthly
  const taxa = ctx.taxa
  const descontoEarly = mensalidade * 0.95
  const stickerPct = 15
  const comAdesivo = mensalidade * (1 - stickerPct / 100)
  const adesivoMaisEmDia = comAdesivo * 0.95

  // Mercado Pago — gross-up pra receber o valor líquido na hora
  const MP_FEE_AVISTA = 0.0498
  const MP_FEE_12X = 0.11
  const taxaAvista = taxa / (1 - MP_FEE_AVISTA)
  const taxa12xTotal = taxa / (1 - MP_FEE_12X)
  const taxa12xParcela = taxa12xTotal / 12

  const isMotoPlan = plan.id === 'moto-400' || plan.id === 'moto-1000'

  // Selo de condições especiais
  const origemLabel =
    input.leilao === 'leilao' ? 'Leilão' : input.leilao === 'remarcado' ? 'Remarcado' : ''
  const condicoesItems: string[] = []
  if (origemLabel) {
    condicoesItems.push(
      `<div class="cond-pill"><span class="cond-dot">⚠</span>Veículo de <b>${origemLabel}</b> · indenização 80% FIPE</div>`,
    )
  }
  if (input.carroApp) {
    condicoesItems.push(
      `<div class="cond-pill"><span class="cond-dot">🚕</span><b>Carro de aplicativo</b> · adicional R$ 20/mês incluso</div>`,
    )
  }
  if (input.seguroAtual && input.seguroAtual.trim()) {
    const seguroEscaped = input.seguroAtual
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    condicoesItems.push(
      `<div class="cond-pill"><span class="cond-dot">🛡</span>Proteção atual: <b>${seguroEscaped}</b></div>`,
    )
  }
  const condicoesBlock = condicoesItems.length
    ? `<div class="condicoes">${condicoesItems.join('')}</div>`
    : ''

  const firstName = input.nome.split(' ')[0]
  const flagText = isSelected
    ? 'Plano escolhido'
    : plan.popular
      ? 'Mais escolhido'
      : 'Disponível'
  const flagCls = isSelected ? 'sel' : plan.popular ? 'pop' : 'avail'

  const headerTitle = isFirst
    ? `${firstName}, sua simulação está pronta`
    : `${firstName}, conheça também o plano ${plan.name}`

  return `
  <div class="page ${isFirst ? '' : 'page-break'}">

    <header class="hero">
      <div class="brand">
        ${
          ctx.logoUrl
            ? `<img src="${ctx.logoUrl}" class="brand-logo" alt="21Go"/>`
            : `<span class="brand-text">21Go</span>`
        }
      </div>
      <div class="hero-meta">
        <span class="hero-meta-line"><b>Simulação personalizada</b></span>
        <span class="hero-meta-line">Emitida ${ctx.hoje} · válida até ${ctx.validade}</span>
      </div>
    </header>

    <section class="greet">
      <span class="greet-eyebrow">Proteção veicular sob medida</span>
      <h1>${headerTitle}</h1>
    </section>

    <section class="vehicle">
      <div class="vehicle-info">
        <span class="v-label">Seu veículo</span>
        <div class="v-name">${ctx.veiculoTitulo}</div>
        <div class="v-meta">
          ${input.placa ? `Placa <b>${input.placa}</b>` : 'Placa não informada'}
          ${input.cor ? ` · ${input.cor}` : ''}
          ${input.ano ? ` · ${input.ano}` : ''}
        </div>
      </div>
      <div class="vehicle-fipe">
        <span class="vf-label">Valor FIPE</span>
        <strong class="vf-amount">R$ ${formatBRL(input.fipe)}</strong>
      </div>
    </section>

    ${condicoesBlock}

    <section class="plan-hero">
      <div class="ph-badge ${flagCls}">${flagText}</div>
      <div class="ph-row">
        <div class="ph-info">
          <span class="ph-label">Plano</span>
          <h2 class="ph-name">${plan.name}</h2>
        </div>
        <div class="ph-price">
          <span class="ph-cur">R$</span>
          <span class="ph-num">${formatBRL(mensalidade)}</span>
          <span class="ph-per">/mês</span>
        </div>
      </div>
    </section>

    <section class="benefits">
      <div class="bcol bcol-yes">
        <div class="bcol-head">
          <span class="bcol-icon ok">✓</span>
          <span class="bcol-title">Coberturas incluídas</span>
        </div>
        <ul class="blist">${incluidosHTML}</ul>
      </div>
      <div class="bcol bcol-no">
        <div class="bcol-head">
          <span class="bcol-icon no">×</span>
          <span class="bcol-title">Não incluídas</span>
        </div>
        <ul class="blist">${naoIncluidosHTML}</ul>
        ${
          naoIncluidos.length
            ? '<p class="bcol-note">Pode ser adicionado em planos superiores.</p>'
            : ''
        }
      </div>
    </section>

    <section class="payment">
      <div class="pay-card pay-laranja">
        <div class="pc-head">
          <span class="pc-label">Ativação</span>
          <span class="pc-tag">Pagamento único</span>
        </div>
        <div class="pc-row">
          <span class="pc-row-label">À vista no cartão</span>
          <strong class="pc-row-val laranja">R$ ${formatBRL(taxaAvista)}</strong>
        </div>
        <div class="pc-row">
          <span class="pc-row-label">12x sem juros</span>
          <strong class="pc-row-val verde">R$ ${formatBRL(taxa12xParcela)}</strong>
        </div>
      </div>

      <div class="pay-card pay-verde">
        <div class="pc-head">
          <span class="pc-label">1ª mensalidade</span>
          <span class="pc-tag verde">5% off</span>
        </div>
        <div class="pc-row pc-discount">
          <s>R$ ${formatBRL(mensalidade)}</s>
          <strong class="pc-row-val verde">R$ ${formatBRL(descontoEarly)}</strong>
        </div>
        <div class="pc-hint">Pagando até <b>${ctx.dueDate}</b></div>
      </div>

      <div class="pay-card pay-cinza">
        <div class="pc-head">
          <span class="pc-label">Mensalidade regular</span>
        </div>
        <div class="pc-row pc-discount">
          <strong class="pc-row-val">R$ ${formatBRL(mensalidade)}<span class="pc-mes">/mês</span></strong>
        </div>
        <div class="pc-hint">Sem qualquer desconto</div>
      </div>
    </section>

    ${
      isMotoPlan
        ? ''
        : `<section class="adesivo-section">
      <div class="ad-head">
        <span class="ad-icon">🚗</span>
        <div class="ad-title">
          <b>Desconto Adesivo 21Go</b>
          <span>Adesivo discreto no vidro traseiro</span>
        </div>
        <span class="ad-pct">−${stickerPct}%</span>
      </div>
      <div class="ad-values">
        <div class="ad-row">
          <span>Com adesivo</span>
          <div><s>R$ ${formatBRL(mensalidade)}</s> <b class="laranja">R$ ${formatBRL(comAdesivo)}/mês</b></div>
        </div>
        <div class="ad-row">
          <span>Adesivo + pagando em dia</span>
          <b class="verde">R$ ${formatBRL(adesivoMaisEmDia)}/mês</b>
        </div>
      </div>
      <div class="ad-foot">Descontos acumuláveis: adesivo (${stickerPct}%) + pontualidade (5%)</div>
    </section>`
    }

    <section class="cta-section">
      <a class="cta-btn" href="https://wa.me/5521979034169?text=${encodeURIComponent(`Olá! Tenho interesse no plano ${plan.name} pra meu ${input.marca} ${input.modelo}. Pode me ajudar?`)}">Quero contratar pelo WhatsApp →</a>
      <p class="cta-sub">Atendimento em todo o Brasil · 20 anos de experiência</p>
    </section>

    <footer class="pdf-footer">
      <span><b>21Go Proteção Veicular</b> · 21go.site · WhatsApp (21) 97903-4169</span>
      <span>Simulação válida até <b>${ctx.validade}</b></span>
    </footer>

  </div>
  `
}

function renderHTML(input: QuotePdfInput): string {
  const now = new Date()
  const dayOfMonth = now.getDate()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  // Regra 21Go: ativou dia 1-15 → vence dia 10 do mês seguinte;
  //             ativou dia 16-31 → vence dia 20 do mês seguinte.
  const dueDateObj = dayOfMonth <= 15
    ? new Date(currentYear, currentMonth + 1, 10)
    : new Date(currentYear, currentMonth + 1, 20)
  const dueDate = dueDateObj.toLocaleDateString('pt-BR')
  const validade = addDaysBR(now, 7)
  const hoje = now.toLocaleDateString('pt-BR')
  const veiculoTitulo = `${input.marca} ${input.modelo} ${input.ano}`.trim()
  const logoUrl = getLogoDataUrl()

  const planosAplicaveis = resolvePlans(input)
  // Identifica o plano selecionado pelo valor primeiro (defesa robusta),
  // caindo no nome só se não houver match por valor. Usa valor PURO (sem
  // o extra de carroApp) pois o detectPlanByValue cruza com PRICING_TABLES.
  const planoEscolhidoId =
    detectPlanByValue(input.fipe, input.mensalidade) || planIdFromName(input.planoNome)

  // Ordena: plano escolhido primeiro, depois os outros
  const ordered = [...planosAplicaveis].sort((a, b) => {
    if (a.id === planoEscolhidoId) return -1
    if (b.id === planoEscolhidoId) return 1
    return 0
  })

  // Taxa de ativacao FIXA (alinhada com o valor exibido no site /cotacao).
  // Quando o operador quiser mudar (ex: passar pra R$ 500), atualiza a
  // constante TAXA_ATIVACAO no site E aqui pra que ambos batam sempre.
  const taxa = 399

  const ctx = { logoUrl, hoje, validade, dueDate, veiculoTitulo, taxa }
  const pagesHTML = ordered
    .map((p, idx) => renderPlanPage(p, input, p.id === planoEscolhidoId, ctx, idx === 0))
    .join('')

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>Simulação 21Go · ${input.nome}</title>
<style>
  /* ============================================================
   *  21Go — Simulação Proteção Veicular (template moderno)
   *  Paleta: laranja #F7963D · verde #10B981 · azul #1B4DA1
   *  Tipografia: Inter / system-ui (fallback)
   * ============================================================ */
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #0F172A;
    background: #fff;
    line-height: 1.4;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 14mm 14mm 12mm;
    background: #fff;
    position: relative;
  }
  .page-break { page-break-before: always; }

  /* ============================ HERO ============================ */
  .hero {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 2px solid #F1F5F9;
    margin-bottom: 18px;
  }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-logo {
    height: 56px; width: auto; display: block;
    object-fit: contain;
  }
  .brand-text {
    font-weight: 900; font-size: 26px; color: #1B4DA1;
    letter-spacing: -0.5px;
  }
  .hero-meta {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 2px;
  }
  .hero-meta-line {
    font-size: 10.5px; color: #64748B;
  }
  .hero-meta-line b {
    color: #0F172A; font-weight: 700; font-size: 11.5px;
  }

  /* ============================ GREETING ============================ */
  .greet { margin: 4px 0 16px; }
  .greet-eyebrow {
    display: inline-block;
    font-size: 10px; font-weight: 700;
    color: #F7963D; text-transform: uppercase;
    letter-spacing: 1.2px; margin-bottom: 6px;
  }
  .greet h1 {
    font-size: 26px; font-weight: 800;
    color: #0F172A; margin: 0;
    letter-spacing: -0.6px; line-height: 1.15;
  }

  /* ============================ VEHICLE ============================ */
  .vehicle {
    background: linear-gradient(135deg, #1B4DA1 0%, #2563EB 100%);
    color: #fff;
    border-radius: 16px;
    padding: 18px 22px;
    margin-bottom: 14px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 8px 24px rgba(27,77,161,0.18);
  }
  .vehicle-info { flex: 1; }
  .v-label, .vf-label {
    font-size: 9.5px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.2px;
    opacity: 0.7; display: block; margin-bottom: 4px;
  }
  .v-name {
    font-size: 16px; font-weight: 800;
    margin-bottom: 3px; letter-spacing: -0.3px;
  }
  .v-meta { font-size: 11px; opacity: 0.85; }
  .v-meta b { font-weight: 700; }
  .vehicle-fipe {
    text-align: right;
    border-left: 1px solid rgba(255,255,255,0.2);
    padding-left: 18px; margin-left: 18px;
  }
  .vf-amount {
    font-size: 22px; font-weight: 900;
    letter-spacing: -0.5px; display: block;
  }

  /* ============================ CONDICOES PILLS ============================ */
  .condicoes {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-bottom: 14px;
  }
  .cond-pill {
    background: #FFF7ED; border: 1px solid rgba(247,150,61,0.3);
    color: #B45309; font-size: 10.5px; font-weight: 600;
    padding: 6px 12px; border-radius: 999px;
    display: flex; align-items: center; gap: 6px;
  }
  .cond-pill b { color: #92400E; font-weight: 800; }
  .cond-dot { font-size: 12px; }

  /* ============================ PLAN HERO ============================ */
  .plan-hero {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 14px;
    box-shadow: 0 4px 14px rgba(15,23,42,0.04);
    position: relative;
  }
  .ph-badge {
    position: absolute; top: -10px; left: 20px;
    font-size: 9.5px; font-weight: 800;
    padding: 4px 10px; border-radius: 999px;
    color: #fff; text-transform: uppercase; letter-spacing: 0.8px;
  }
  .ph-badge.sel { background: #F7963D; }
  .ph-badge.pop { background: #10B981; }
  .ph-badge.avail { background: #94A3B8; }

  .ph-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 4px;
  }
  .ph-info { flex: 1; }
  .ph-label {
    font-size: 10px; font-weight: 700;
    color: #64748B; text-transform: uppercase;
    letter-spacing: 1px; display: block;
  }
  .ph-name {
    font-size: 24px; font-weight: 800;
    color: #1B4DA1; margin: 4px 0 0; letter-spacing: -0.5px;
  }
  .ph-price {
    display: flex; align-items: baseline; gap: 3px;
    color: #0F172A;
  }
  .ph-cur { font-size: 14px; font-weight: 700; color: #64748B; }
  .ph-num { font-size: 36px; font-weight: 900; letter-spacing: -1.2px; }
  .ph-per { font-size: 14px; font-weight: 600; color: #64748B; }

  /* ============================ BENEFITS — LADO A LADO ============================ */
  .benefits {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }
  .bcol {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 4px 12px rgba(15,23,42,0.03);
  }
  .bcol-yes { border-top: 3px solid #10B981; }
  .bcol-no { border-top: 3px solid #CBD5E1; }
  .bcol-head {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #F1F5F9;
  }
  .bcol-icon {
    width: 22px; height: 22px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%; font-weight: 900; font-size: 12px;
    flex-shrink: 0;
  }
  .bcol-icon.ok { background: #10B981; color: #fff; }
  .bcol-icon.no { background: #CBD5E1; color: #fff; }
  .bcol-title {
    font-size: 12px; font-weight: 800;
    color: #0F172A; letter-spacing: -0.2px;
  }
  ul.blist {
    list-style: none; margin: 0; padding: 0;
  }
  ul.blist li {
    display: flex; align-items: center; gap: 8px;
    font-size: 10.5px;
    padding: 4px 0;
    color: #334155;
  }
  ul.blist li.empty {
    color: #10B981; font-style: italic; font-size: 10.5px;
    padding: 4px 0;
  }
  ul.blist li .ico {
    width: 14px; height: 14px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%; font-size: 9px; font-weight: 900;
    flex-shrink: 0;
  }
  ul.blist li .ico.ok { background: rgba(16,185,129,0.15); color: #10B981; }
  ul.blist li .ico.no { background: rgba(203,213,225,0.4); color: #94A3B8; }
  ul.blist li .txt { line-height: 1.3; }
  .bcol-no ul.blist li .txt {
    color: #94A3B8;
    text-decoration: line-through;
    text-decoration-color: rgba(148,163,184,0.4);
  }
  .bcol-note {
    font-size: 9.5px; color: #94A3B8;
    margin: 8px 0 0; font-style: italic;
    text-align: center;
  }

  /* ============================ PAYMENT ============================ */
  .payment {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }
  .pay-card {
    border-radius: 12px;
    padding: 12px 14px;
    border: 1px solid;
  }
  .pay-laranja {
    background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
    border-color: rgba(247,150,61,0.25);
  }
  .pay-verde {
    background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
    border-color: rgba(16,185,129,0.25);
  }
  .pay-cinza {
    background: #F8FAFC;
    border-color: #E2E8F0;
  }
  .pc-head {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 8px;
  }
  .pc-label {
    font-size: 10px; font-weight: 800;
    color: #0F172A; text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .pc-tag {
    background: #F7963D; color: #fff;
    font-size: 8px; font-weight: 800;
    padding: 2px 7px; border-radius: 999px;
    text-transform: uppercase; letter-spacing: 0.6px;
  }
  .pc-tag.verde { background: #10B981; }
  .pc-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 3px 0;
  }
  .pc-row.pc-discount {
    margin: 6px 0 4px;
  }
  .pc-row-label {
    font-size: 10.5px; color: #64748B; font-weight: 600;
  }
  .pc-row-val {
    font-size: 17px; font-weight: 900;
    letter-spacing: -0.5px;
    color: #0F172A;
  }
  .pc-row-val.laranja { color: #F7963D; }
  .pc-row-val.verde { color: #10B981; }
  .pc-row s {
    color: #94A3B8; font-size: 11px; margin-right: 6px;
  }
  .pc-mes {
    font-size: 11px; font-weight: 600; color: #64748B;
    margin-left: 2px;
  }
  .pc-hint {
    font-size: 9.5px; color: #64748B;
    margin-top: 4px; line-height: 1.3;
  }
  .pc-hint b { color: #0F172A; font-weight: 700; }

  /* ============================ ADESIVO ============================ */
  .adesivo-section {
    background: #fff;
    border: 1.5px solid #F7963D;
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 14px;
    box-shadow: 0 4px 14px rgba(247,150,61,0.08);
  }
  .ad-head {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 10px;
  }
  .ad-icon {
    width: 32px; height: 32px;
    background: rgba(247,150,61,0.12);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .ad-title { flex: 1; }
  .ad-title b {
    display: block; font-size: 12px;
    color: #0F172A; font-weight: 800;
  }
  .ad-title span {
    display: block; font-size: 10px; color: #64748B;
  }
  .ad-pct {
    background: #F7963D; color: #fff;
    font-size: 11px; font-weight: 900;
    padding: 5px 11px; border-radius: 999px;
  }
  .ad-values {
    background: #FFF7ED; border-radius: 10px;
    padding: 10px 12px;
  }
  .ad-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; padding: 4px 0;
  }
  .ad-row span { color: #64748B; font-weight: 500; }
  .ad-row s { color: #94A3B8; font-size: 10.5px; margin-right: 6px; }
  .ad-row .laranja { color: #F7963D; font-size: 13px; font-weight: 900; }
  .ad-row .verde { color: #10B981; font-size: 13px; font-weight: 900; }
  .ad-foot {
    font-size: 9.5px; color: #94A3B8;
    text-align: center; margin-top: 8px;
  }
  .laranja { color: #F7963D; }
  .verde { color: #10B981; }

  /* ============================ CTA ============================ */
  .cta-section { text-align: center; margin-bottom: 12px; }
  .cta-btn {
    display: inline-block;
    background: linear-gradient(135deg, #F7963D 0%, #FB923C 100%);
    color: #fff; text-decoration: none;
    font-weight: 800; font-size: 14px;
    padding: 14px 32px; border-radius: 999px;
    box-shadow: 0 8px 20px rgba(247,150,61,0.28);
    letter-spacing: -0.2px;
  }
  .cta-sub {
    font-size: 10.5px; color: #64748B;
    margin: 8px 0 0; font-weight: 500;
  }

  /* ============================ FOOTER ============================ */
  .pdf-footer {
    margin-top: auto; padding-top: 12px;
    border-top: 1px solid #F1F5F9;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 9px; color: #94A3B8;
  }
  .pdf-footer b { color: #475569; font-weight: 700; }
</style>
</head>
<body>
  ${pagesHTML}
</body>
</html>`
}

/* ─────────────────────────────────────────────────────────────────────────
 * Puppeteer — browser reutilizado (singleton) para evitar custo de boot
 * ─────────────────────────────────────────────────────────────────────── */

let browserPromise: Promise<import('puppeteer-core').Browser> | null = null

/**
 * Resolve o caminho do Chromium tentando múltiplos locais conhecidos.
 * Ordem de preferência:
 *   1. PUPPETEER_EXECUTABLE_PATH (env)
 *   2. /root/.cache/puppeteer/chrome/.../chrome  ← Chrome do puppeteer-core
 *   3. /usr/bin/chromium / chromium-browser / google-chrome (sistema)
 *
 * /bin/chromium-browser do Ubuntu 24.04 é um STUB de snap — NÃO usar.
 */
async function resolveChromiumPath(): Promise<string | undefined> {
  const fs = await import('node:fs/promises')
  const tryPaths: (string | undefined)[] = []

  // 1. Env explícita (mais alta prioridade)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    tryPaths.push(process.env.PUPPETEER_EXECUTABLE_PATH)
  }

  // 2. Chrome baixado pelo puppeteer-core (auto-detect)
  try {
    const cacheRoot = '/root/.cache/puppeteer/chrome'
    const versions = await fs.readdir(cacheRoot).catch(() => [] as string[])
    for (const v of versions) {
      tryPaths.push(`${cacheRoot}/${v}/chrome-linux64/chrome`)
    }
  } catch {
    /* noop */
  }

  // 3. Sistema (Linux)
  tryPaths.push('/usr/bin/chromium', '/usr/bin/google-chrome')

  for (const p of tryPaths) {
    if (!p) continue
    try {
      await fs.access(p)
      return p
    } catch {
      /* tenta próximo */
    }
  }
  return undefined
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const executablePath = await resolveChromiumPath()
      if (!executablePath) {
        throw new Error(
          'Chromium não encontrado. Defina PUPPETEER_EXECUTABLE_PATH ou rode `npx puppeteer browsers install chrome`.',
        )
      }
      console.log('[PDF] Lançando Chromium (headless) em:', executablePath)
      const t0 = Date.now()
      const browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=none',
        ],
      })
      console.log(`[PDF] Chromium pronto em ${Date.now() - t0}ms`)
      return browser
    })().catch((err) => {
      console.error('[PDF] Falha ao lançar Chromium:', err.message, err.stack)
      browserPromise = null
      throw err
    })
  }
  return browserPromise
}

export async function generateQuotePdf(input: QuotePdfInput): Promise<Buffer> {
  console.log('[PDF] generateQuotePdf iniciado para', input.nome, '-', input.marca, input.modelo)

  // Guard de seguranca: PDF NUNCA deve sair com FIPE <= 0 ou mensalidade <= 0.
  // O backend /api/vehicle/lead ja filtra, mas reforcamos aqui pra qualquer caller.
  if (!input.fipe || input.fipe <= 0) {
    throw new Error(
      `valorFipe invalido (${input.fipe}) — recusa gerar PDF com FIPE zerado/ausente`,
    )
  }
  if (!input.mensalidade || input.mensalidade <= 0) {
    throw new Error(
      `mensalidade invalida (${input.mensalidade}) — recusa gerar PDF com plano zerado`,
    )
  }

  const html = renderHTML(input)
  console.log('[PDF] HTML renderizado:', html.length, 'chars')
  const browser = await getBrowser()
  const page = await browser.newPage()
  try {
    const t0 = Date.now()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    console.log(`[PDF] setContent ok em ${Date.now() - t0}ms`)
    const t1 = Date.now()
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    })
    console.log(`[PDF] pdf gerado em ${Date.now() - t1}ms — ${pdf.length} bytes`)
    return Buffer.from(pdf)
  } catch (err: any) {
    console.error('[PDF] Erro durante geração:', err.message, err.stack)
    throw err
  } finally {
    await page.close().catch(() => {})
  }
}

export async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise
    await b.close().catch(() => {})
    browserPromise = null
  }
}
