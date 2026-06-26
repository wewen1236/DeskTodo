import { Search, SlidersHorizontal, List, Calendar, ArrowUpDown, Pin, Sun, Moon, Maximize2 } from 'lucide-react'
import { useTodoStore } from '@/store/todoStore'
import { useSettingsStore } from '@/store/settingsStore'
import { ViewType } from '@/types'

interface SearchBarProps {
  viewType?: ViewType
  onViewChange?: (view: ViewType) => void
}

export function SearchBar({ viewType = 'list', onViewChange }: SearchBarProps) {
  const { searchQuery, setSearchQuery, filterCompleted, setFilterCompleted, sortBy, setSortBy, toggleSortDirection, sortDirection } =
    useTodoStore()
  const { settings, updateSettings } = useSettingsStore()

  const themeIcon = settings.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-win-border">
      {/* Search */}
      <div className="flex-1 relative max-w-md">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-win-text-secondary" />
        <input
          data-search-input
          type="text"
          placeholder="搜索待办..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="win-input w-full !pl-9 pr-3 py-1 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1">
        <select
          value={filterCompleted}
          onChange={(e) => setFilterCompleted(e.target.value as any)}
          className="win-input text-xs py-1 px-2 rounded-win-sm"
        >
          <option value="all">全部</option>
          <option value="active">未完成</option>
          <option value="completed">已完成</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="win-input text-xs py-1 px-2 rounded-win-sm"
        >
          <option value="order">默认排序</option>
          <option value="dueDate">截止日期</option>
          <option value="priority">优先级</option>
          <option value="createdAt">创建时间</option>
        </select>

        <button
          className="win-btn-ghost p-1.5 rounded-win-sm"
          onClick={toggleSortDirection}
          title={sortDirection === 'asc' ? '升序' : '降序'}
        >
          <ArrowUpDown size={14} className={sortDirection === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>

        <div className="w-px h-5 bg-win-divider mx-1" />

        {/* View toggle */}
        {onViewChange && (
          <>
            <button
              className={`win-btn-ghost p-1.5 rounded-win-sm ${viewType === 'list' ? 'text-win-accent' : ''}`}
              onClick={() => onViewChange('list')}
              title="列表视图"
            >
              <List size={15} />
            </button>
            <button
              className={`win-btn-ghost p-1.5 rounded-win-sm ${viewType === 'calendar' ? 'text-win-accent' : ''}`}
              onClick={() => onViewChange('calendar')}
              title="日历视图"
            >
              <Calendar size={15} />
            </button>
            <div className="w-px h-5 bg-win-divider mx-1" />
          </>
        )}

        {/* Theme toggle */}
        <button
          className="win-btn-ghost p-1.5 rounded-win-sm"
          onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          title="切换主题"
        >
          {themeIcon}
        </button>

        {/* Always on top */}
        <button
          className={`win-btn-ghost p-1.5 rounded-win-sm ${settings.alwaysOnTop ? 'text-win-accent' : ''}`}
          onClick={() => {
            const newValue = !settings.alwaysOnTop
            updateSettings({ alwaysOnTop: newValue })
            window.electronAPI.window.toggleAlwaysOnTop(newValue)
          }}
          title="窗口置顶"
        >
          <Pin size={15} />
        </button>

        {/* Mini window */}
        <button
          className="win-btn-ghost p-1.5 rounded-win-sm"
          onClick={() => window.electronAPI.window.openMini()}
          title="迷你模式"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}
