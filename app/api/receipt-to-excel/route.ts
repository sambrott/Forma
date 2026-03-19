import { NextRequest, NextResponse } from 'next/server'
import { getAnthropic } from '@/lib/anthropic'
import ExcelJS from 'exceljs'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkAILimit } from '@/lib/check-ai-limit'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Sign in required.', requiresAuth: true }, { status: 401 })
      }

      const limit = await checkAILimit(user.id, 'receipt-to-excel')
      if (!limit.allowed) {
        return NextResponse.json({
          error: `Daily limit reached. Free users get ${limit.limit} AI uses per day.`,
          upgrade: true,
        }, { status: 429 })
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const anthropic = getAnthropic()

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Extract all data from this receipt image. Return ONLY valid JSON with no other text:
{
  "vendor": "string",
  "date": "YYYY-MM-DD or empty string if not visible",
  "items": [{ "description": "string", "quantity": null, "amount": 0 }],
  "subtotal": null,
  "tax": null,
  "tip": null,
  "total": null,
  "currency": "USD",
  "payment_method": "string or empty"
}`,
          },
        ],
      }],
    })

    let data: {
      vendor: string
      date: string
      items: Array<{ description: string; quantity: number | null; amount: number }>
      subtotal: number | null
      tax: number | null
      tip: number | null
      total: number | null
      currency: string
      payment_method: string
    }

    try {
      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      data = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'Could not read receipt. Try a clearer image.' }, { status: 422 })
    }

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Receipt')

    sheet.columns = [
      { header: 'Vendor',   key: 'vendor',   width: 22 },
      { header: 'Date',     key: 'date',     width: 14 },
      { header: 'Item',     key: 'item',     width: 30 },
      { header: 'Qty',      key: 'qty',      width: 8  },
      { header: 'Amount',   key: 'amount',   width: 12 },
      { header: 'Tax',      key: 'tax',      width: 10 },
      { header: 'Tip',      key: 'tip',      width: 10 },
      { header: 'Total',    key: 'total',    width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Payment',  key: 'payment',  width: 16 },
    ]

    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0EBE3' } }

    const items = data.items?.length ? data.items : [{ description: 'Total', quantity: null, amount: data.total ?? 0 }]
    items.forEach((item, i) => {
      sheet.addRow({
        vendor:   i === 0 ? data.vendor : '',
        date:     i === 0 ? data.date : '',
        item:     item.description,
        qty:      item.quantity ?? '',
        amount:   item.amount,
        tax:      i === 0 ? (data.tax ?? '') : '',
        tip:      i === 0 ? (data.tip ?? '') : '',
        total:    i === 0 ? (data.total ?? '') : '',
        currency: i === 0 ? data.currency : '',
        payment:  i === 0 ? data.payment_method : '',
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="forma-receipt.xlsx"',
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    console.error('receipt-to-excel error:', err)
    return NextResponse.json({ error: 'Receipt processing failed. Please try again.' }, { status: 500 })
  }
}
