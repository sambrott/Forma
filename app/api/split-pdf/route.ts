import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const maxDuration = 60

function parseRanges(rangeStr: string, totalPages: number): number[][] {
  if (!rangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => [i])
  }
  const groups: number[][] = []
  for (const part of rangeStr.split(',')) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(s => parseInt(s.trim(), 10) - 1)
      const pages: number[] = []
      for (let i = Math.max(0, start); i <= Math.min(totalPages - 1, end); i++) pages.push(i)
      if (pages.length) groups.push(pages)
    } else {
      const idx = parseInt(trimmed, 10) - 1
      if (idx >= 0 && idx < totalPages) groups.push([idx])
    }
  }
  return groups
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const ranges = (formData.get('ranges') as string) || ''
    const bytes = await file.arrayBuffer()
    const srcPdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const pageGroups = parseRanges(ranges, srcPdf.getPageCount())

    const zip = new JSZip()

    for (let i = 0; i < pageGroups.length; i++) {
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(srcPdf, pageGroups[i])
      pages.forEach(p => newPdf.addPage(p))
      const pdfBytes = await newPdf.save()
      zip.file(`split-${i + 1}.pdf`, pdfBytes)
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="forma-split.zip"`,
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    console.error('split-pdf error:', err)
    return NextResponse.json({ error: 'Failed to split PDF. Please try again.' }, { status: 500 })
  }
}
