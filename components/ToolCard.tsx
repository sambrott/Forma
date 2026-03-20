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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="tool-card-icon">
          <ToolIcon name={tool.icon} />
        </div>
        {tool.isAI ? (
          <span className="badge badge-ai" style={{ fontSize: 8 }}>✦ AI</span>
        ) : (
          <span className="tool-card-arrow">↗</span>
        )}
      </div>
      <div className="tool-card-name">{tool.name}</div>
      <div className="tool-card-desc">{tool.desc}</div>
    </Link>
  )
}
