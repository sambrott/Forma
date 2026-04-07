import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { deleteFile } from '@/lib/delete-file'
import { FREE_LIMITS } from '@/lib/limits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

function runTrim(input: string, output: string, start: number, end: number): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime(start)
      .setDuration(end - start)
      .outputOptions('-c', 'copy')
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

    const start = parseFloat((formData.get('start') as string) || '0')
    const end = parseFloat((formData.get('end') as string) || '30')
    if (end <= start) {
      return NextResponse.json({ error: 'End time must be after start time.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'mp4'
    const bytes = await file.arrayBuffer()
    tmpInput = `/tmp/${Date.now()}-input.${ext}`
    tmpOutput = `/tmp/${Date.now()}-trimmed.${ext}`
    await writeFile(tmpInput, Buffer.from(bytes))

    await runTrim(tmpInput, tmpOutput, start, end)

    const outputBuffer = await readFile(tmpOutput)

    const response = new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': `video/${ext === 'mov' ? 'quicktime' : ext}`,
        'Content-Disposition': `attachment; filename="forma-trimmed.${ext}"`,
        'X-Forma-Processed': 'true',
      },
    })
    return response
  } catch (err) {
    console.error('trim-video error:', err)
    return NextResponse.json({ error: 'Video trimming failed. Please try again.' }, { status: 500 })
  } finally {
    if (tmpInput) await deleteFile(tmpInput)
    if (tmpOutput) await deleteFile(tmpOutput)
  }
}
