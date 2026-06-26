import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Todo } from '@/types'

interface CalendarViewProps {
  todos: Todo[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  onToggleComplete: (id: string) => void
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView({ todos, selectedDate, onSelectDate, onToggleComplete }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const getTodosForDate = (date: Date) => {
    return todos.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), date))
  }

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null
  const selectedDateTodos = selectedDateObj
    ? todos.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), selectedDateObj))
    : []

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      {/* Month header */}
      <div className="flex items-center justify-between px-5 py-3">
        <button className="win-btn-ghost p-1.5 rounded-win-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium">
          {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
        </span>
        <button className="win-btn-ghost p-1.5 rounded-win-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="px-5 pb-2">
        {/* Weekday labels */}
        <div className="calendar-grid mb-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-[11px] text-win-text-secondary font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="calendar-grid">
          {days.map((day) => {
            const dayTodos = getTodosForDate(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = selectedDateObj ? isSameDay(day, selectedDateObj) : false
            const isTodayDate = isToday(day)

            return (
              <button
                key={day.toISOString()}
                className={`calendar-day ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''} ${
                  !isCurrentMonth ? 'other-month' : ''
                }`}
                onClick={() => {
                  if (isSelected) {
                    onSelectDate(null)
                  } else {
                    onSelectDate(day.toISOString())
                  }
                }}
              >
                <span>{format(day, 'd')}</span>
                {dayTodos.length > 0 && (
                  <span className="calendar-dot" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date todos */}
      {selectedDateObj && (
        <div className="border-t border-win-border flex-1 overflow-y-auto animate-slide-in-up">
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-sm font-medium">
              {format(selectedDateObj, 'M月d日 EEEE', { locale: zhCN })}
            </span>
            <button className="win-btn-ghost p-1 rounded-win-sm" onClick={() => onSelectDate(null)}>
              <X size={14} />
            </button>
          </div>

          {selectedDateTodos.length === 0 ? (
            <div className="text-center py-8 text-sm text-win-text-secondary">
              该日没有待办事项
            </div>
          ) : (
            <div className="px-4 space-y-1 pb-4">
              {selectedDateTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-win-sm border border-win-border bg-win-card ${
                    todo.completed ? 'opacity-50' : ''
                  }`}
                >
                  <button
                    className={`win-checkbox ${todo.completed ? 'checked' : ''}`}
                    onClick={() => onToggleComplete(todo.id)}
                  />
                  <span
                    className={`text-sm flex-1 truncate ${
                      todo.completed ? 'line-through text-win-text-secondary' : ''
                    }`}
                  >
                    {todo.title}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    todo.priority === 'high'
                      ? 'text-[#c42b1c] bg-[#c42b1c]/10'
                      : todo.priority === 'medium'
                      ? 'text-[#f7630c] bg-[#f7630c]/10'
                      : 'text-[#0078d4] bg-[#0078d4]/10'
                  }`}>
                    {{ high: '高', medium: '中', low: '低' }[todo.priority]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
