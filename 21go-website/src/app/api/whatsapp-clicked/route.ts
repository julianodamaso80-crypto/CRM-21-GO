import { NextRequest, NextResponse } from 'next/server'

// In-memory set to track leads that clicked WhatsApp
// Entries auto-expire after 10 minutes (cleanup on each request)
const clickedLeads = new Map<string, number>()

function cleanup() {
  const now = Date.now()
  const TEN_MINUTES = 10 * 60 * 1000
  for (const [key, timestamp] of clickedLeads) {
    if (now - timestamp > TEN_MINUTES) {
      clickedLeads.delete(key)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, whatsapp } = body

    // Use leadId if available, otherwise use whatsapp as identifier
    const identifier = leadId || whatsapp

    if (!identifier) {
      return NextResponse.json({ success: false, error: 'leadId or whatsapp required' }, { status: 400 })
    }

    cleanup()
    clickedLeads.set(identifier, Date.now())

    return NextResponse.json({ success: true, clicked: true })
  } catch (err: any) {
    console.error('[WhatsAppClicked API]', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const identifier = searchParams.get('id')

  if (!identifier) {
    return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
  }

  cleanup()
  const clicked = clickedLeads.has(identifier)

  return NextResponse.json({ success: true, clicked })
}
