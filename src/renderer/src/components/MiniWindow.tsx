import { useState, useMemo } from 'react'
import { Plus, Maximize2, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Todo } from '@/types'
import { isTodoCompletedToday, getTodayStr, getDateStats } from '@/utils/helpers'
import { format, addDays, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface MiniWindowProps {
  todos: Todo[]
  onToggleComplete: (id: string, date?: string) => void
  onAddTodo: (title: string) => void
  onDelete: (id: string) => void
}

export function MiniWindow({ todos, onToggleComplete, onAddTodo, onDelete }: MiniWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayStr())

  const today = getTodayStr()
  const isToday = selectedDate === today
  const dateObj = new Date(selectedDate)

  const dateTodos = useMemo(() => {
    return todos.filter((t) => {
      if (t.deletedAt || t.isPeriodic || isTodoCompletedToday(t)) return false
      if (t.dueDate && t.dueDate.slice(0, 10) !== selectedDate) return false
      return true
    }).slice(0, 5)
  }, [todos, selectedDate])

  const dateStats = useMemo(() => getDateStats(todos, selectedDate), [todos, selectedDate])

  function handleAdd() {
    if (inputValue.trim()) {
      onAddTodo(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: 'var(--win-bg)',
    }}>
      {/* Mini title bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ WebkitAppRegion: 'drag' } as any}>
        <span className="text-xs font-medium text-win-text-secondary">DeskTodo · 迷你</span>
        <div style={{ WebkitAppRegion: 'no-drag' } as any} className="flex items-center gap-1">
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

      {/* Date navigation */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-win-border">
        <button
          className="win-btn-ghost p-0.5 rounded-win-sm"
          onClick={() => setSelectedDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'))}
        >
          <ChevronLeft size={13} />
        </button>
        <span className="text-xs font-medium">
          {isToday ? '今天' : format(dateObj, 'M月d日')}
          <span className="text-win-text-secondary text-[10px] ml-1 font-normal">
            {format(dateObj, 'EEE', { locale: zhCN })}
          </span>
        </span>
        <button
          className="win-btn-ghost p-0.5 rounded-win-sm"
          onClick={() => setSelectedDate(format(addDays(dateObj, 1), 'yyyy-MM-dd'))}
        >
          <ChevronRight size={13} />
        </button>
        {!isToday && (
          <button
            className="text-[10px] text-win-accent hover:underline ml-1"
            onClick={() => setSelectedDate(today)}
          >
            今天
          </button>
        )}
      </div>

      {/* Todo list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {dateTodos.length === 0 ? (
          <div className="text-center py-6 text-xs text-win-text-secondary">
            暂无待办
          </div>
        ) : (
          dateTodos.map((todo) => {
            const isCompleted = isTodoCompletedToday(todo)
            return (
              <div
                key={todo.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-win-sm hover:bg-win-input-bg transition-colors group ${
                  isCompleted ? 'opacity-50' : ''
                }`}
              >
                <button
                  className={`win-checkbox ${isCompleted ? 'checked' : ''}`}
                  style={{ width: 16, height: 16 }}
                  onClick={() => {
                    if (todo.isPeriodic) {
                      onToggleComplete(todo.id, new Date().toISOString())
                    } else {
                      onToggleComplete(todo.id)
                    }
                  }}
                />
                <span
                  className={`text-xs flex-1 truncate ${
                    isCompleted ? 'line-through text-win-text-secondary' : 'text-win-text'
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
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-win-border space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-win-input-bg overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: dateStats.total > 0 ? `${(dateStats.completed / dateStats.total) * 100}%` : '0%',
                background: 'var(--win-accent)',
              }}
            />
          </div>
          <span className="text-[10px] text-win-text-secondary whitespace-nowrap">
            {dateStats.completed}/{dateStats.total}
          </span>
        </div>
      </div>
    </div>
  )
}
