'use client'

import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ProgressBar from '@/components/ProgressBar'
import { useTool } from '@/lib/use-tool'
import type { SummaryResult } from '@/types'

export default function SummariseDocPage() {
  const { state, process, reset } = useTool('/api/summarise-doc')

  const summary = state.result?.data as SummaryResult | undefined

  return (
    <ToolPageLayout title="Summarise Doc" description="Get key points from any document using AI — overview, themes, and conclusions.">
      {state.status === 'idle' && (
        <ToolDrop accept=".pdf,.docx,.txt" onFiles={files => process(files[0])} label="Drop your document here" hint="PDF · DOCX · TXT — up to 100 MB · 3 free AI uses per day" />
      )}
      {(state.status === 'uploading' || state.status === 'processing') && <ProgressBar progress={state.progress} label={state.message} />}
      {state.status === 'done' && summary && (
        <div className="result-box" style={{ textAlign: 'left' }}>
          <div className="result-title" style={{ textAlign: 'center' }}>Summary ✓</div>
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Overview</h3>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 20 }}>{summary.overview}</p>
            <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Key themes</h3>
            <ul style={{ marginBottom: 20, paddingLeft: 16 }}>
              {summary.themes.map((t, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 4 }}>{t}</li>)}
            </ul>
            <h3 style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Conclusions</h3>
            <ul style={{ paddingLeft: 16 }}>
              {summary.conclusions.map((c, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 4 }}>{c}</li>)}
            </ul>
          </div>
          <div className="result-actions" style={{ marginTop: 24, justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={reset}>Summarise another</button>
          </div>
        </div>
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
