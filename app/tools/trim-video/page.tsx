'use client'

import { useState, useEffect } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function TrimVideoPage() {
  const [start, setStart] = useState('0')
  const [end, setEnd] = useState('30')
  const { state, process, reset } = useTool('/api/trim-video')
  const [showResult, setShowResult] = useState(false)

  const isProcessing = state.status === 'uploading' || state.status === 'processing'
  const isComplete = state.status === 'done'

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
    <ToolPageLayout title="Trim Video" description="Cut a video to exact start and end times.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".mp4,.mov,.avi,.mkv,.webm" onFiles={files => process(files[0], { start, end })} label="Drop your video here" hint="MP4 · MOV · AVI · MKV · WebM · up to 100 MB" />
          <ToolOptions>
            <OptionRow label="Start time (seconds)">
              <input className="input" style={{ width: 100 }} type="number" min={0} value={start} onChange={e => setStart(e.target.value)} />
            </OptionRow>
            <OptionRow label="End time (seconds)">
              <input className="input" style={{ width: 100 }} type="number" min={0} value={end} onChange={e => setEnd(e.target.value)} />
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
        <ResultBox title="Trimmed" downloadUrl={state.result.url} downloadName={state.result.filename} onReset={handleReset} />
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
