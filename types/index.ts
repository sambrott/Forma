export interface Tool {
  slug: string
  name: string
  desc: string
  cat: ToolCategory
  isAI: boolean
  icon: string
  accepts?: string[]
}

export type ToolCategory = 'PDF' | 'AI' | 'Image' | 'Audio' | 'Video' | 'Dev'

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error'
  progress: number
  message: string
  result?: ProcessingResult
  error?: string
}

export interface ProcessingResult {
  url: string
  filename: string
  originalSize?: number
  outputSize?: number
  data?: Record<string, unknown>
}

export interface SummaryResult {
  overview: string
  themes: string[]
  conclusions: string[]
}

export interface FileItem {
  id: string
  file: File
  name: string
  size: number
}
