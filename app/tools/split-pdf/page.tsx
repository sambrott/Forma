'use client'

import { useState } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function SplitPDFPage() {
  const [ranges, setRanges] = useState('1-3,5,7-9')
  const { state, process, reset } = useTool('/api/split-pdf')

  return (
    <ToolPageLayout title="Split PDF" description="Extract specific pages or split by range into separate PDFs.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".pdf" onFiles={files => process(files[0], { ranges })} label="Drop your PDF here" hint="PDF up to 100 MB free" />
          <ToolOptions>
            <OptionRow label="Page ranges" hint="e.g. 1-3,5,7-9 — or leave blank to split every page">
              <input className="input" style={{ width: 200 }} value={ranges} onChange={e => setRanges(e.target.value)} placeholder="1-3,5,7-9" />
            </OptionRow>
          </ToolOptions>
        </>
      )}
      {(state.status === 'uploading' || state.status === 'processing') && <ProgressBar progress={state.progress} label={state.message} />}
      {state.status === 'done' && state.result && (
        <ResultBox title="Split complete" downloadUrl={state.result.url} downloadName={state.result.filename || 'forma-split.zip'} onReset={reset} />
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
