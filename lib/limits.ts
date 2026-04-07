export const FREE_LIMITS = {
  fileSizeBytes:    100 * 1024 * 1024,
  batchFiles:       1,
  audioBitrateKbps: 192,
}

export const PRO_LIMITS = {
  fileSizeBytes:    2 * 1024 * 1024 * 1024,
  batchFiles:       50,
  audioBitrateKbps: 320,
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
