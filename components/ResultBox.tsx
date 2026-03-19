'use client'

import { formatFileSize } from '@/lib/limits'

interface ResultBoxProps {
  title?: string
  subtitle?: string
  conversion?: string      // e.g. "JPEG → PNG" or "High compression"
  downloadUrl?: string
  downloadName?: string
  originalSize?: number
  outputSize?: number
  onReset: () => void
}

export default function ResultBox({
  title = 'Done',
  subtitle = 'Your file is ready to download',
  conversion,
  downloadUrl,
  downloadName,
  originalSize,
  outputSize,
  onReset,
}: ResultBoxProps) {
  const saved = originalSize && outputSize
    ? Math.round((1 - outputSize / originalSize) * 100)
    : null

  return (
    <div className="result-box">
      <div className="result-title">{title} ✓</div>
      {conversion && (
        <div className="result-conversion">
          {conversion}
        </div>
      )}
      <div className="result-sub">{subtitle}</div>
      {(originalSize || outputSize) && (
        <div className="result-stats">
          {originalSize && (
            <div>
              <div className="result-stat-val">{formatFileSize(originalSize)}</div>
              <div className="result-stat-key">Original</div>
            </div>
          )}
          {outputSize && (
            <div>
              <div className="result-stat-val">{formatFileSize(outputSize)}</div>
              <div className="result-stat-key">Output</div>
            </div>
          )}
          {saved !== null && (
            <div>
              <div className="result-stat-val">{saved}%</div>
              <div className="result-stat-key">Saved</div>
            </div>
          )}
        </div>
      )}
      <div className="result-actions">
        {downloadUrl && (
          <a href={downloadUrl} download={downloadName} className="btn btn-primary">
            Download
          </a>
        )}
        <button className="btn btn-ghost" onClick={onReset}>Process another</button>
      </div>
    </div>
  )
}
