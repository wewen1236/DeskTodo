import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTodoStore } from '@/store/todoStore'
import { getTodayStr } from '@/utils/helpers'
import { format, addDays, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function DateHeader() {
  const { selectedDate, setSelectedDate, goToToday } = useTodoStore()
  const today = getTodayStr()
  const isToday = selectedDate === today

  const dateObj = new Date(selectedDate)

  return (
    <div className="flex items-center justify-between px-5 py-2 border-b border-win-border">
      <div className="flex items-center gap-1">
        <button
          className="win-btn-ghost p-1 rounded-win-sm"
          onClick={() => setSelectedDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'))}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium min-w-[180px] text-center">
          {isToday ? '今天' : format(dateObj, 'M月d日')}
          <span className="text-win-text-secondary text-xs ml-1 font-normal">
            {format(dateObj, 'EEEE', { locale: zhCN })}
          </span>
        </span>
        <button
          className="win-btn-ghost p-1 rounded-win-sm"
          onClick={() => setSelectedDate(format(addDays(dateObj, 1), 'yyyy-MM-dd'))}
        >
          <ChevronRight size={16} />
        </button>
      </div>
      {!isToday && (
        <button className="win-btn text-xs" onClick={goToToday}>
          回到今天
        </button>
      )}
    </div>
  )
}
