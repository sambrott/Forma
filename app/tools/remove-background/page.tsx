'use client'

import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'

export default function RemoveBackgroundPage() {
  const { state, process, reset } = useTool('/api/remove-background')

  return (
    <ToolPageLayout title="Remove Background" description="AI background removal in one click. Get a transparent PNG.">
      {state.status === 'idle' && (
        <ToolDrop accept=".jpg,.jpeg,.png,.webp" onFiles={files => process(files[0])} label="Drop your image here" hint="JPG · PNG · WebP — 3 free AI uses per day" />
      )}
      {(state.status === 'uploading' || state.status === 'processing') && <ProgressBar progress={state.progress} label="Removing background…" />}
      {state.status === 'done' && state.result && (
        <ResultBox title="Background removed" downloadUrl={state.result.url} downloadName={state.result.filename || 'forma-nobg.png'} onReset={reset} />
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
