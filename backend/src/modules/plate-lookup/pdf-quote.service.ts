import puppeteer from 'puppeteer-core'
import { PLAN_INFO, planIdFromName } from './plan-features'
import { getApplicablePlans, type QuotePlan, type PlanId } from './pricing'
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
}

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
 * Resolve quais planos mostrar no PDF baseado no veículo.
 * Usa categoria/combustível/cilindrada se vierem; caso contrário infere
 * pelo nome do plano selecionado e modelo.
 */
function resolvePlans(input: QuotePdfInput): QuotePlan[] {
  // Inferência de categoria a partir do plano escolhido (fallback)
  const planId = planIdFromName(input.planoNome)
  let categoria = input.categoria || ''
  let cilindrada = input.cilindrada || 0
  if (!categoria) {
    if (planId === 'moto-400' || planId === 'moto-1000') categoria = 'MOTOCICLETA'
    else if (planId === 'suv') categoria = 'CAMINHONETE'
    else if (planId === 'especial') categoria = 'AUTOMOVEL'
    else categoria = 'AUTOMOVEL'
  }
  if (!cilindrada && planId === 'moto-400') cilindrada = 300
  if (!cilindrada && planId === 'moto-1000') cilindrada = 800

  const plans = getApplicablePlans(
    input.fipe,
    categoria,
    input.combustivel || undefined,
    cilindrada,
    input.modelo,
  )

  // Se ainda não retornou nada (pricing band não cobre), pelo menos o plano escolhido
  if (plans.length === 0) {
    return [{ id: planId as PlanId, name: input.planoNome, monthly: input.mensalidade }]
  }
  return plans
}

function renderPlanCard(plan: QuotePlan, isSelected: boolean): string {
  const info = PLAN_INFO[plan.id as keyof typeof PLAN_INFO]
  const features = info?.features || []
  const incluidos = features.filter((f) => f.included).slice(0, 12)
  const naoIncluidos = features.filter((f) => !f.included).slice(0, 4)

  const featHTML =
    incluidos
      .map((f) => `<li class="feat yes"><span class="dot ok">&#10003;</span>${f.text}</li>`)
      .join('') +
    naoIncluidos
      .map((f) => `<li class="feat no"><span class="dot no">&#215;</span>${f.text}</li>`)
      .join('')

  const badge = isSelected
    ? `<span class="badge selected">Você selecionou</span>`
    : plan.popular
    ? `<span class="badge popular">Mais escolhido</span>`
    : ''

  return `
    <div class="plan-card ${isSelected ? 'highlight' : ''}">
      <div class="plan-card-head">
        <div class="plan-name">${plan.name}</div>
        ${badge}
      </div>
      <div class="plan-price">
        <small>R$</small><b>${formatBRL(plan.monthly)}</b><em>/mês</em>
      </div>
      <ul class="features">${featHTML}</ul>
    </div>
  `
}

