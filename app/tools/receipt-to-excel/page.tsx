'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ToolOptions, { OptionRow } from '@/components/ToolOptions'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function ReceiptToExcelPage() {
  const [detail, setDetail] = useState('detailed')
  const { state, process, reset } = useTool('/api/receipt-to-excel')
  const [showResult, setShowResult] = useState(false)
  const router = useRouter()

  const isProcessing = state.status === 'uploading' || state.status === 'processing'
  const isComplete = state.status === 'done'

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => setShowResult(true), 350)
      return () => clearTimeout(t)
    }
    setShowResult(false)
  }, [isComplete])

  function handleFiles(files: File[]) {
    process(files[0], { detail }).catch(() => {})
  }

  function handleReset() {
    setShowResult(false)
    reset()
  }

  if (state.status === 'error' && (state as { requiresAuth?: boolean }).requiresAuth) {
    router.push('/login?next=/tools/receipt-to-excel')
    return null
  }

  return (
    <ToolPageLayout
      title="Receipt → Excel"
      description="Upload a photo of any receipt. AI extracts vendor, date, line items, and totals into a clean spreadsheet."
    >
      {state.status === 'idle' && (
        <>
          <ToolDrop
            accept="image/*,.pdf"
            onFiles={handleFiles}
            label="Drop your receipt here"
            hint="Photo or scan of any receipt · JPG, PNG, PDF up to 100 MB"
          />
          <ToolOptions>
            <OptionRow label="Detail level" hint="Summary creates one row per receipt; Detailed creates one row per line item">
              <select className="select" style={{ width: 'auto' }} value={detail} onChange={e => setDetail(e.target.value)}>
                <option value="summary">Summary (one row per receipt)</option>
                <option value="detailed">Detailed (one row per line item)</option>
              </select>
            </OptionRow>
          </ToolOptions>
        </>
      )}
      <ProgressBar
        active={isProcessing}
        complete={isComplete}
        stages={['Uploading receipt', 'Reading with AI', 'Extracting data', 'Building spreadsheet']}
      />
      {showResult && state.result && (
        <ResultBox
          title="Receipt extracted"
          conversion="Receipt → Excel"
          downloadUrl={state.result.url}
          downloadName={state.result.filename}
          onReset={handleReset}
        />
      )}
      {state.status === 'error' && !(state as { requiresAuth?: boolean }).requiresAuth && (
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
