import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import ExcelJS from 'exceljs'
import { getAnthropicClient } from '@/lib/anthropic'
import { checkRateLimit } from '@/lib/rate-limit'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
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
    const buffer = Buffer.from(bytes)
    const parsed = await pdf(buffer)
    const text = parsed.text.slice(0, 50000)

    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Extract all tables and structured data from the following PDF text. Return ONLY valid JSON: { "sheets": [{ "name": "string", "headers": ["string"], "rows": [["string"]] }] }\n\n${text}`,
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to extract tables from document.' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    const workbook = new ExcelJS.Workbook()

    for (const sheet of data.sheets || []) {
      const ws = workbook.addWorksheet(sheet.name || 'Sheet')
      if (sheet.headers?.length) ws.addRow(sheet.headers)
      for (const row of sheet.rows || []) ws.addRow(row)
    }

    const xlsxBuffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(new Uint8Array(xlsxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="forma-export.xlsx"`,
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    console.error('pdf-to-excel error:', err)
    return NextResponse.json({ error: 'Failed to extract data. Please try again.' }, { status: 500 })
  }
}
