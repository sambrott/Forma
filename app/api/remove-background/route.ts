import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRateLimit(ip, FREE_LIMITS.aiUsesPerDay)) {
      return NextResponse.json({ error: 'Daily AI limit reached (3 uses). Upgrade to Pro for unlimited.' }, { status: 429 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const blob = new Blob([bytes], { type: file.type })

    // @imgly/background-removal-node uses dynamic imports internally
    const { removeBackground } = await import('@imgly/background-removal-node')
    const resultBlob = await removeBackground(blob)
    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer())

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
