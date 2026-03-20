import Link from 'next/link'
import { getBadgeClass } from '@/lib/tools'
import type { Tool } from '@/types'
import { ToolIcon } from './ToolIcon'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card">
      <div className="tool-card-icon">
        <ToolIcon name={tool.icon} />
      </div>
      <div className="tool-card-body">
        <div className="tool-card-name">{tool.name}</div>
        <div className="tool-card-desc">{tool.desc}</div>
      </div>
      <div className="tool-card-meta">
        <span className={`badge ${getBadgeClass(tool.cat)}`}>
          {tool.isAI ? '✦ ' : ''}
          {tool.cat}
        </span>
        <span className="tool-card-arrow" aria-hidden>
          ↗
        </span>
      </div>
    </Link>
  )
}
