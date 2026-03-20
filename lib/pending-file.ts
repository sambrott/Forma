let _pendingFile: File | null = null

export function setPendingFile(file: File): void {
  _pendingFile = file
}

/** Returns and clears the pending file. Call once on mount. */
export function takePendingFile(): File | null {
  const f = _pendingFile
  _pendingFile = null
  return f
}
