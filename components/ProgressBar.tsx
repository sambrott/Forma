'use client'

interface ProgressBarProps {
  progress: number
  label?: string
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="progress-wrap">
      <div className="progress-bg">
        <div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
      {label && <div className="progress-label">{label}</div>}
    </div>
  )
}
