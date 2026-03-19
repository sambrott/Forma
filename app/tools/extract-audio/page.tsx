'use client'

import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'
import { takePendingFile } from '@/lib/pending-file'

export default function ExtractAudioPage() {
  const [format, setFormat] = useState('mp3')
  const [bitrate, setBitrate] = useState('192')
  const { state, process, reset } = useTool('/api/extract-audio')
  const [showResult, setShowResult] = useState(false)
  const formatRef = useRef(format)
  const bitrateRef = useRef(bitrate)
  formatRef.current = format
  bitrateRef.current = bitrate

  const isProcessing = state.status === 'uploading' || state.status === 'processing'
  const isComplete = state.status === 'done'

  useEffect(() => {
    const pending = takePendingFile()
    if (pending) process(pending, { format: formatRef.current, bitrate: bitrateRef.current })
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
    <ToolPageLayout title="Extract Audio" description="Pull the audio track from any video file as MP3, WAV, or AAC.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".mp4,.mov,.avi,.mkv,.webm" onFiles={files => process(files[0], { format, bitrate })} label="Drop your video here" hint="MP4 · MOV · AVI · MKV · WebM — up to 100 MB" />
          <ToolOptions>
            <OptionRow label="Audio format">
              <select className="select" style={{ width: 'auto' }} value={format} onChange={e => setFormat(e.target.value)}>
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="aac">AAC</option>
              </select>
            </OptionRow>
            <OptionRow label="Bitrate">
              <select className="select" style={{ width: 'auto' }} value={bitrate} onChange={e => setBitrate(e.target.value)}>
                <option value="128">128 kbps</option>
                <option value="192">192 kbps</option>
                <option value="320">320 kbps (Pro)</option>
              </select>
            </OptionRow>
          </ToolOptions>
        </>
      )}
      <ProgressBar
        active={isProcessing}
        complete={isComplete}
        stages={['Uploading file', 'Processing', 'Optimising', 'Almost done']}
      />
      {showResult && state.result && (
        <ResultBox title="Audio extracted" conversion={`Video → ${format.toUpperCase()}`} downloadUrl={state.result.url} downloadName={state.result.filename} onReset={handleReset} />
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
