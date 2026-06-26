import { useState, useEffect } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.electronAPI.window.isMaximized().then(setIsMaximized)
    const unsub = window.electronAPI.window.onMaximizeChange(setIsMaximized)
    return () => unsub?.()
  }, [])

  return (
    <div className="win-titlebar flex items-center justify-between">
      <div className="title flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--win-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
        <span>DeskTodo</span>
      </div>
      <div className="win-controls">
        <button className="win-control-btn" onClick={() => window.electronAPI.window.minimize()} title="最小化">
          <Minus size={14} strokeWidth={1.5} />
        </button>
        <button className="win-control-btn" onClick={() => window.electronAPI.window.maximize()} title="最大化">
          {isMaximized ? <Copy size={13} strokeWidth={1.5} /> : <Square size={13} strokeWidth={1.5} />}
        </button>
        <button className="win-control-btn close" onClick={() => window.electronAPI.window.close()} title="关闭">
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
