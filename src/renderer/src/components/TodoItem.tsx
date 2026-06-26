import { useState } from 'react'
import { GripVertical, ChevronDown, ChevronRight, Calendar, Trash2, Edit3, Bell } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Todo } from '@/types'
import { format } from 'date-fns'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggleComplete, onEdit, onDelete }: TodoItemProps) {
  const [expanded, setExpanded] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityClass = `priority-${todo.priority}`
  const priorityLabel = { high: '高', medium: '中', low: '低' }[todo.priority]
  const priorityColor = {
    high: 'text-[#c42b1c] bg-[#c42b1c]/10',
    medium: 'text-[#f7630c] bg-[#f7630c]/10',
    low: 'text-[#0078d4] bg-[#0078d4]/10',
  }[todo.priority]

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item group bg-win-card rounded-win border-win-border border ${priorityClass} transition-all animate-slide-in-up ${
        todo.completed ? 'opacity-60' : ''
      } ${isDragging ? 'shadow-win-lg z-50' : 'hover:shadow-win'}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <button
          className="drag-handle flex-shrink-0 p-0.5 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>

        {/* Checkbox */}
        <button
          className={`win-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => onToggleComplete(todo.id)}
        />

        {/* Title & metadata */}
        <div className="flex-1 min-w-0" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm truncate ${todo.completed ? 'line-through text-win-text-secondary' : 'text-win-text'}`}
            >
              {todo.title}
            </span>
            {/* Priority badge */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${priorityColor}`}>
              {priorityLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {todo.dueDate && (
              <span
                className={`text-[11px] flex items-center gap-1 ${
                  isOverdue ? 'text-[#c42b1c] font-medium' : 'text-win-text-secondary'
                }`}
              >
                <Calendar size={10} />
                {format(new Date(todo.dueDate), 'M月d日')}
                {isOverdue && ' · 已过期'}
              </span>
            )}
            {todo.reminder?.enabled && (
              <span className="text-[11px] text-win-text-secondary flex items-center gap-1">
                <Bell size={10} />
                {todo.reminder.time}
              </span>
            )}
            {todo.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {todo.tags.map((tag) => (
                  <span key={tag} className="win-tag text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
          <button
            className="win-btn-ghost p-1.5 rounded-win-sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <button
            className="win-btn-ghost p-1.5 rounded-win-sm"
            onClick={() => onEdit(todo)}
          >
            <Edit3 size={13} />
          </button>
          <button
            className="win-btn-ghost p-1.5 rounded-win-sm hover:text-[#c42b1c]"
            onClick={() => onDelete(todo.id)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-win-border animate-slide-down">
          <div className="pt-2.5 space-y-2">
            {todo.note && (
              <div>
                <span className="text-[11px] text-win-text-secondary font-medium">备注</span>
                <p className="text-sm text-win-text mt-0.5 whitespace-pre-wrap">{todo.note}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-[11px] text-win-text-secondary">
              {todo.dueDate && (
                <span>
                  截止: {format(new Date(todo.dueDate), 'yyyy年M月d日 HH:mm')}
                </span>
              )}
              <span>
                创建: {format(new Date(todo.createdAt), 'M月d日 HH:mm')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
