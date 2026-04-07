'use client'

import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import { useTool } from '@/lib/use-tool'
import { takePendingFile } from '@/lib/pending-file'

export default function TranscribeAudioPage() {
  const [outputFormat, setOutputFormat] = useState('text')
  const { state, process, reset } = useTool('/api/transcribe-audio')
  const [showResult, setShowResult] = useState(false)
  const outputFormatRef = useRef(outputFormat)
  outputFormatRef.current = outputFormat

  const isProcessing = state.status === 'uploading' || state.status === 'processing'
  const isComplete = state.status === 'done'

  const transcript = state.result?.data as { text: string } | undefined

  useEffect(() => {
    const pending = takePendingFile()
    if (pending) process(pending, { format: outputFormatRef.current })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => setShowResult(true), 350)
      return () => clearTimeout(t)
    }
    setShowResult(false)
  }, [isComplete])

  function handleReset() {
    setShowResult(false)
    reset()
  }

  return (
    <ToolPageLayout title="Transcribe Audio" description="Accurate transcript from audio or video using AI.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".mp3,.wav,.m4a,.mp4,.webm" onFiles={files => process(files[0], { format: outputFormat })} label="Drop your audio or video" hint="MP3 · WAV · M4A · MP4 · WebM · up to 100 MB" />
          <ToolOptions>
            <OptionRow label="Output format">
              <select className="select" style={{ width: 'auto' }} value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
                <option value="text">Plain text</option>
                <option value="srt">SRT subtitles</option>
                <option value="vtt">VTT subtitles</option>
              </select>
            </OptionRow>
          </ToolOptions>
        </>
      )}
      <ProgressBar
        active={isProcessing}
        complete={isComplete}
        stages={['Uploading audio', 'Transcribing speech', 'Formatting transcript', 'Almost done']}
      />
      {showResult && transcript && (
        <div className="result-box" style={{ textAlign: 'left' }}>
          <div className="result-title" style={{ textAlign: 'center' }}>Transcribed ✓</div>
          <textarea className="code-area" style={{ marginTop: 20, minHeight: 200 }} value={transcript.text} readOnly />
          <div className="result-actions" style={{ marginTop: 16, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(transcript.text) }}>Copy transcript</button>
            <button className="btn btn-ghost" onClick={handleReset}>Transcribe another</button>
          </div>
        </div>
      )}
      {state.status === 'error' && (
        <div>
          <div className="alert alert-error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{state.error}</div>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={handleReset}>Try again</button>
        </div>
      )}
    </ToolPageLayout>
  )
}
