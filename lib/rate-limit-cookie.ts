import { NextRequest, NextResponse } from 'next/server'

/** Usage limits disabled — always allow; cookies not written. */
export function checkCookieRateLimit(
  _req: NextRequest,
  _toolSlug: string
): { allowed: boolean; used: number; limit: number; resetAt: number } {
  return { allowed: true, used: 0, limit: Infinity, resetAt: 0 }
}

export function setUsageCookie(
  _response: NextResponse,
  _req: NextRequest,
  _toolSlug: string
): void {
  /* no-op */
}
