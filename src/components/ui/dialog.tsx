import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './button'

export function Dialog({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  if (!open) return null
  return <div className="dialog-backdrop" role="dialog" aria-modal="true" onMouseDown={e => { if (e.currentTarget === e.target) onClose() }}>
    <div className="dialog-panel">
      <div className="dialog-head"><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X size={17}/></Button></div>
      <div className="dialog-body">{children}</div>
    </div>
  </div>
}
