import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { PLAN_INFO, planIdFromName } from './plan-features'

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
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function addDaysBR(date: Date, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('pt-BR')
}

function renderHTML(input: QuotePdfInput): string {
  const planId = planIdFromName(input.planoNome)
  const info = PLAN_INFO[planId]
  const features = info?.features || []

  const taxa = input.taxaAtivacao ?? 399
  const mensalidade = input.mensalidade
  const descontoEarly = mensalidade * 0.95
  const stickerPct = 15
  const comAdesivo = mensalidade * (1 - stickerPct / 100)
  const adesivoMaisEmDia = comAdesivo * 0.95

  const dueDate = addDaysBR(new Date(), 30)
  const validade = addDaysBR(new Date(), 7)
  const hoje = new Date().toLocaleDateString('pt-BR')

  const placaLine = input.placa ? `Placa: <b>${input.placa}</b> — ` : ''
  const corLine = input.cor ? `${input.cor.toUpperCase()} — ` : ''
  const veiculoTitulo = `${input.marca} ${input.modelo} ${input.ano}`.trim()

  const featuresHTML = features
    .map((f) => {
      if (f.included) {
        return `<li class="feat yes"><span class="dot ok">&#10003;</span>${f.text}</li>`
      }
      return `<li class="feat no"><span class="dot no">&#215;</span>${f.text}</li>`
    })
    .join('')

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
  .page { width: 210mm; padding: 14mm 14mm 10mm; }

  /* HEADER */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 2px solid #E8ECF4;
    margin-bottom: 18px;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand .logo {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg,#1B4DA1 0%,#2563EB 100%);
    color: #fff; font-weight: 900; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 10px rgba(27,77,161,0.25);
  }
  .brand .name { font-size: 20px; font-weight: 800; color: #121A33; }
  .brand .name span { color: #F7963D; }
  .header .meta { text-align: right; font-size: 11px; color: #64748B; line-height: 1.4; }
  .header .meta b { color: #121A33; font-weight: 700; }

  /* TITLE */
  .title {
    text-align: center;
    margin: 6px 0 18px;
  }
  .title h1 {
    font-size: 24px; font-weight: 800; color: #121A33; margin: 0 0 4px;
    letter-spacing: -0.3px;
  }
  .title p {
    font-size: 13px; color: #64748B; margin: 0;
  }
  .title p b { color: #121A33; }

  /* Vehicle strip */
  .veic {
    background: #fff; border: 1px solid #E8ECF4;
    border-radius: 14px; padding: 14px 18px; margin-bottom: 14px;
    display: flex; align-items: center; justify-content: space-between;
    box-shadow: 0 6px 18px rgba(15,23,42,0.04);
  }
  .veic .left b { font-size: 14px; color: #121A33; display: block; margin-bottom: 2px; }
  .veic .left span { font-size: 12px; color: #64748B; }
  .veic .fipe { text-align: right; }
  .veic .fipe span { font-size: 11px; color: #64748B; display: block; }
  .veic .fipe b { font-size: 16px; color: #1B4DA1; font-weight: 800; }

  /* GRID */
  .grid { display: grid; grid-template-columns: 1fr 260px; gap: 14px; }

  /* LEFT — Plano + Benefícios */
  .card {
    background: #fff; border: 1px solid #E8ECF4;
    border-radius: 16px; padding: 18px;
    box-shadow: 0 6px 18px rgba(15,23,42,0.04);
  }
  .plan-tab {
    background: #F0F4FA; border-radius: 12px; padding: 6px;
    text-align: center; margin-bottom: 14px;
  }
  .plan-tab b {
    display: inline-block; padding: 8px 14px;
    background: #fff; border-radius: 9px;
    font-weight: 700; font-size: 13px;
    box-shadow: 0 2px 6px rgba(15,23,42,0.06);
  }
  .beneficios-title {
    font-weight: 700; font-size: 13px; color: #121A33; margin-bottom: 10px;
  }
  ul.features { list-style: none; padding: 0; margin: 0; }
  ul.features li {
    display: flex; align-items: center; gap: 10px;
    font-size: 11.5px; padding: 4px 0;
  }
  ul.features li .dot {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 50%;
    font-size: 10px; font-weight: 900;
  }
  ul.features li .dot.ok { background: rgba(16,185,129,0.12); color: #10B981; }
  ul.features li .dot.no { background: #F0F4FA; color: #CBD5E1; }
  ul.features li.no { color: #CBD5E1; text-decoration: line-through; }
  ul.features li.yes { color: #121A33; font-weight: 500; }

  /* RIGHT — Preço */
  .price-card { padding: 16px; }
  .price-head { text-align: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #E8ECF4; }
  .price-head .label { font-size: 11px; color: #64748B; margin-bottom: 4px; }
  .price-head .price { font-size: 34px; font-weight: 900; color: #121A33; letter-spacing: -1px; line-height: 1; }
  .price-head .price small { font-size: 13px; color: #64748B; font-weight: 600; }
  .price-head .price em { font-size: 13px; color: #64748B; font-weight: 600; font-style: normal; }

  .box { border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; }
  .box-head { display: flex; justify-content: space-between; align-items: center; }
  .box-head b { font-size: 12px; font-weight: 700; color: #121A33; }

  .box.laranja { background: #FFF7ED; border: 1px solid rgba(247,150,61,0.2); }
  .box.laranja .amount { font-size: 16px; font-weight: 900; color: #F7963D; }
  .box.laranja .sub { font-size: 10px; color: #F7963D; font-weight: 600; margin-top: 2px; }

  .box.verde { background: #F0FDF4; border: 1px solid rgba(16,185,129,0.2); }
  .box.verde .row2 { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .box.verde .due { font-size: 10px; color: #64748B; }
  .box.verde .amount { font-size: 16px; font-weight: 900; color: #10B981; }
  .box.verde .old { font-size: 10px; color: #94A3B8; text-decoration: line-through; margin-right: 6px; }
  .box.verde .sub { font-size: 10px; color: #10B981; font-weight: 600; text-align: right; margin-top: 2px; }

  .box.mensal { background: #F8FAFC; border: 1px solid #E2E8F0; }
  .box.mensal .amount { font-size: 17px; font-weight: 900; color: #121A33; }
  .box.mensal .amount small { font-size: 10px; color: #64748B; font-weight: 500; }

  /* ADESIVO */
  .adesivo {
    border: 1.5px solid #F7963D;
    border-radius: 14px; padding: 12px; margin-top: 10px;
    background: #fff;
  }
  .adesivo-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .adesivo-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(247,150,61,0.1); color: #F7963D;
    display: flex; align-items: center; justify-content: center; font-size: 16px;
  }
  .adesivo-title { flex: 1; }
  .adesivo-title b { display: block; font-size: 11px; color: #121A33; font-weight: 700; }
  .adesivo-title span { display: block; font-size: 9px; color: #64748B; }
  .adesivo-pct {
    background: #F7963D; color: #fff;
    font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px;
  }
  .adesivo-values { background: #FFF7ED; border-radius: 10px; padding: 10px; }
  .adesivo-values .row { display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
  .adesivo-values .row span { color: #64748B; font-weight: 500; }
  .adesivo-values .row s { color: #94A3B8; font-size: 10px; margin-right: 6px; }
  .adesivo-values .laranja { color: #F7963D; font-size: 14px; font-weight: 900; }
  .adesivo-values .verde { color: #10B981; font-size: 14px; font-weight: 900; }
  .adesivo-values .divider { height: 1px; background: rgba(247,150,61,0.15); margin: 8px 0; }
  .adesivo-foot { font-size: 9px; color: #94A3B8; text-align: center; margin-top: 6px; }

  /* CTA */
  .cta {
    margin-top: 14px;
    background: linear-gradient(90deg,#F7963D,#F9A95E);
    color: #fff; font-weight: 800; font-size: 13px;
    text-align: center; padding: 12px; border-radius: 999px;
    box-shadow: 0 6px 14px rgba(247,150,61,0.25);
  }
  .susep {
    font-size: 9px; color: #94A3B8;
    text-align: center; margin-top: 8px;
  }

  /* FOOTER */
  .footer {
    margin-top: 18px; padding-top: 12px;
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
  <div class="page">

    <div class="header">
      <div class="brand">
        <div class="logo">21</div>
        <div class="name">21<span>Go</span></div>
      </div>
      <div class="meta">
        <b>Simulação de Proteção Veicular</b><br/>
        Emitida em ${hoje} &middot; válida até ${validade}
      </div>
    </div>

    <div class="title">
      <h1>${input.nome.split(' ')[0]}, sua simulação está pronta!</h1>
      <p>${veiculoTitulo} — ${corLine}${placaLine}FIPE: <b>R$ ${formatBRL(input.fipe)}</b></p>
    </div>

    <div class="veic">
      <div class="left">
        <b>${veiculoTitulo}</b>
        <span>${input.placa ? `Placa ${input.placa}` : 'Sem placa informada'} ${input.cor ? ' &middot; ' + input.cor : ''}</span>
      </div>
      <div class="fipe">
        <span>Valor FIPE</span>
        <b>R$ ${formatBRL(input.fipe)}</b>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="plan-tab"><b>${input.planoNome}</b></div>
        <div class="beneficios-title">Benefícios incluídos</div>
        <ul class="features">${featuresHTML}</ul>
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
</body>
</html>`
}

/* ─────────────────────────────────────────────────────────────────────────
 * Puppeteer — browser reutilizado (singleton) para evitar custo de boot
 * ─────────────────────────────────────────────────────────────────────── */

let browserPromise: Promise<import('puppeteer-core').Browser> | null = null

async function resolveExecutablePath(): Promise<string> {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH
  if (fromEnv) {
    console.log('[PDF] Usando PUPPETEER_EXECUTABLE_PATH:', fromEnv)
    return fromEnv
  }
  console.log('[PDF] Resolvendo Chromium via @sparticuz/chromium...')
  const exec = await chromium.executablePath()
  console.log('[PDF] @sparticuz/chromium executablePath:', exec)
  if (!exec) throw new Error('Chromium executable não encontrado (sparticuz retornou vazio)')
  return exec
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const executablePath = await resolveExecutablePath()
      const args = [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
      ]
      console.log('[PDF] Lançando Chromium (headless)...')
      const t0 = Date.now()
      const browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args,
        defaultViewport: chromium.defaultViewport,
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
