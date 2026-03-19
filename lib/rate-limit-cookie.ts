import { NextRequest, NextResponse } from 'next/server'

const FREE_DAILY_LIMIT = 3
const COOKIE_NAME = 'forma_usage'
const WINDOW_MS = 24 * 60 * 60 * 1000

interface UsageData {
  [toolSlug: string]: { count: number; resetAt: number }
}

function parseUsage(cookie: string | undefined): UsageData {
  if (!cookie) return {}
  try { return JSON.parse(Buffer.from(cookie, 'base64').toString()) }
  catch { return {} }
}

export function checkCookieRateLimit(
  req: NextRequest,
  toolSlug: string
): { allowed: boolean; used: number; limit: number; resetAt: number } {
  const usage = parseUsage(req.cookies.get(COOKIE_NAME)?.value)
  const now = Date.now()
  const entry = usage[toolSlug]

  if (!entry || now > entry.resetAt) {
    return { allowed: true, used: 1, limit: FREE_DAILY_LIMIT, resetAt: now + WINDOW_MS }
  }

  if (entry.count >= FREE_DAILY_LIMIT) {
    return { allowed: false, used: entry.count, limit: FREE_DAILY_LIMIT, resetAt: entry.resetAt }
  }

  return { allowed: true, used: entry.count + 1, limit: FREE_DAILY_LIMIT, resetAt: entry.resetAt }
}

export function setUsageCookie(
  response: NextResponse,
  req: NextRequest,
  toolSlug: string
): void {
  const usage = parseUsage(req.cookies.get(COOKIE_NAME)?.value)
  const now = Date.now()

  if (!usage[toolSlug] || now > usage[toolSlug].resetAt) {
    usage[toolSlug] = { count: 1, resetAt: now + WINDOW_MS }
  } else {
    usage[toolSlug].count++
  }

  const encoded = Buffer.from(JSON.stringify(usage)).toString('base64')
  response.cookies.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })
}
