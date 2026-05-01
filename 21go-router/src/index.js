/**
 * 21go-router — Cloudflare Worker que faz proxy reverso
 *
 * Roteamento:
 *   21go.site/dash*            → 21-go-site-tracking.pages.dev (stack tracking)
 *   21go.site/tracker          → stack
 *   21go.site/checkout-session → stack
 *   21go.site/webhook/*        → stack
 *   21go.site/api/sync/*       → stack
 *   21go.site/scripts/*        → stack (gtag.js proxy)
 *
 * Demais paths (homepage, /cotacao, /blog, /vendas etc.) NÃO passam por aqui
 * — vão direto pro origin (Vercel) via DNS proxy normal.
 *
 * Esse Worker está bound apenas nas rotas listadas em wrangler.toml; outros
 * paths nem invocam o Worker.
 */

const STACK_HOST = '21-go-site-tracking.pages.dev'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const originalHost = url.hostname

    // Reescreve host pra apontar pro Pages stack
    url.hostname = STACK_HOST
    url.protocol = 'https:'
    url.port = ''

    // Clona request preservando method, headers, body
    const upstreamHeaders = new Headers(request.headers)
    // Mantém o host original em X-Forwarded-Host pra debug
    upstreamHeaders.set('x-forwarded-host', originalHost)
    upstreamHeaders.set('x-forwarded-proto', 'https')

    const upstreamRequest = new Request(url.toString(), {
      method: request.method,
      headers: upstreamHeaders,
      body: request.body,
      redirect: 'manual',
    })

    let response
    try {
      response = await fetch(upstreamRequest)
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'upstream_fetch_failed', detail: err.message }),
        { status: 502, headers: { 'content-type': 'application/json' } },
      )
    }

    // Retorna response do stack inalterada (cookies já vêm com Set-Cookie do stack)
    return response
  },
}
