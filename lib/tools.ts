import { Tool } from '@/types'

export const TOOLS: Tool[] = [
  { slug: 'compress-pdf',      name: 'Compress PDF',      desc: 'Reduce size without losing quality',       cat: 'PDF',   isAI: false, icon: 'file-compress', accepts: ['.pdf'] },
  { slug: 'merge-pdfs',        name: 'Merge PDFs',        desc: 'Combine multiple files into one',          cat: 'PDF',   isAI: false, icon: 'file-merge',    accepts: ['.pdf'] },
  { slug: 'split-pdf',         name: 'Split PDF',         desc: 'Extract pages or split by range',          cat: 'PDF',   isAI: false, icon: 'file-split',    accepts: ['.pdf'] },
  { slug: 'pdf-to-excel',      name: 'PDF → Excel',       desc: 'AI-powered table extraction',              cat: 'AI',    isAI: true,  icon: 'table',         accepts: ['.pdf'] },
  { slug: 'pdf-to-word',       name: 'PDF → Word',        desc: 'Convert to editable document',             cat: 'PDF',   isAI: false, icon: 'file-text',     accepts: ['.pdf'] },
  { slug: 'summarise-doc',     name: 'Summarize Doc',     desc: 'Key points from any document',             cat: 'AI',    isAI: true,  icon: 'file-lines',    accepts: ['.pdf','.docx','.txt'] },
  { slug: 'convert-image',     name: 'Convert Image',     desc: 'HEIC, PNG, WebP, JPG: any format',        cat: 'Image', isAI: false, icon: 'image',         accepts: ['.jpg','.jpeg','.png','.webp','.heic','.heif','.avif','.tiff','.tif'] },
  { slug: 'remove-background', name: 'Remove Background', desc: 'AI background removal in one click',       cat: 'AI',    isAI: true,  icon: 'image-off',     accepts: ['.jpg','.jpeg','.png','.webp'] },
  { slug: 'extract-audio',     name: 'Extract Audio',     desc: 'Pull MP3 from any video',                  cat: 'Audio', isAI: false, icon: 'music',         accepts: ['.mp4','.mov','.avi','.mkv','.webm'] },
  { slug: 'trim-video',        name: 'Trim Video',        desc: 'Cut to exact start and end time',          cat: 'Video', isAI: false, icon: 'video',         accepts: ['.mp4','.mov','.avi','.mkv','.webm'] },
  { slug: 'transcribe-audio',  name: 'Transcribe Audio',  desc: 'Accurate transcript from audio or video',  cat: 'AI',    isAI: true,  icon: 'mic',           accepts: ['.mp3','.wav','.m4a','.mp4','.webm'] },
  { slug: 'json-formatter',    name: 'JSON Formatter',    desc: 'Format, validate, and minify JSON',        cat: 'Dev',   isAI: false, icon: 'code' },
  { slug: 'base64',            name: 'Base64',            desc: 'Encode and decode Base64 strings',         cat: 'Dev',   isAI: false, icon: 'hash' },
  { slug: 'url-encoder',       name: 'URL Encoder',       desc: 'Encode and decode URL strings',            cat: 'Dev',   isAI: false, icon: 'link' },
  { slug: 'receipt-to-excel', name: 'Receipt → Excel',   desc: 'Photograph any receipt, get a spreadsheet', cat: 'AI',    isAI: true,  icon: 'receipt',       accepts: ['image/*','.pdf'] },
]

export const FEATURED_TOOLS = TOOLS.slice(0, 6)

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find(t => t.slug === slug)
}

export function getToolsByCategory(cat: string): Tool[] {
  if (cat === 'Media') return TOOLS.filter(t => t.cat === 'Audio' || t.cat === 'Video')
  return TOOLS.filter(t => t.cat === cat)
}

/** Tool card badge categories (per-tool); tabs use TOOL_TAB_ITEMS + “All”. */
export const CATEGORIES = ['PDF', 'AI', 'Image', 'Audio', 'Video', 'Dev'] as const

/** Tools page tabs (URL ?cat= matches id). Audio + Video share the “Media” tab. */
export const TOOL_TAB_ITEMS = [
  { id: 'PDF', label: 'PDF' },
  { id: 'AI', label: 'AI' },
  { id: 'Image', label: 'Image' },
  { id: 'Media', label: 'Audio & Video' },
  { id: 'Dev', label: 'Dev' },
] as const

export function getBadgeClass(cat: string): string {
  const map: Record<string, string> = {
    PDF: 'badge-pdf', AI: 'badge-ai', Image: 'badge-image',
    Audio: 'badge-audio', Video: 'badge-video', Dev: 'badge-dev',
  }
  return map[cat] || 'badge-doc'
}
