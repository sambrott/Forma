'use client'

import { useState } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function CompressPDFPage() {
  const [level, setLevel] = useState('medium')
  const { state, process, reset } = useTool('/api/compress-pdf')

  function handleFiles(files: File[]) {
    process(files[0], { level })
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
      {(state.status === 'uploading' || state.status === 'processing') && (
        <ProgressBar progress={state.progress} label={state.message} />
      )}
      {state.status === 'done' && state.result && (
        <ResultBox
          title="Compressed"
          downloadUrl={state.result.url}
          downloadName={state.result.filename}
          originalSize={state.result.originalSize}
          outputSize={state.result.outputSize}
          onReset={reset}
        />
      )}
      {state.status === 'error' && (
        <div>
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {state.error}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={reset}>Try again</button>
        </div>
      )}
    </ToolPageLayout>
  )
}
