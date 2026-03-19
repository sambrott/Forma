'use client'

import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function PDFToWordPage() {
  const { state, process, reset } = useTool('/api/pdf-to-word')

  return (
    <ToolPageLayout title="PDF → Word" description="Convert PDF documents to editable Word format.">
      {state.status === 'idle' && (
        <ToolDrop accept=".pdf" onFiles={files => process(files[0])} label="Drop your PDF here" hint="PDF up to 100 MB free" />
      )}
      {(state.status === 'uploading' || state.status === 'processing') && <ProgressBar progress={state.progress} label={state.message} />}
      {state.status === 'done' && state.result && (
        <ResultBox title="Converted" subtitle="Your Word document is ready" downloadUrl={state.result.url} downloadName={state.result.filename || 'forma-output.docx'} onReset={reset} />
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
