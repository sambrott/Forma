'use client'

import { useState, useCallback, useEffect } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'
import ToolDrop from '@/components/ToolDrop'
import FileQueue from '@/components/FileQueue'
import ProgressBar from '@/components/ProgressBar'
import ResultBox from '@/components/ResultBox'
import { useTool } from '@/lib/use-tool'
import type { FileItem } from '@/types'

export default function MergePDFsPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const { state, processMultiple, reset } = useTool('/api/merge-pdfs')
  const [showResult, setShowResult] = useState(false)

  const isProcessing = state.status === 'uploading' || state.status === 'processing'
  const isComplete = state.status === 'done'

  useEffect(() => {
    if (isComplete) {
      const t = setTimeout(() => setShowResult(true), 350)
      return () => clearTimeout(t)
    }
    setShowResult(false)
  }, [isComplete])

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [
      ...prev,
      ...newFiles.map(f => ({ id: crypto.randomUUID(), file: f, name: f.name, size: f.size })),
    ])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  function handleMerge() {
    processMultiple(files.map(f => f.file))
  }

  function handleReset() {
    setShowResult(false)
    reset()
    setFiles([])
  }

  return (
    <ToolPageLayout title="Merge PDFs" description="Combine multiple PDF files into a single document.">
      {state.status === 'idle' && (
        <>
          <ToolDrop accept=".pdf" multiple onFiles={handleFiles} label="Drop PDFs here" hint="Add multiple PDF files · Drag to reorder" />
          <FileQueue files={files} onRemove={removeFile} />
          {files.length >= 2 && (
            <button className="btn btn-primary btn-lg" style={{ marginTop: 16 }} onClick={handleMerge}>
              Merge {files.length} PDFs
            </button>
          )}
        </>
      )}
      <ProgressBar
        active={isProcessing}
        complete={isComplete}
        stages={['Uploading file', 'Processing', 'Optimising', 'Almost done']}
      />
      {showResult && state.result && (
        <ResultBox title="Merged" downloadUrl={state.result.url} downloadName={state.result.filename} onReset={handleReset} />
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
