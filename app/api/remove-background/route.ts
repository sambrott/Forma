import { NextRequest, NextResponse } from 'next/server'
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

      const limit = await checkAILimit(user.id, 'remove-background')
      if (!limit.allowed) {
        return NextResponse.json({
          error: `Daily limit reached. Free users get ${limit.limit} AI uses per day.`,
          upgrade: true,
        }, { status: 429 })
      }
    }

    const apiKey = process.env.REMOVE_BG_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Background removal is not configured. Please add REMOVE_BG_API_KEY.' }, { status: 503 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()

    const outgoingForm = new FormData()
    outgoingForm.append('image_file', new Blob([bytes], { type: file.type }), file.name)
    outgoingForm.append('size', 'auto')

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: outgoingForm,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('remove.bg error:', errText)
      return NextResponse.json({ error: 'Background removal failed. Please try again.' }, { status: 500 })
    }

    const resultBuffer = Buffer.from(await res.arrayBuffer())

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
