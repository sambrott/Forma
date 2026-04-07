import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import convertHeic from 'heic-convert'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isLikelyHeicBuffer(buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (buf.subarray(4, 8).toString('ascii') !== 'ftyp') return false
  const brand = buf.subarray(8, 12).toString('ascii')
  return /heic|heix|hevc|hevx|mif1|msf1|heim|heis|hevm|hevs/.test(brand)
}

function looksHeicFromFile(file: File): boolean {
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return (
    name.endsWith('.heic') ||
    name.endsWith('.heif') ||
    type.includes('heic') ||
    type.includes('heif')
  )
}

/** `vacation.heic` + `jpg` → `vacation-forma.jpg` (safe for Content-Disposition). */
function buildConvertedDownloadName(originalFileName: string, outputExt: string): string {
  const raw = originalFileName.trim() || 'image'
  const lastSeg = raw.split(/[/\\]/).pop() || 'image'
  const dot = lastSeg.lastIndexOf('.')
  const base = dot > 0 ? lastSeg.slice(0, dot) : lastSeg
  const safe =
    base
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\0/g, '')
      .trim()
      .slice(0, 120) || 'image'
  return `${safe}-forma.${outputExt}`
}

/** HEIC/HEIF: decode with heic-convert (works without libheif in sharp). Other formats: pass through if sharp can read them. */
async function prepareInputForSharp(input: Buffer, file: File): Promise<Buffer> {
  if (looksHeicFromFile(file) || isLikelyHeicBuffer(input)) {
    try {
      const decoded = await convertHeic({
        buffer: input,
        format: 'JPEG',
        quality: 0.92,
      })
      return Buffer.isBuffer(decoded) ? decoded : Buffer.from(new Uint8Array(decoded as ArrayBuffer))
    } catch (e) {
      console.error('heic-convert:', e)
      throw new Error('Could not read this HEIC/HEIF file. Try re-exporting from Photos or use a JPG/PNG.')
    }
  }

  try {
    await sharp(input, { failOn: 'none' }).metadata()
    return input
  } catch {
    if (isLikelyHeicBuffer(input)) {
      const decoded = await convertHeic({
        buffer: input,
        format: 'JPEG',
        quality: 0.92,
      })
      return Buffer.isBuffer(decoded) ? decoded : Buffer.from(new Uint8Array(decoded as ArrayBuffer))
    }
    throw new Error('Unsupported or unreadable image.')
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const rawFormat = ((formData.get('format') as string) || 'jpg').toLowerCase()
    const quality = Math.min(100, Math.max(1, parseInt((formData.get('quality') as string) || '85', 10)))

    const originalSize = file.size
    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const preparedBuffer = await prepareInputForSharp(rawBuffer, file)

    const image = sharp(preparedBuffer, { failOn: 'none' }).rotate()

    let outputBuffer: Buffer
    let contentType: string
    let filenameExt: string

    switch (rawFormat) {
      case 'jpg':
      case 'jpeg':
        outputBuffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer()
        contentType = 'image/jpeg'
        filenameExt = 'jpg'
        break
      case 'png': {
        const compressionLevel = Math.max(0, Math.min(9, Math.round(9 - (quality / 100) * 9)))
        outputBuffer = await image.png({ compressionLevel, adaptiveFiltering: true }).toBuffer()
        contentType = 'image/png'
        filenameExt = 'png'
        break
      }
      case 'webp':
        outputBuffer = await image.webp({ quality }).toBuffer()
        contentType = 'image/webp'
        filenameExt = 'webp'
        break
      case 'avif':
        outputBuffer = await image.avif({ quality }).toBuffer()
        contentType = 'image/avif'
        filenameExt = 'avif'
        break
      case 'heic':
      case 'heif': {
        const encodeHeif = (compression: 'hevc' | 'av1') =>
          sharp(preparedBuffer, { failOn: 'none' }).rotate().heif({ quality, compression })
        try {
          outputBuffer = await encodeHeif('hevc').toBuffer()
        } catch (e) {
          console.error('heif hevc:', e)
          try {
            outputBuffer = await encodeHeif('av1').toBuffer()
          } catch (e2) {
            console.error('heif av1:', e2)
            return NextResponse.json(
              {
                error:
                  'HEIC export is unavailable in this environment. Choose JPG, PNG, WebP, or AVIF, or try again locally with full libvips HEIF support.',
              },
              { status: 422 }
            )
          }
        }
        contentType = 'image/heic'
        filenameExt = 'heic'
        break
      }
      case 'tiff':
      case 'tif':
        outputBuffer = await image.tiff({ quality, compression: 'jpeg' }).toBuffer()
        contentType = 'image/tiff'
        filenameExt = 'tiff'
        break
      default:
        return NextResponse.json({ error: `Unsupported output format: ${rawFormat}` }, { status: 400 })
    }

    const downloadName = buildConvertedDownloadName(file.name, filenameExt)
    const asciiFallback = downloadName.replace(/[^\x20-\x7E]/g, '_')
    const disposition = `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'X-Forma-Original-Size': String(originalSize),
        'X-Forma-Output-Size': String(outputBuffer.length),
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to convert image.'
    console.error('convert-image error:', err)
    if (message.includes('Could not read') || message.includes('Unsupported')) {
      return NextResponse.json({ error: message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to convert image. Please try again.' }, { status: 500 })
  }
}
