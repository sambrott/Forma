'use client'

import { useState, useCallback } from 'react'
import ToolPageLayout from '@/components/ToolPageLayout'

function countKeys(obj: unknown): number {
  let count = 0
  function walk(o: unknown) {
    if (typeof o === 'object' && o !== null) {
      Object.keys(o as Record<string, unknown>).forEach(k => { count++; walk((o as Record<string, unknown>)[k]) })
    }
  }
  walk(obj)
  return count
}

export default function JSONFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ lines: '—', keys: '—', size: '—' })

  const format = useCallback(() => {
    if (!input.trim()) { setOutput(''); setError(''); setStats({ lines: '—', keys: '—', size: '—' }); return }
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError('')
      setStats({
        lines: String(formatted.split('\n').length),
        keys: String(countKeys(parsed)),
        size: (new Blob([formatted]).size / 1024).toFixed(1) + ' KB',
      })
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }, [input])

  const minify = useCallback(() => {
    try { setOutput(JSON.stringify(JSON.parse(input))); setError('') }
    catch (e) { setError((e as Error).message) }
  }, [input])

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output)
  }, [output])

  return (
    <ToolPageLayout title="JSON Formatter" description="Format, validate, and minify JSON — runs entirely in your browser.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div className="input-label">Input</div>
          <textarea
            className="code-area"
            value={input}
            onChange={e => { setInput(e.target.value); format() }}
            placeholder='{"name":"forma","version":"1.0"}'
          />
        </div>
        <div>
          <div className="input-label">Output</div>
          <textarea
            className="code-area"
            value={error ? `⚠ ${error}` : output}
            readOnly
            style={error ? { borderColor: 'var(--error)' } : undefined}
            placeholder="Formatted JSON appears here…"
          />
        </div>
      </div>

      <div className="stat-row" style={{ maxWidth: 400 }}>
        <div className="stat-cell"><div className="stat-val">{stats.lines}</div><div className="stat-key">Lines</div></div>
        <div className="stat-cell"><div className="stat-val">{stats.keys}</div><div className="stat-key">Keys</div></div>
        <div className="stat-cell"><div className="stat-val">{stats.size}</div><div className="stat-key">Size</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-primary btn-sm" onClick={format}>Format</button>
        <button className="btn btn-ghost btn-sm" onClick={minify}>Minify</button>
        <button className="btn btn-ghost btn-sm" onClick={copy}>Copy output</button>
      </div>
    </ToolPageLayout>
  )
}
