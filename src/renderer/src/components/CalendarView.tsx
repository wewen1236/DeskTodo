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
import { getDateStats } from '@/utils/helpers'
import { ProgressRing } from './ProgressRing'

interface CalendarViewProps {
  todos: Todo[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onToggleComplete: (id: string, date?: string) => void
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
    const dateStr = format(date, 'yyyy-MM-dd')
    return todos.filter((t) => {
      if (t.dueDate && isSameDay(new Date(t.dueDate), date)) return true
      if (t.isPeriodic && t.periodStart && t.periodEnd &&
          dateStr >= t.periodStart && dateStr <= t.periodEnd) return true
      return false
    })
  }

  const selectedDateObj = new Date(selectedDate)
  const selectedDateStr = format(selectedDateObj, 'yyyy-MM-dd')
  const selectedDateTodos = todos.filter((t) => {
    if (t.dueDate && isSameDay(new Date(t.dueDate), selectedDateObj)) return true
    if (t.isPeriodic && t.periodStart && t.periodEnd &&
        selectedDateStr >= t.periodStart && selectedDateStr <= t.periodEnd) return true
    return false
  })

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
            const isSelected = isSameDay(day, selectedDateObj)
            const isTodayDate = isToday(day)

            const dayStats = getDateStats(todos, format(day, 'yyyy-MM-dd'))

            return (
              <button
                key={day.toISOString()}
                className={`calendar-day ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''} ${
                  !isCurrentMonth ? 'other-month' : ''
                }`}
                onClick={() => {
                  onSelectDate(format(day, 'yyyy-MM-dd'))
                }}
              >
                <span>{format(day, 'd')}</span>
                {dayStats.total > 0 ? (
                  <ProgressRing total={dayStats.total} completed={dayStats.completed} size={18} strokeWidth={2} />
                ) : (
                  <span className="w-[18px]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date todos */}
      <div className="border-t border-win-border flex-1 overflow-y-auto animate-slide-in-up">
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-sm font-medium">
              {format(selectedDateObj, 'M月d日 EEEE', { locale: zhCN })}
            </span>
          </div>

          {selectedDateTodos.length === 0 ? (
            <div className="text-center py-8 text-sm text-win-text-secondary">
              该日没有待办事项
            </div>
          ) : (
            <div className="px-4 space-y-1 pb-4">
              {selectedDateTodos.map((todo) => {
                const isCompletedForDate = todo.isPeriodic && selectedDateStr
                  ? todo.completedDates.includes(selectedDateStr)
                  : todo.completed
                return (
                <div
                  key={todo.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-win-sm border border-win-border bg-win-card ${
                    isCompletedForDate ? 'opacity-50' : ''
                  }`}
                >
                  <button
                    className={`win-checkbox ${isCompletedForDate ? 'checked' : ''}`}
                    onClick={() => {
                      if (todo.isPeriodic && selectedDate) {
                        onToggleComplete(todo.id, selectedDate)
                      } else {
                        onToggleComplete(todo.id)
                      }
                    }}
                  />
                  <span
                    className={`text-sm flex-1 truncate ${
                      isCompletedForDate ? 'line-through text-win-text-secondary' : ''
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
              )
            })}
            </div>
          )}
        </div>
    </div>
  )
}
