import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { useTodoStore } from '@/store/todoStore'
import { format } from 'date-fns'

interface TrashPanelProps {
  onRestore: (id: string) => void
  onPermanentDelete: (id: string) => void
}

export function TrashPanel({ onRestore, onPermanentDelete }: TrashPanelProps) {
  const trashTodos = useTodoStore((state) =>
    state.todos
      .filter((t) => t.deletedAt !== null)
      .sort((a, b) => (b.deletedAt || '').localeCompare(a.deletedAt || ''))
  )

  if (trashTodos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-win-text-secondary gap-3 animate-fade-in">
        <Trash2 size={40} strokeWidth={1} opacity={0.3} />
        <p className="text-sm">回收站为空</p>
        <p className="text-xs opacity-70">删除的待办将显示在此处</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-5 py-3 border-b border-win-border">
        <div className="flex items-center gap-2">
          <Trash2 size={16} className="text-win-text-secondary" />
          <span className="text-sm font-medium">回收站</span>
          <span className="text-xs text-win-text-secondary">· {trashTodos.length} 项</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
        {trashTodos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-win-sm border border-win-border bg-win-card group hover:shadow-win transition-all animate-slide-in-up"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-win-text truncate">{todo.title}</p>
              {todo.deletedAt && (
                <p className="text-[11px] text-win-text-secondary mt-0.5">
                  删除于 {format(new Date(todo.deletedAt), 'M月d日 HH:mm')}
                </p>
              )}
            </div>
            <div className="hidden group-hover:flex items-center gap-1">
              <button
                className="win-btn-ghost p-1.5 rounded-win-sm text-win-accent"
                onClick={() => onRestore(todo.id)}
                title="恢复"
              >
                <RotateCcw size={14} />
              </button>
              <button
                className="win-btn-ghost p-1.5 rounded-win-sm hover:text-[#c42b1c]"
                onClick={() => onPermanentDelete(todo.id)}
                title="永久删除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div className="px-5 py-2.5 border-t border-win-border bg-win-bg-secondary/40">
        <p className="text-[11px] text-win-text-secondary flex items-center gap-1">
          <AlertTriangle size={11} />
          永久删除后将无法恢复
        </p>
      </div>
    </div>
  )
}
