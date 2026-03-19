'use client'

import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function PDFToExcelPage() {
  const { state, process, reset } = useTool('/api/pdf-to-excel')

  return (
    <ToolPageLayout title="PDF → Excel" description="AI-powered table and data extraction into clean spreadsheets.">
      {state.status === 'idle' && (
        <ToolDrop accept=".pdf" onFiles={files => process(files[0])} label="Drop your PDF here" hint="PDF files with tables · 3 free AI uses per day" />
      )}
      {(state.status === 'uploading' || state.status === 'processing') && <ProgressBar progress={state.progress} label="Extracting tables with AI…" />}
      {state.status === 'done' && state.result && (
        <ResultBox title="Extracted" subtitle="Your Excel file is ready" downloadUrl={state.result.url} downloadName={state.result.filename || 'forma-export.xlsx'} onReset={reset} />
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
