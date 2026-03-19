import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Background removal via remove.bg API.
 * Set REMOVE_BG_API_KEY in environment variables.
 * Free tier: 50 previews/month. Paid: from $0.99/100 calls.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRateLimit(ip, FREE_LIMITS.aiUsesPerDay)) {
      return NextResponse.json({ error: 'Daily AI limit reached (3 uses). Upgrade to Pro for unlimited.' }, { status: 429 })
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Background removal is not configured. Please add REMOVE_BG_API_KEY.' }, { status: 503 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()

    const outgoingForm = new FormData()
    outgoingForm.append('image_file', new Blob([bytes], { type: file.type }), file.name)
    outgoingForm.append('size', 'auto')

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: outgoingForm,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('remove.bg error:', errText)
      return NextResponse.json({ error: 'Background removal failed. Please try again.' }, { status: 500 })
    }

    const resultBuffer = Buffer.from(await res.arrayBuffer())

    return new NextResponse(new Uint8Array(resultBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="forma-nobg.png"`,
        'X-Forma-Original-Size': String(bytes.byteLength),
        'X-Forma-Output-Size': String(resultBuffer.length),
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    console.error('remove-background error:', err)
    return NextResponse.json({ error: 'Background removal failed. Please try again.' }, { status: 500 })
  }
}
