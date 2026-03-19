import Link from 'next/link'
import { getBadgeClass } from '@/lib/tools'
import type { Tool } from '@/types'
import { ToolIcon } from './ToolIcon'

interface ToolRowProps {
  tool: Tool
}

export default function ToolRow({ tool }: ToolRowProps) {
  return (
    <Link href={`/tools/${tool.slug}`} className="tool-row">
      <div className="tool-row-icon">
        <ToolIcon name={tool.icon} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="tool-row-name">{tool.name}</div>
        <div className="tool-row-desc">{tool.desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className={`badge ${getBadgeClass(tool.cat)}`}>
          {tool.isAI ? '✦ ' : ''}{tool.cat}
        </span>
        <span className="tool-row-arrow">↗</span>
      </div>
    </Link>
  )
}
