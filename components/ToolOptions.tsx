'use client'

interface ToolOptionsProps {
  children: React.ReactNode
}

export default function ToolOptions({ children }: ToolOptionsProps) {
  return (
    <div className="options-panel">
      <h3>Options</h3>
      {children}
    </div>
  )
}

interface OptionRowProps {
  label: string
  hint?: string
  children: React.ReactNode
}

export function OptionRow({ label, hint, children }: OptionRowProps) {
  return (
    <div className="option-row">
      <div>
        <div className="option-label">{label}</div>
        {hint && <div className="option-hint">{hint}</div>}
      </div>
      {children}
    </div>
  )
}
