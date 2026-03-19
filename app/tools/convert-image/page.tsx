'use client'

import { useState } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function ConvertImagePage() {
  const [format, setFormat] = useState('jpg')
  const [quality, setQuality] = useState(85)
  const { state, process, reset } = useTool('/api/convert-image')

  return (
    <ToolPageLayout title="Convert Image" description="Convert between HEIC, PNG, WebP, JPG, and AVIF — any format instantly.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".jpg,.jpeg,.png,.webp,.heic,.avif,.tiff" onFiles={files => process(files[0], { format, quality: String(quality) })} label="Drop your image here" hint="JPG · PNG · WebP · HEIC · AVIF — up to 100 MB" />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" className="range" min={10} max={100} value={quality} onChange={e => setQuality(Number(e.target.value))} style={{ width: 120 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{quality}%</span>
              </div>
            </OptionRow>
          </ToolOptions>
        </>
      )}
      {(state.status === 'uploading' || state.status === 'processing') && <ProgressBar progress={state.progress} label={state.message} />}
      {state.status === 'done' && state.result && (
        <ResultBox title="Converted" downloadUrl={state.result.url} downloadName={state.result.filename} originalSize={state.result.originalSize} outputSize={state.result.outputSize} onReset={reset} />
      )}
      {state.status === 'error' && (
        <div>
          <div className="alert alert-error"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{state.error}</div>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={reset}>Try again</button>
        </div>
      )}
    </ToolPageLayout>
  )
}
