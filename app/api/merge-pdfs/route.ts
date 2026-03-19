import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    if (files.length < 2) {
      return NextResponse.json({ error: 'Please provide at least 2 PDF files.' }, { status: 400 })
    }

    const merged = await PDFDocument.create()

    for (const file of files) {
      if (file.size > FREE_LIMITS.fileSizeBytes) {
        return NextResponse.json({ error: `File "${file.name}" exceeds 100 MB limit.` }, { status: 413 })
      }
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const pages = await merged.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => merged.addPage(page))
    }

    const outputBytes = await merged.save()
    const outputBuffer = Buffer.from(outputBytes)

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="forma-merged.pdf"`,
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    console.error('merge-pdfs error:', err)
    return NextResponse.json({ error: 'Failed to merge PDFs. Please try again.' }, { status: 500 })
  }
}
