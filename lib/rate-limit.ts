const requests = new Map<string, { count: number; reset: number }>()

export function checkRateLimit(ip: string, limit: number): boolean {
  const now = Date.now()
  const window = 24 * 60 * 60 * 1000
  const entry = requests.get(ip)
  if (!entry || now > entry.reset) {
    requests.set(ip, { count: 1, reset: now + window })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

export function getRemainingUses(ip: string, limit: number): number {
  const now = Date.now()
  const entry = requests.get(ip)
  if (!entry || now > entry.reset) return limit
  return Math.max(0, limit - entry.count)
}
