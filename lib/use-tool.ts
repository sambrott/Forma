'use client'

import { useState, useCallback } from 'react'
import type { ProcessingState } from '@/types'
import { FREE_LIMITS, formatFileSize } from './limits'

/** Prefer RFC 5987 `filename*=UTF-8''…` so names match the server (e.g. unicode). */
function parseContentDispositionFilename(disposition: string): string | null {
  const star = disposition.match(/filename\*=UTF-8''([^;\s]+)/i)
  if (star) {
    try {
      return decodeURIComponent(star[1])
    } catch {
      /* ignore */
    }
  }
  const quoted = disposition.match(/filename="([^"]+)"/)
  if (quoted) return quoted[1]
  const plain = disposition.match(/filename=([^;\s]+)/)
  if (plain) return plain[1].replace(/^["']|["']$/g, '')
  return null
}

export function useTool(endpoint: string) {
  const [state, setState] = useState<ProcessingState>({
    status: 'idle', progress: 0, message: '',
  })

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0, message: '' })
  }, [])

  const process = useCallback(async (file: File, extraData?: Record<string, string>) => {
    if (file.size > FREE_LIMITS.fileSizeBytes) {
      setState({ status: 'error', progress: 0, message: '', error: `File too large. Free limit is ${formatFileSize(FREE_LIMITS.fileSizeBytes)}.` })
      return
    }

    setState({ status: 'uploading', progress: 10, message: 'Uploading…' })

    const formData = new FormData()
    formData.append('file', file)
    if (extraData) {
      Object.entries(extraData).forEach(([k, v]) => formData.append(k, v))
    }

    try {
      setState({ status: 'processing', progress: 40, message: 'Processing…' })

      const res = await fetch(endpoint, { method: 'POST', body: formData })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Processing failed.' }))
        setState({ status: 'error', progress: 0, message: '', error: body.error || 'Processing failed.' })
        return
      }

      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        const data = await res.json()
        setState({
          status: 'done', progress: 100, message: 'Done',
          result: { url: '', filename: '', data },
        })
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const disposition = res.headers.get('content-disposition') || ''
      const filename = parseContentDispositionFilename(disposition) || 'forma-output'

      const originalSize = Number(res.headers.get('x-forma-original-size')) || file.size
      const outputSize = Number(res.headers.get('x-forma-output-size')) || blob.size

      setState({
        status: 'done', progress: 100, message: 'Done',
        result: { url, filename, originalSize, outputSize },
      })
    } catch {
      setState({ status: 'error', progress: 0, message: '', error: 'Processing failed. Please try again.' })
    }
  }, [endpoint])

  const processMultiple = useCallback(async (files: File[], extraData?: Record<string, string>) => {
    if (files.length === 0) return
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    if (extraData) {
      Object.entries(extraData).forEach(([k, v]) => formData.append(k, v))
    }

    setState({ status: 'processing', progress: 30, message: 'Processing…' })

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Processing failed.' }))
        setState({ status: 'error', progress: 0, message: '', error: body.error })
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const disposition = res.headers.get('content-disposition') || ''
      const filename = parseContentDispositionFilename(disposition) || 'forma-output.pdf'

      setState({
        status: 'done', progress: 100, message: 'Done',
        result: { url, filename },
      })
    } catch {
      setState({ status: 'error', progress: 0, message: '', error: 'Processing failed. Please try again.' })
    }
  }, [endpoint])

  return { state, process, processMultiple, reset }
}
