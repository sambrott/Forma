import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { createReadStream } from 'fs'
import { getOpenAI } from '@/lib/openai'
import { deleteFile } from '@/lib/delete-file'
import { FREE_LIMITS } from '@/lib/limits'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  let tmpPath = ''
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Sign in required to use AI tools.', requiresAuth: true }, { status: 401 })
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const format = (formData.get('format') as string) || 'text'
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    tmpPath = `/tmp/${Date.now()}-${file.name}`
    await writeFile(tmpPath, buffer)

    const openai = getOpenAI()
    const responseFormat = format === 'srt' ? 'srt' : format === 'vtt' ? 'vtt' : 'text'

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tmpPath) as any,
      model: 'whisper-1',
      response_format: responseFormat,
    })

    const text = typeof transcription === 'string' ? transcription : (transcription as any).text || ''
    return NextResponse.json({ text })
  } catch (err) {
    console.error('transcribe-audio error:', err)
    return NextResponse.json({ error: 'Transcription failed. Please try again.' }, { status: 500 })
  } finally {
    if (tmpPath) await deleteFile(tmpPath)
  }
}
