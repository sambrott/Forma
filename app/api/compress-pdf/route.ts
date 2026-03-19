import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { deleteFile } from '@/lib/delete-file'
import { FREE_LIMITS } from '@/lib/limits'
import { checkCookieRateLimit, setUsageCookie } from '@/lib/rate-limit-cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const rateLimit = checkCookieRateLimit(req, 'compress-pdf')
  if (!rateLimit.allowed) {
    return NextResponse.json({
      error: `Daily limit reached. Free users get ${rateLimit.limit} uses per day.`,
      resetAt: rateLimit.resetAt,
      upgrade: true,
    }, { status: 429 })
  }

  const tmpPaths: string[] = []
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const level = (formData.get('level') as string) || 'medium'
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const originalSize = buffer.length

    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    const savedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: level === 'high' ? 20 : level === 'low' ? 100 : 50,
    })

    const outputBuffer = Buffer.from(savedBytes)

    const response = new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="forma-compressed.pdf"`,
        'X-Forma-Original-Size': String(originalSize),
        'X-Forma-Output-Size': String(outputBuffer.length),
        'X-Forma-Processed': 'true',
      },
    })
    setUsageCookie(response, req, 'compress-pdf')
    return response
  } catch (err) {
    console.error('compress-pdf error:', err)
    return NextResponse.json({ error: 'Failed to compress PDF. Please try again.' }, { status: 500 })
  } finally {
    for (const p of tmpPaths) await deleteFile(p)
  }
}
