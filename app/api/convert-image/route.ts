import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', avif: 'image/avif',
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const format = ((formData.get('format') as string) || 'jpg').toLowerCase() as keyof sharp.FormatEnum
    const quality = parseInt((formData.get('quality') as string) || '85', 10)

    const bytes = await file.arrayBuffer()
    const inputBuffer = Buffer.from(bytes)
    const originalSize = inputBuffer.length

    const outputBuffer = await sharp(inputBuffer)
      .toFormat(format, { quality })
      .toBuffer()

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': MIME[format] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="forma-converted.${format}"`,
        'X-Forma-Original-Size': String(originalSize),
        'X-Forma-Output-Size': String(outputBuffer.length),
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    console.error('convert-image error:', err)
    return NextResponse.json({ error: 'Failed to convert image. Please try again.' }, { status: 500 })
  }
}
