import posthog from 'posthog-js'

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  try { posthog.capture(event, properties) } catch {}
}

export const EVENTS = {
  TOOL_OPENED:       'tool_opened',
  FILE_UPLOADED:     'file_uploaded',
  TOOL_PROCESSED:    'tool_processed',
  TOOL_FAILED:       'tool_failed',
  LIMIT_REACHED:     'limit_reached',
  UPGRADE_CLICKED:   'upgrade_clicked',
  SIGN_IN_STARTED:   'sign_in_started',
  SIGN_IN_COMPLETED: 'sign_in_completed',
  DOWNLOAD_CLICKED:  'download_clicked',
  TOOL_RESET:        'tool_reset',
} as const
