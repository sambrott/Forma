'use client'

import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'
import { takePendingFile } from '@/lib/pending-file'

export default function CompressPDFPage() {
  const [level, setLevel] = useState('medium')
  const { state, process, reset } = useTool('/api/compress-pdf')
  const [showResult, setShowResult] = useState(false)
  const levelRef = useRef(level)
  levelRef.current = level

  const isProcessing = state.status === 'uploading' || state.status === 'processing'
  const isComplete = state.status === 'done'

  useEffect(() => {
    const pending = takePendingFile()
    if (pending) process(pending, { level: levelRef.current })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => setShowResult(true), 350)
      return () => clearTimeout(t)
    }
    setShowResult(false)
  }, [isComplete])

  function handleFiles(files: File[]) {
    process(files[0], { level })
  }

  function handleReset() {
    setShowResult(false)
    reset()
  }

  return (
    <ToolPageLayout title="Compress PDF" description="Reduce PDF file size without losing quality. Choose your compression level.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".pdf" onFiles={handleFiles} label="Drop your PDF here" hint="PDF files up to 100 MB free · No sign-up" />
          <ToolOptions>
            <OptionRow label="Compression level" hint="Higher = smaller file, slightly lower quality">
              <select className="select" style={{ width: 'auto' }} value={level} onChange={e => setLevel(e.target.value)}>
                <option value="low">Low — minimal</option>
                <option value="medium">Medium — recommended</option>
                <option value="high">High — maximum</option>
              </select>
            </OptionRow>
          </ToolOptions>
        </>
      )}
      <ProgressBar
        active={isProcessing}
        complete={isComplete}
        stages={['Uploading PDF', 'Compressing pages', 'Optimising images', 'Finalising']}
      />
      {showResult && state.result && (
        <ResultBox
          title="Compressed"
          conversion={`${level.charAt(0).toUpperCase() + level.slice(1)} compression`}
          downloadUrl={state.result.url}
          downloadName={state.result.filename}
          originalSize={state.result.originalSize}
          outputSize={state.result.outputSize}
          onReset={handleReset}
        />
      )}
      {state.status === 'error' && (
        <div>
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {state.error}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={handleReset}>Try again</button>
        </div>
      )}
    </ToolPageLayout>
  )
}