function renderHTML(input: QuotePdfInput): string {
  const taxa = input.taxaAtivacao ?? 399
  const mensalidade = input.mensalidade
  const descontoEarly = mensalidade * 0.95
  const stickerPct = 15
  const comAdesivo = mensalidade * (1 - stickerPct / 100)
  const adesivoMaisEmDia = comAdesivo * 0.95

  const dueDate = addDaysBR(new Date(), 30)
  const validade = addDaysBR(new Date(), 7)
  const hoje = new Date().toLocaleDateString('pt-BR')

  const veiculoTitulo = `${input.marca} ${input.modelo} ${input.ano}`.trim()
  const placaLine = input.placa ? `Placa: <b>${input.placa}</b> &middot; ` : ''

  const logoUrl = getLogoDataUrl()
  const planosAplicaveis = resolvePlans(input)
  const planoEscolhidoId = planIdFromName(input.planoNome)

  const adesivoBlock = input.isMoto
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

  const comparativoCards = planosAplicaveis
    .map((p) => renderPlanCard(p, p.id === planoEscolhidoId))
    .join('')

  // Grid: 1, 2 ou 3 colunas conforme número de planos
  const gridCols = planosAplicaveis.length >= 3 ? 'repeat(3, 1fr)' : planosAplicaveis.length === 2 ? 'repeat(2, 1fr)' : '1fr'

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>Simulação 21Go — ${input.nome}</title>
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

  /* COMPARATIVO — página 2 */
  .compare-title {
    text-align: center; margin-bottom: 14px;
  }
  .compare-title h2 {
    font-size: 18px; font-weight: 800; color: #121A33; margin: 0 0 4px;
    letter-spacing: -0.2px;
  }
  .compare-title p { font-size: 11.5px; color: #64748B; margin: 0; }

  .plans-grid {
    display: grid; gap: 10px;
    grid-template-columns: ${gridCols};
  }
  .plan-card {
    background: #fff; border: 1px solid #E8ECF4; border-radius: 14px;
    padding: 14px; position: relative;
    box-shadow: 0 4px 12px rgba(15,23,42,0.04);
  }
  .plan-card.highlight {
    border: 2px solid #1B4DA1;
    box-shadow: 0 8px 22px rgba(27,77,161,0.15);
  }
  .plan-card-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px;
  }
  .plan-name { font-size: 13px; font-weight: 800; color: #1B4DA1; }
  .badge {
    font-size: 9px; font-weight: 800; padding: 3px 7px; border-radius: 999px;
  }
  .badge.selected { background: #1B4DA1; color: #fff; }
  .badge.popular { background: #F7963D; color: #fff; }
  .plan-price {
    display: flex; align-items: baseline; gap: 2px;
    margin: 4px 0 12px; padding-bottom: 10px; border-bottom: 1px solid #F0F4FA;
  }
  .plan-price small { font-size: 11px; color: #64748B; font-weight: 600; }
  .plan-price b { font-size: 22px; font-weight: 900; color: #121A33; letter-spacing: -0.5px; line-height: 1; }
  .plan-price em { font-size: 11px; color: #64748B; font-weight: 600; font-style: normal; margin-left: 2px; }

  .plan-card ul.features li { font-size: 10px; padding: 2px 0; gap: 6px; }
  .plan-card ul.features li .dot { width: 13px; height: 13px; font-size: 8px; }

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

  <!-- ============ PÁGINA 1: Plano selecionado ============ -->
  <div class="page">

    <div class="header">
      ${logoUrl
        ? `<img src="${logoUrl}" class="brand-logo" alt="21Go Proteção Veicular"/>`
        : `<div style="font-weight:900;font-size:24px;color:#1B4DA1;">21Go</div>`}
      <div class="meta">
        <b>Simulação de Proteção Veicular</b><br/>
        Emitida em ${hoje} &middot; válida até ${validade}
      </div>
    </div>

    <div class="title">
      <h1>${input.nome.split(' ')[0].toUpperCase()}, sua simulação está pronta!</h1>
      <p>${veiculoTitulo} — ${placaLine}FIPE: <b>R$ ${formatBRL(input.fipe)}</b></p>
    </div>

    <div class="veic">
      <div class="left">
        <b>${veiculoTitulo}</b>
        <span>${input.placa ? `Placa ${input.placa}` : 'Sem placa informada'}${input.cor ? ' &middot; ' + input.cor : ''}</span>
      </div>
      <div class="fipe">
        <span>Valor FIPE</span>
        <b>R$ ${formatBRL(input.fipe)}</b>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="plan-tab">
          <div>
            <div class="pname">${input.planoNome}</div>
            <div class="pdesc">Plano selecionado por você</div>
          </div>
          <span class="pflag">SELECIONADO</span>
        </div>
        <div class="beneficios-title">Benefícios incluídos</div>
        <ul class="features">${
          (PLAN_INFO[planoEscolhidoId as keyof typeof PLAN_INFO]?.features || [])
            .map((f) =>
              f.included
                ? `<li class="feat yes"><span class="dot ok">&#10003;</span>${f.text}</li>`
                : `<li class="feat no"><span class="dot no">&#215;</span>${f.text}</li>`,
            )
            .join('')
        }</ul>
      </div>

      <div class="card price-card">
        <div class="price-head">
          <div class="label">Plano ${input.planoNome}</div>
          <div class="price"><small>R$</small> ${formatBRL(mensalidade)}<em>/mês</em></div>
        </div>

        <div class="box laranja">
          <div class="box-head">
            <b>1º pagamento</b>
            <span class="amount">R$ ${formatBRL(taxa)}</span>
          </div>
          <div class="sub">Taxa de ativação — pagamento único</div>
        </div>

        <div class="box verde">
          <div class="box-head">
            <b>2º pagamento</b>
            <span class="due">vence ${dueDate}</span>
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
        <div class="susep">&#128274; SUSEP — LC 213/2025</div>
      </div>
    </div>

    <div class="footer">
      <div>
        <b>21Go Proteção Veicular</b> &middot; Rio de Janeiro — RJ<br/>
        WhatsApp (21) 97903-4169 &middot; 21go.site
      </div>
      <div class="right">
        Simulação válida até <b>${validade}</b>
        <span class="pill">20 anos no Rio</span>
      </div>
    </div>

  </div>

  <!-- ============ PÁGINA 2: Comparativo de todos os planos ============ -->
  ${planosAplicaveis.length > 1 ? `
  <div class="page page-break">

    <div class="header">
      ${logoUrl
        ? `<img src="${logoUrl}" class="brand-logo" alt="21Go Proteção Veicular"/>`
        : `<div style="font-weight:900;font-size:24px;color:#1B4DA1;">21Go</div>`}
      <div class="meta">
        <b>Compare os planos disponíveis</b><br/>
        Para o ${veiculoTitulo}
      </div>
    </div>

    <div class="compare-title">
      <h2>Todos os planos para o seu veículo</h2>
      <p>Cada plano tem cobertura diferente. Escolha o que faz mais sentido pra você.</p>
    </div>

    <div class="plans-grid">
      ${comparativoCards}
    </div>

    <div class="footer">
      <div>
        <b>21Go Proteção Veicular</b> &middot; Rio de Janeiro — RJ<br/>
        WhatsApp (21) 97903-4169 &middot; 21go.site
      </div>
      <div class="right">
        Simulação válida até <b>${validade}</b>
        <span class="pill">20 anos no Rio</span>
      </div>
    </div>

  </div>
  ` : ''}

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
