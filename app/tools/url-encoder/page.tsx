'use client'

import { useState, useCallback } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'

export default function URLEncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const encode = useCallback(() => { setOutput(encodeURIComponent(input)) }, [input])
  const decode = useCallback(() => {
    try { setOutput(decodeURIComponent(input)) }
    catch { setOutput('⚠ Invalid encoding') }
  }, [input])
  const copy = useCallback(() => { navigator.clipboard.writeText(output) }, [output])

  return (
    <ToolPageLayout title="URL Encoder" description="Encode and decode URL strings — runs entirely in your browser.">
      <div className="input-label">Input URL or string</div>
      <input
        className="input"
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value); setOutput(encodeURIComponent(e.target.value)) }}
        placeholder="https://example.com/path?q=hello world&foo=bar"
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="btn btn-primary btn-sm" onClick={encode}>Encode</button>
        <button className="btn btn-ghost btn-sm" onClick={decode}>Decode</button>
        <button className="btn btn-ghost btn-sm" onClick={copy}>Copy</button>
      </div>

      <div className="input-label" style={{ marginTop: 16 }}>Output</div>
      <input className="input" type="text" value={output} readOnly />
    </ToolPageLayout>
  )
}
