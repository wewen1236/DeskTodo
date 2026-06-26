import { useState } from 'react'
import {
  Inbox, Briefcase, User, Calendar, Trash2, Settings, Plus,
  ChevronLeft, ChevronRight, MoreHorizontal, Check
} from 'lucide-react'
import { useListStore } from '@/store/listStore'
import { useTodoStore } from '@/store/todoStore'
import { TodoList } from '@/types'

const ICON_MAP: Record<string, React.ReactNode> = {
  inbox: <Inbox size={16} />,
  briefcase: <Briefcase size={16} />,
  user: <User size={16} />,
  list: <List size={16} />,
}

interface SidebarProps {
  lists: TodoList[]
  activeListId: string | null
  route: string
  onRouteChange: (route: 'todos' | 'calendar' | 'trash') => void
  onOpenSettings: () => void
}

export function Sidebar({ lists, activeListId, route, onRouteChange, onOpenSettings }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, addList, renameList, deleteList, setActiveList } = useListStore()
  const { todos } = useTodoStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showAddList, setShowAddList] = useState(false)
  const [newListName, setNewListName] = useState('')

  const getIncompleteCount = (listId: string) => {
    return todos.filter((t) => t.listId === listId && !t.completed && !t.deletedAt).length
  }

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameList(id, editName.trim())
    }
    setEditingId(null)
  }

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim())
      setNewListName('')
      setShowAddList(false)
    }
  }

  if (sidebarCollapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-3 border-r border-win-border" style={{ width: 48 }}>
        <button
          className="win-btn-ghost p-1.5 rounded-win-sm"
          onClick={toggleSidebar}
          title="展开侧边栏"
        >
          <ChevronRight size={16} />
        </button>
        {lists.map((list) => (
          <button
            key={list.id}
            className={`win-btn-ghost p-2 rounded-win-sm relative ${activeListId === list.id ? 'text-win-accent' : ''}`}
            onClick={() => {
              setActiveList(list.id)
              onRouteChange('todos')
            }}
            title={list.name}
          >
            {ICON_MAP[list.icon] || <List size={16} />}
            {getIncompleteCount(list.id) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-win-accent text-win-accent-text text-[10px] flex items-center justify-center font-medium">
                {getIncompleteCount(list.id)}
              </span>
            )}
          </button>
        ))}
        <div className="w-8 h-px bg-win-divider" />
        <button
          className={`win-btn-ghost p-2 rounded-win-sm ${route === 'calendar' ? 'text-win-accent' : ''}`}
          onClick={() => onRouteChange('calendar')}
          title="日历"
        >
          <Calendar size={16} />
        </button>
        <button
          className={`win-btn-ghost p-2 rounded-win-sm ${route === 'trash' ? 'text-win-accent' : ''}`}
          onClick={() => onRouteChange('trash')}
          title="回收站"
        >
          <Trash2 size={16} />
        </button>
        <div className="flex-1" />
        <button className="win-btn-ghost p-2 rounded-win-sm" onClick={onOpenSettings} title="设置">
          <Settings size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col border-r border-win-border overflow-hidden animate-slide-in-left" style={{ width: 220 }}>
      <div className="flex items-center justify-between px-3 py-2.5">
        <button className="win-btn-ghost p-1 rounded-win-sm" onClick={toggleSidebar} title="折叠侧边栏">
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-medium text-win-text-secondary">清单</span>
        <button className="win-btn-ghost p-1 rounded-win-sm" onClick={() => setShowAddList(true)} title="新建清单">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {lists.map((list) => (
          <div
            key={list.id}
            className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-win-sm cursor-pointer transition-colors mb-0.5 ${
              activeListId === list.id && route === 'todos'
                ? 'bg-win-input-focus text-win-accent font-medium'
                : 'hover:bg-win-input-bg'
            }`}
            onClick={() => {
              setActiveList(list.id)
              onRouteChange('todos')
            }}
          >
            <span className="flex-shrink-0">{ICON_MAP[list.icon] || <List size={16} />}</span>
            {editingId === list.id ? (
              <input
                className="flex-1 bg-transparent border border-win-accent rounded px-1 text-sm outline-none"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleRename(list.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(list.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 text-sm truncate">{list.name}</span>
            )}
            <span className="text-xs text-win-text-secondary min-w-[18px] text-center">
              {getIncompleteCount(list.id) || ''}
            </span>
            {list.id !== 'default' && (
              <div className="hidden group-hover:flex items-center">
                <button
                  className="win-btn-ghost p-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingId(list.id)
                    setEditName(list.name)
                  }}
                >
                  <MoreHorizontal size={12} />
                </button>
                <button
                  className="win-btn-ghost p-0.5 rounded text-win-danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteList(list.id)
                  }}
                >
                  <XIcon size={12} />
                </button>
              </div>
            )}
          </div>
        ))}

        {showAddList && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 animate-slide-down">
            <input
              className="flex-1 bg-win-input-bg border border-win-accent rounded-win-sm px-2 py-1 text-sm outline-none"
              placeholder="清单名称"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={() => {
                handleAddList()
                if (!newListName.trim()) setShowAddList(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddList()
                if (e.key === 'Escape') {
                  setNewListName('')
                  setShowAddList(false)
                }
              }}
              autoFocus
            />
            <button className="win-btn-ghost p-0.5 text-win-accent" onClick={handleAddList}>
              <Check size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-win-divider px-2 py-2">
        <button
          className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-win-sm text-sm transition-colors ${
            route === 'calendar' ? 'bg-win-input-focus text-win-accent' : 'hover:bg-win-input-bg'
          }`}
          onClick={() => onRouteChange('calendar')}
        >
          <Calendar size={16} />
          <span>日历</span>
        </button>
        <button
          className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-win-sm text-sm transition-colors ${
            route === 'trash' ? 'bg-win-input-focus text-win-accent' : 'hover:bg-win-input-bg'
          }`}
          onClick={() => onRouteChange('trash')}
        >
          <Trash2 size={16} />
          <span>回收站</span>
          {todos.filter((t) => t.deletedAt).length > 0 && (
            <span className="ml-auto text-xs text-win-text-secondary">
              {todos.filter((t) => t.deletedAt).length}
            </span>
          )}
        </button>
        <button
          className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-win-sm text-sm hover:bg-win-input-bg transition-colors"
          onClick={onOpenSettings}
        >
          <Settings size={16} />
          <span>设置</span>
        </button>
      </div>
    </div>
  )
}

// Minimal inline components
function List({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
