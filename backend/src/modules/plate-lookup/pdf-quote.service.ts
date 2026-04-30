import puppeteer from 'puppeteer-core'
import { PLAN_INFO, planIdFromName } from './plan-features'
import {
  getAllRelevantPlans,
  findPrice,
  PRICING_TABLES,
  type QuotePlanFull,
  type PlanId,
} from './pricing'
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

  const featHTML = features
    .map((f) =>
      f.included
        ? `<li class="feat yes"><span class="dot ok">&#10003;</span>${f.text}</li>`
        : `<li class="feat no"><span class="dot no">&#215;</span>${f.text}</li>`,
    )
    .join('')

  const mensalidade = plan.monthly
  const taxa = ctx.taxa
  const descontoEarly = mensalidade * 0.95
  const stickerPct = 15
  const comAdesivo = mensalidade * (1 - stickerPct / 100)
  const adesivoMaisEmDia = comAdesivo * 0.95

  const isMotoPlan = plan.id === 'moto-400' || plan.id === 'moto-1000'

  const adesivoBlock = isMotoPlan
    ? ''
    : `
    <div class="adesivo">
      <div class="adesivo-head">
        <div class="adesivo-icon">&#128663;</div>
        <div class="adesivo-title">
          <b>Desconto Adesivo 21Go</b>
          <span>Adesivo no vidro traseiro</span>
        </div>
        <span class="adesivo-pct">-${stickerPct}%</span>
      </div>
      <div class="adesivo-values">
        <div class="row">
          <span>Com adesivo</span>
          <div>
            <s>R$ ${formatBRL(mensalidade)}</s>
            <b class="laranja">R$ ${formatBRL(comAdesivo)}</b>
          </div>
        </div>
        <div class="divider"></div>
        <div class="row">
          <span>&#127991; Adesivo + em dia</span>
          <b class="verde">R$ ${formatBRL(adesivoMaisEmDia)}</b>
        </div>
        <div class="adesivo-foot">Descontos acumuláveis: adesivo (${stickerPct}%) + pontualidade (5%)</div>
      </div>
    </div>
  `

  const flag = isSelected ? 'SELECIONADO' : plan.popular ? 'MAIS ESCOLHIDO' : 'DISPONÍVEL'
  const flagClass = isSelected ? 'sel' : plan.popular ? 'pop' : 'avail'
  const subtitle = isSelected ? 'Plano selecionado por você' : `Plano ${plan.name}`

  // Selo de condicoes especiais — origem do veiculo (leilao/remarcado) e carro de app.
  const origemLabel =
    input.leilao === 'leilao' ? 'Leilão' : input.leilao === 'remarcado' ? 'Remarcado' : ''
  const condicoesItems: string[] = []
  if (origemLabel) {
    condicoesItems.push(
      `<div class="cond-item"><span class="cond-icon">⚠️</span><div><b>Veículo de ${origemLabel}</b><span>Indenização: 80% do valor da tabela FIPE</span></div></div>`,
    )
  }
  if (input.carroApp) {
    condicoesItems.push(
      `<div class="cond-item"><span class="cond-icon">🚕</span><div><b>Carro de aplicativo</b><span>Uber, 99 e similares. Adicional de R$ 20/mês já incluso na mensalidade</span></div></div>`,
    )
  }
  const condicoesBlock = condicoesItems.length
    ? `<div class="condicoes">${condicoesItems.join('')}</div>`
    : ''

  return `
  <div class="page ${isFirst ? '' : 'page-break'}">

    <div class="header">
      ${ctx.logoUrl
        ? `<img src="${ctx.logoUrl}" class="brand-logo" alt="21Go Proteção Veicular"/>`
        : `<div style="font-weight:900;font-size:24px;color:#1B4DA1;">21Go</div>`}
      <div class="meta">
        <b>Simulação de Proteção Veicular</b><br/>
        Emitida em ${ctx.hoje} &middot; válida até ${ctx.validade}
      </div>
    </div>

    <div class="title">
      <h1>${input.nome.split(' ')[0].toUpperCase()}, ${isFirst ? 'sua simulação está pronta!' : `confira também o plano <span class="plan-hl">${plan.name}</span>`}</h1>
      <p>${ctx.veiculoTitulo} &middot; ${input.placa ? `Placa: <b>${input.placa}</b> &middot; ` : ''}FIPE: <b>R$ ${formatBRL(input.fipe)}</b></p>
    </div>

    <div class="veic">
      <div class="left">
        <b>${ctx.veiculoTitulo}</b>
        <span>${input.placa ? `Placa ${input.placa}` : 'Sem placa informada'}${input.cor ? ' &middot; ' + input.cor : ''}</span>
      </div>
      <div class="fipe">
        <span>Valor FIPE</span>
        <b>R$ ${formatBRL(input.fipe)}</b>
      </div>
    </div>

    ${condicoesBlock}

    <div class="grid">
      <div class="card">
        <div class="plan-tab">
          <div>
            <div class="pname">${plan.name}</div>
            <div class="pdesc">${subtitle}</div>
          </div>
          <span class="pflag ${flagClass}">${flag}</span>
        </div>
        <div class="beneficios-title">Benefícios incluídos</div>
        <ul class="features">${featHTML}</ul>
      </div>

      <div class="card price-card">
        <div class="price-head">
          <div class="label">Plano ${plan.name}</div>
          <div class="price"><small>R$</small> ${formatBRL(mensalidade)}<em>/mês</em></div>
        </div>

        <div class="box laranja">
          <div class="box-head">
            <b>1º pagamento</b>
            <span class="amount">R$ ${formatBRL(taxa)}</span>
          </div>
          <div class="sub">Ativação do plano &middot; pagamento único</div>
        </div>

        <div class="box verde">
          <div class="box-head">
            <b>2º pagamento</b>
            <span class="due">vence ${ctx.dueDate}</span>
          </div>
          <div class="row2">
            <span></span>
            <div>
              <span class="old">R$ ${formatBRL(mensalidade)}</span>
              <span class="amount">R$ ${formatBRL(descontoEarly)}</span>
            </div>
          </div>
          <div class="sub">5% de desconto pagando antes do vencimento</div>
        </div>

        <div class="box mensal">
          <div class="box-head">
            <b>Mensalidade regular</b>
            <span class="amount">R$ ${formatBRL(mensalidade)}<small>/mês</small></span>
          </div>
        </div>

        ${adesivoBlock}

        <div class="cta">Contratar pelo WhatsApp &rarr;</div>
        <div class="susep">&#128274; Associação de proteção veicular &middot; 20 anos no RJ</div>
      </div>
    </div>

    <div class="footer">
      <div>
        <b>21Go Proteção Veicular</b> &middot; Rio de Janeiro &middot; RJ<br/>
        WhatsApp (21) 97903-4169 &middot; 21go.site
      </div>
      <div class="right">
        Simulação válida até <b>${ctx.validade}</b>
        <span class="pill">20 anos no Rio</span>
      </div>
    </div>

  </div>
  `
}

