import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'
import { getAnthropic } from '@/lib/anthropic'
import { FREE_LIMITS } from '@/lib/limits'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { checkAILimit } from '@/lib/check-ai-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Sign in required to use AI tools.', requiresAuth: true }, { status: 401 })
      }

      const limit = await checkAILimit(user.id, 'summarise-doc')
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
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const parsed = await pdf(buffer)
    const text = parsed.text.slice(0, 50000)

    const client = getAnthropic()
    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
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
