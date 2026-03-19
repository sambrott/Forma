import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import { getAnthropic } from '@/lib/anthropic'
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

    const client = getAnthropic()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Summarise the following document. Return ONLY valid JSON with this exact structure: { "overview": "2-3 sentence overview", "themes": ["theme 1", "theme 2"], "conclusions": ["conclusion 1", "conclusion 2"] }. Be concise and professional.\n\n${text}`,
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response.' }, { status: 500 })
    }

    const summary = JSON.parse(jsonMatch[0])

    return NextResponse.json(summary)
  } catch (err) {
    console.error('summarise-doc error:', err)
    return NextResponse.json({ error: 'Failed to summarise document. Please try again.' }, { status: 500 })
  }
}