function renderHTML(input: QuotePdfInput): string {
  const dueDate = addDaysBR(new Date(), 30)
  const validade = addDaysBR(new Date(), 7)
  const hoje = new Date().toLocaleDateString('pt-BR')
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

  /**
   * Regra 21Go para taxa de adesão (única por veículo, não por plano):
   *   taxa = mensalidade do plano de referência + R$ 50, mínimo R$ 200
   * Plano de referência:
   *   - Carros normais → VIP
   *   - SUV → SUV (único)
   *   - Moto → Moto 450-1000cc (senão Moto 400)
   *   - Especial → Especial (único)
   */
  const refOrder: PlanId[] = ['vip', 'suv', 'moto-1000', 'moto-400', 'especial']
  const planoReferencia =
    refOrder.map((id) => planosAplicaveis.find((p) => p.id === id)).find(Boolean) ||
    planosAplicaveis[0]
  // Subtrai o extra de carroApp pra fórmula da adesão usar valor RAW.
  // Extra é só na mensalidade, não na taxa de adesão.
  const referenciaRaw = (planoReferencia?.monthly || input.mensalidade) - (input.carroApp ? CARRO_APP_EXTRA : 0)
  const taxa = Math.max(200, referenciaRaw + 50)

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
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #121A33;
    background: #F7F8FC;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page { width: 210mm; padding: 12mm 14mm 8mm; }
  .page-break { page-break-before: always; padding-top: 12mm; }

  /* HEADER */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 2px solid #E8ECF4;
    margin-bottom: 14px;
  }
  .brand-logo { height: 52px; width: auto; display: block; }
  .header .meta { text-align: right; font-size: 11px; color: #64748B; line-height: 1.4; }
  .header .meta b { color: #1B4DA1; font-weight: 800; font-size: 12px; }

  /* TITLE */
  .title { text-align: center; margin: 4px 0 14px; }
  .title h1 {
    font-size: 22px; font-weight: 800; color: #121A33; margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .title p { font-size: 12px; color: #64748B; margin: 0; }
  .title p b { color: #121A33; }

  /* Vehicle strip */
  .veic {
    background: #fff; border: 1px solid #E8ECF4;
    border-radius: 14px; padding: 12px 16px; margin-bottom: 14px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 6px 18px rgba(15,23,42,0.04);
  }
  .veic .left b { font-size: 14px; color: #121A33; display: block; margin-bottom: 2px; }
  .veic .left span { font-size: 11.5px; color: #64748B; }
  .veic .fipe { text-align: right; }
  .veic .fipe span { font-size: 11px; color: #64748B; display: block; }
  .veic .fipe b { font-size: 16px; color: #1B4DA1; font-weight: 800; }

  /* CONDICOES ESPECIAIS — leilao/remarcado, carro de app */
  .condicoes {
    background: #FFF7ED; border: 1.5px solid rgba(247,150,61,0.35);
    border-radius: 12px; padding: 10px 14px; margin-bottom: 14px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .condicoes .cond-item {
    display: flex; align-items: flex-start; gap: 10px; line-height: 1.35;
  }
  .condicoes .cond-icon {
    font-size: 16px; flex-shrink: 0; line-height: 1;
  }
  .condicoes .cond-item b {
    display: block; font-size: 11.5px; color: #B45309; font-weight: 800; margin-bottom: 1px;
  }
  .condicoes .cond-item span {
    display: block; font-size: 10.5px; color: #92400E;
  }

  /* GRID PRIMARY */
  .grid { display: grid; grid-template-columns: 1fr 250px; gap: 14px; }
  .card {
    background: #fff; border: 1px solid #E8ECF4;
    border-radius: 16px; padding: 16px;
    box-shadow: 0 6px 18px rgba(15,23,42,0.04);
  }
  .plan-tab {
    background: #1B4DA1; border-radius: 12px; padding: 10px 14px;
    margin-bottom: 12px; color: #fff;
    display: flex; align-items: center; justify-content: space-between;
  }
  .plan-tab .pname { font-weight: 800; font-size: 14px; }
  .plan-tab .pdesc { font-size: 10.5px; color: rgba(255,255,255,0.85); }
  .plan-tab .pflag { background: #F7963D; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; }
  .beneficios-title { font-weight: 700; font-size: 12px; color: #121A33; margin-bottom: 8px; }
  ul.features { list-style: none; padding: 0; margin: 0; }
  ul.features li {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; padding: 3px 0;
  }
  ul.features li .dot {
    display: inline-flex; align-items: center; justify-content: center;
    width: 16px; height: 16px; border-radius: 50%;
    font-size: 9px; font-weight: 900; flex-shrink: 0;
  }
  ul.features li .dot.ok { background: rgba(16,185,129,0.12); color: #10B981; }
  ul.features li .dot.no { background: #F0F4FA; color: #CBD5E1; }
  ul.features li.no { color: #94A3B8; text-decoration: line-through; }
  ul.features li.yes { color: #121A33; font-weight: 500; }

  /* RIGHT — Preço */
  .price-card { padding: 14px; }
  .price-head { text-align: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #E8ECF4; }
  .price-head .label { font-size: 11px; color: #64748B; margin-bottom: 4px; }
  .price-head .price { font-size: 30px; font-weight: 900; color: #121A33; letter-spacing: -1px; line-height: 1; }
  .price-head .price small { font-size: 12px; color: #64748B; font-weight: 600; }
  .price-head .price em { font-size: 12px; color: #64748B; font-weight: 600; font-style: normal; }

  .box { border-radius: 10px; padding: 8px 11px; margin-bottom: 8px; }
  .box-head { display: flex; justify-content: space-between; align-items: center; }
  .box-head b { font-size: 11px; font-weight: 700; color: #121A33; }
  .box.laranja { background: #FFF7ED; border: 1px solid rgba(247,150,61,0.2); }
  .box.laranja .amount { font-size: 14px; font-weight: 900; color: #F7963D; }
  .box.laranja .sub { font-size: 9.5px; color: #F7963D; font-weight: 600; margin-top: 2px; }
  .box.verde { background: #F0FDF4; border: 1px solid rgba(16,185,129,0.2); }
  .box.verde .row2 { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .box.verde .due { font-size: 10px; color: #64748B; }
  .box.verde .amount { font-size: 14px; font-weight: 900; color: #10B981; }
  .box.verde .old { font-size: 10px; color: #94A3B8; text-decoration: line-through; margin-right: 6px; }
  .box.verde .sub { font-size: 9.5px; color: #10B981; font-weight: 600; text-align: right; margin-top: 2px; }
  .box.mensal { background: #F8FAFC; border: 1px solid #E2E8F0; }
  .box.mensal .amount { font-size: 15px; font-weight: 900; color: #121A33; }
  .box.mensal .amount small { font-size: 10px; color: #64748B; font-weight: 500; }

  /* ADESIVO */
  .adesivo { border: 1.5px solid #F7963D; border-radius: 12px; padding: 10px; margin-top: 8px; background: #fff; }
  .adesivo-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .adesivo-icon {
    width: 26px; height: 26px; border-radius: 8px;
    background: rgba(247,150,61,0.1); color: #F7963D;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .adesivo-title { flex: 1; }
  .adesivo-title b { display: block; font-size: 10.5px; color: #121A33; font-weight: 700; }
  .adesivo-title span { display: block; font-size: 9px; color: #64748B; }
  .adesivo-pct { background: #F7963D; color: #fff; font-size: 9.5px; font-weight: 800; padding: 3px 7px; border-radius: 999px; }
  .adesivo-values { background: #FFF7ED; border-radius: 9px; padding: 8px 10px; }
  .adesivo-values .row { display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; }
  .adesivo-values .row span { color: #64748B; font-weight: 500; }
  .adesivo-values .row s { color: #94A3B8; font-size: 10px; margin-right: 6px; }
  .adesivo-values .laranja { color: #F7963D; font-size: 13px; font-weight: 900; }
  .adesivo-values .verde { color: #10B981; font-size: 13px; font-weight: 900; }
  .adesivo-values .divider { height: 1px; background: rgba(247,150,61,0.15); margin: 6px 0; }
  .adesivo-foot { font-size: 9px; color: #94A3B8; text-align: center; margin-top: 5px; }

  /* CTA */
  .cta {
    margin-top: 12px;
    background: linear-gradient(90deg,#F7963D,#F9A95E);
    color: #fff; font-weight: 800; font-size: 13px;
    text-align: center; padding: 11px; border-radius: 999px;
    box-shadow: 0 6px 14px rgba(247,150,61,0.25);
  }
  .susep { font-size: 9px; color: #94A3B8; text-align: center; margin-top: 6px; }

  /* Variações da flag do plano (sel / pop / avail) */
  .plan-tab .pflag.sel { background: #F7963D; }
  .plan-tab .pflag.pop { background: #10B981; }
  .plan-tab .pflag.avail { background: rgba(255,255,255,0.2); }
  .plan-hl { color: #1B4DA1; }

  /* FOOTER */
  .footer {
    margin-top: 14px; padding-top: 10px;
    border-top: 1px solid #E8ECF4;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 9.5px; color: #64748B;
  }
  .footer b { color: #121A33; }
  .footer .right { text-align: right; }
  .pill {
    display: inline-block; background: #F0F4FA; color: #1B4DA1;
    font-weight: 700; font-size: 9px;
    padding: 3px 8px; border-radius: 999px; margin-left: 6px;
  }
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

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium'
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
