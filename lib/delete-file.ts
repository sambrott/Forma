import { unlink } from 'fs/promises'

export async function deleteFile(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch {
    // File may already be deleted; safe to ignore
  }
}
