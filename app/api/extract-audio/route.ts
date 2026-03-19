import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { deleteFile } from '@/lib/delete-file'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath)

function runFfmpeg(input: string, output: string, format: string, bitrate: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .noVideo()
      .audioCodec(format === 'wav' ? 'pcm_s16le' : format === 'aac' ? 'aac' : 'libmp3lame')
      .audioBitrate(bitrate + 'k')
      .output(output)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run()
  })
}

export async function POST(req: NextRequest) {
  let tmpInput = '', tmpOutput = ''
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      return NextResponse.json({ error: 'File too large. Free limit is 100 MB.' }, { status: 413 })
    }

    const format = (formData.get('format') as string) || 'mp3'
    const bitrate = (formData.get('bitrate') as string) || '192'

    const bytes = await file.arrayBuffer()
    tmpInput = `/tmp/${Date.now()}-input-${file.name}`
    tmpOutput = `/tmp/${Date.now()}-output.${format}`
    await writeFile(tmpInput, Buffer.from(bytes))

    await runFfmpeg(tmpInput, tmpOutput, format, bitrate)

    const outputBuffer = await readFile(tmpOutput)
    const mimeMap: Record<string, string> = { mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac' }

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': mimeMap[format] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="forma-audio.${format}"`,
        'X-Forma-Processed': 'true',
      },
    })
  } catch (err) {
    console.error('extract-audio error:', err)
    return NextResponse.json({ error: 'Audio extraction failed. Please try again.' }, { status: 500 })
  } finally {
    if (tmpInput) await deleteFile(tmpInput)
    if (tmpOutput) await deleteFile(tmpOutput)
  }
}
