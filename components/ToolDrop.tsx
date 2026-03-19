'use client'

import { useCallback, useRef, useState } from 'react'

interface ToolDropProps {
  accept?: string
  multiple?: boolean
  label?: string
  hint?: string
  onFiles: (files: File[]) => void
}

export default function ToolDrop({ accept, multiple, label, hint, onFiles }: ToolDropProps) {
  const [dragover, setDragover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragover(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(multiple ? files : [files[0]])
  }, [onFiles, multiple])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onFiles(multiple ? files : [files[0]])
    e.target.value = ''
  }, [onFiles, multiple])

  return (
    <div
      className={`upload-zone${dragover ? ' dragover' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragover(true) }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className="upload-icon-wrap">
        <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
      </div>
      <div className="upload-title">{label || 'Drop your file to begin'}</div>
      <div className="upload-sub">{hint || 'PDF · DOCX · JPG · PNG · MP4 · MP3 — up to 100 MB free · No sign-up'}</div>
      <div className="upload-actions" onClick={e => e.stopPropagation()}>
        <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>Select file</button>
      </div>
    </div>
  )
}
