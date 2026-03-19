'use client'

import { formatFileSize } from '@/lib/limits'
import type { FileItem } from '@/types'

interface FileQueueProps {
  files: FileItem[]
  onRemove: (id: string) => void
}

export default function FileQueue({ files, onRemove }: FileQueueProps) {
  if (!files.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {files.map(f => (
        <div key={f.id} className="file-item">
          <div className="file-item-icon">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="file-item-name">{f.name}</div>
          <div className="file-item-size">{formatFileSize(f.size)}</div>
          <button className="file-item-remove" onClick={() => onRemove(f.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
