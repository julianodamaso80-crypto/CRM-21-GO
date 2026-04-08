import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const CRM_API = process.env.BACKEND_URL || 'https://crm-21-go-production.up.railway.app'

const OUVIDORIA_EMAIL = 'ouvidoria21go@gmail.com'
const SMTP_USER = process.env.SMTP_USER || 'ouvidoria21go@gmail.com'
const SMTP_PASS = process.env.SMTP_PASS || ''

async function sendEmail(subject: string, html: string) {
  if (!SMTP_PASS) {
    console.warn('[Ouvidoria] SMTP_PASS não configurado, email não enviado')
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  await transporter.sendMail({
    from: `"21Go Ouvidoria" <${SMTP_USER}>`,
    to: OUVIDORIA_EMAIL,
    subject,
    html,
  })
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

      // Enviar email
      const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      await sendEmail(
        `🚨 Denúncia Anônima — ${assunto}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A1E3D; padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0;">🚨 Denúncia Anônima</h2>
            <p style="color: rgba(255,255,255,0.6); margin: 5px 0 0;">Canal de Ouvidoria 21Go</p>
          </div>
          <div style="background: #f8f9fa; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 8px;"><strong>Assunto:</strong> ${assunto}</p>
            <p style="margin: 0 0 8px;"><strong>Data:</strong> ${now}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="margin: 0 0 4px;"><strong>Descrição:</strong></p>
            <p style="margin: 0; white-space: pre-wrap; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${comentario}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">⚠️ Canal 100% anônimo — nenhum dado pessoal coletado.</p>
          </div>
        </div>
        `,
      ).catch((err) => console.error('[Ouvidoria Email]', err.message))

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
        body: JSON.stringify({ tipo, nome, telefone, mensagem, arquivos: fileNames }),
      })
    } catch {}

    // Enviar email
    const emoji = tipo === 'reclamacao' ? '🔴' : '💡'
    const tipoEmailLabel = tipo === 'reclamacao' ? 'Reclamação' : 'Sugestão'
    const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

    await sendEmail(
      `${emoji} ${tipoEmailLabel} — ${nome}`,
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${tipo === 'reclamacao' ? '#DC2626' : '#1B4DA1'}; padding: 20px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0;">${emoji} ${tipoEmailLabel}</h2>
          <p style="color: rgba(255,255,255,0.6); margin: 5px 0 0;">Canal de Ouvidoria 21Go</p>
        </div>
        <div style="background: #f8f9fa; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="margin: 0 0 8px;"><strong>Nome:</strong> ${nome}</p>
          <p style="margin: 0 0 8px;"><strong>Telefone:</strong> ${telefone}</p>
          <p style="margin: 0 0 8px;"><strong>Data:</strong> ${now}</p>
          ${fileNames.length > 0 ? `<p style="margin: 0 0 8px;"><strong>Arquivos anexados:</strong> ${fileNames.join(', ')}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="margin: 0 0 4px;"><strong>Mensagem:</strong></p>
          <p style="margin: 0; white-space: pre-wrap; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${mensagem}</p>
        </div>
      </div>
      `,
    ).catch((err) => console.error('[Ouvidoria Email]', err.message))

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Ouvidoria API]', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
