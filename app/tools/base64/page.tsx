'use client'

import { useState, useCallback } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'

export default function Base64Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encode = useCallback(() => {
    try { setOutput(btoa(unescape(encodeURIComponent(input)))) }
    catch { setOutput('⚠ Could not encode') }
  }, [input])

  const decode = useCallback(() => {
    try { setOutput(decodeURIComponent(escape(atob(input.trim())))) }
    catch { setOutput('⚠ Invalid base64') }
  }, [input])

  const copy = useCallback(() => { navigator.clipboard.writeText(output) }, [output])

  return (
    <ToolPageLayout title="Base64" description="Encode and decode Base64 strings — runs entirely in your browser.">
      <div className="input-label">Input</div>
      <textarea
        className="code-area"
        style={{ minHeight: 120 }}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter text to encode, or base64 to decode…"
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="btn btn-primary btn-sm" onClick={encode}>Encode</button>
        <button className="btn btn-ghost btn-sm" onClick={decode}>Decode</button>
        <button className="btn btn-ghost btn-sm" onClick={copy}>Copy</button>
      </div>

      <div className="input-label" style={{ marginTop: 16 }}>Output</div>
      <textarea className="code-area" style={{ minHeight: 80 }} value={output} readOnly />
    </ToolPageLayout>
  )
}
