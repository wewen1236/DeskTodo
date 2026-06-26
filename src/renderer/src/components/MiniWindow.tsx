import { useState } from 'react'
import { Plus, Maximize2, X, Trash2 } from 'lucide-react'
import { Todo } from '@/types'

interface MiniWindowProps {
  todos: Todo[]
  onToggleComplete: (id: string) => void
  onAddTodo: (title: string) => void
  onDelete: (id: string) => void
}

export function MiniWindow({ todos, onToggleComplete, onAddTodo, onDelete }: MiniWindowProps) {
  const [inputValue, setInputValue] = useState('')

  function handleAdd() {
    if (inputValue.trim()) {
      onAddTodo(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: 'var(--win-mica-overlay)',
      backdropFilter: 'blur(30px)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    }}>
      {/* Mini title bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ WebkitAppRegion: 'drag' as any }}>
        <span className="text-xs font-medium text-win-text-secondary">DeskTodo · 迷你</span>
        <div style={{ WebkitAppRegion: 'no-drag' as any }} className="flex items-center gap-1">
          <button
            className="win-btn-ghost p-1 rounded-win-sm"
            onClick={() => window.electronAPI.window.restoreFromMini()}
            title="切换回主窗口"
          >
            <Maximize2 size={13} />
          </button>
          <button
            className="win-btn-ghost p-1 rounded-win-sm hover:text-[#c42b1c]"
            onClick={() => window.electronAPI.window.closeMini()}
            title="关闭迷你窗口"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Quick add */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-win-border">
        <button
          className="win-btn-ghost p-1 rounded-full text-win-accent flex-shrink-0"
          onClick={handleAdd}
        >
          <Plus size={16} />
        </button>
        <input
          type="text"
          placeholder="快速添加待办..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-win-text-secondary/50"
          autoFocus
        />
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {todos.length === 0 ? (
          <div className="text-center py-6 text-xs text-win-text-secondary">
            暂无待办
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-win-sm hover:bg-win-input-bg transition-colors group ${
                todo.completed ? 'opacity-50' : ''
              }`}
            >
              <button
                className={`win-checkbox ${todo.completed ? 'checked' : ''}`}
                style={{ width: 16, height: 16 }}
                onClick={() => onToggleComplete(todo.id)}
              />
              <span
                className={`text-xs flex-1 truncate ${
                  todo.completed ? 'line-through text-win-text-secondary' : 'text-win-text'
                }`}
              >
                {todo.title}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background:
                    todo.priority === 'high'
                      ? '#c42b1c'
                      : todo.priority === 'medium'
                      ? '#f7630c'
                      : '#0078d4',
                }}
              />
              <button
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-red-500/10 text-win-text-secondary hover:text-[#c42b1c] transition-all flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(todo.id)
                }}
                title="删除待办"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-win-border text-center">
        <span className="text-[10px] text-win-text-secondary">
          {todos.length} 项待办 · 双击标题栏切换主窗口
        </span>
      </div>
    </div>
  )
}
