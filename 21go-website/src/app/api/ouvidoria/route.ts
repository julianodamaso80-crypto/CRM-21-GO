import { NextRequest, NextResponse } from 'next/server'

const CRM_API = process.env.BACKEND_URL || 'https://crm-21-go-production.up.railway.app'
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || '21go'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'D09EE8166A35-40C2-8BAD-B3BC81C7613E'
const NOTIFY_NUMBER = '5521980214882'

async function notifyJuliano(text: string) {
  if (!EVOLUTION_API_URL) return
  try {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY },
      body: JSON.stringify({ number: NOTIFY_NUMBER, text }),
    })
  } catch {}
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    // Denúncia anônima (JSON)
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const { tipo, assunto, comentario } = body

      if (tipo !== 'denuncia' || !assunto || !comentario) {
        return NextResponse.json({ success: false, error: 'Campos obrigatórios' }, { status: 400 })
      }

      // Salvar no CRM backend
      try {
        await fetch(`${CRM_API}/api/ouvidoria`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo: 'denuncia', assunto, comentario }),
        })
      } catch {}

      // Notificar Juliano
      await notifyJuliano(
        `🚨 *DENÚNCIA ANÔNIMA — 21Go*\n\n` +
        `*Assunto:* ${assunto}\n\n` +
        `*Descrição:*\n${comentario}\n\n` +
        `⚠️ Canal anônimo — sem dados do denunciante.`
      )

      return NextResponse.json({ success: true })
    }

    // Reclamação/Sugestão (FormData com possíveis arquivos)
    const formData = await request.formData()
    const nome = formData.get('nome') as string
    const telefone = formData.get('telefone') as string
    const tipo = formData.get('tipo') as string
    const mensagem = formData.get('mensagem') as string
    const arquivos = formData.getAll('arquivos') as File[]

    if (!nome || !telefone || !mensagem) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios' }, { status: 400 })
    }

    // Converter arquivos pra base64 pra salvar no banco
    const fileNames: string[] = []
    for (const file of arquivos) {
      if (file && file.size > 0) {
        fileNames.push(file.name)
      }
    }

    // Salvar no CRM backend
    try {
      await fetch(`${CRM_API}/api/ouvidoria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          nome,
          telefone,
          mensagem,
          arquivos: fileNames,
        }),
      })
    } catch {}

    // Notificar Juliano
    const emoji = tipo === 'reclamacao' ? '🔴' : '💡'
    const tipoLabel = tipo === 'reclamacao' ? 'RECLAMAÇÃO' : 'SUGESTÃO'

    await notifyJuliano(
      `${emoji} *${tipoLabel} — 21Go Ouvidoria*\n\n` +
      `*Nome:* ${nome}\n` +
      `*Telefone:* ${telefone}\n` +
      `${fileNames.length > 0 ? `*Arquivos:* ${fileNames.length} arquivo(s)\n` : ''}` +
      `\n*Mensagem:*\n${mensagem}`
    )

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Ouvidoria API]', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
