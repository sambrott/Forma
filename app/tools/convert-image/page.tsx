'use client'

import { useState, useEffect, useRef } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'
import { takePendingFile } from '@/lib/pending-file'

export default function ConvertImagePage() {
  const [format, setFormat] = useState('jpg')
  const [quality, setQuality] = useState(85)
  const { state, process, reset } = useTool('/api/convert-image')
  const [showResult, setShowResult] = useState(false)
  const [fromExt, setFromExt] = useState<string | null>(null)

  const formatRef = useRef(format)
  const qualityRef = useRef(quality)
  formatRef.current = format
  qualityRef.current = quality

  const isProcessing = state.status === 'uploading' || state.status === 'processing'
  const isComplete = state.status === 'done'

  const conversion = fromExt
    ? `${fromExt.toUpperCase()} → ${format.toUpperCase()}`
    : null

  useEffect(() => {
    const pending = takePendingFile()
    if (pending) {
      const ext = pending.name.split('.').pop()?.toLowerCase() || ''
      setFromExt(ext)
      process(pending, { format: formatRef.current, quality: String(qualityRef.current) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => setShowResult(true), 350)
      return () => clearTimeout(t)
    }
    setShowResult(false)
  }, [isComplete])

  function handleFiles(files: File[]) {
    const file = files[0]
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    setFromExt(ext)
    process(file, { format, quality: String(quality) })
  }

  function handleReset() {
    setShowResult(false)
    setFromExt(null)
    reset()
  }

  return (
    <ToolPageLayout title="Convert Image" description="Convert between HEIC, PNG, WebP, JPG, and AVIF: any format instantly.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".jpg,.jpeg,.png,.webp,.heic,.avif,.tiff" onFiles={handleFiles} label="Drop your image here" hint="JPG · PNG · WebP · HEIC · AVIF · up to 100 MB" />
          <ToolOptions>
            <OptionRow label="Output format">
              <select className="select" style={{ width: 'auto' }} value={format} onChange={e => setFormat(e.target.value)}>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
              </select>
            </OptionRow>
            <OptionRow label="Quality" hint="Affects final file size">
              <div className="range-field">
                <input
                  type="range"
                  className="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                />
                <span className="range-value">{quality}%</span>
              </div>
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
        <ResultBox
          title="Converted"
          conversion={conversion ?? undefined}
          downloadUrl={state.result.url}
          downloadName={state.result.filename}
          originalSize={state.result.originalSize}
          outputSize={state.result.outputSize}
          onReset={handleReset}
        />
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
