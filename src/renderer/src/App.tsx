import { useEffect, useState, useRef } from 'react'
import { useTodoStore } from './store/todoStore'
import { useListStore } from './store/listStore'
import { useSettingsStore } from './store/settingsStore'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { SearchBar } from './components/SearchBar'
import { TodoList } from './components/TodoList'
import { CalendarView } from './components/CalendarView'
import { MiniWindow } from './components/MiniWindow'
import { SettingsPanel } from './components/SettingsPanel'
import { TrashPanel } from './components/TrashPanel'
import { AddEditModal } from './components/AddEditModal'
import { Todo } from './types'

type AppRoute = 'todos' | 'calendar' | 'trash'
const isMini = new URLSearchParams(window.location.search).get('mini') === 'true'

export default function App() {
  const { loadTodos, todos, addTodo, updateTodo, deleteTodo, restoreTodo, permanentlyDeleteTodo, toggleComplete } =
    useTodoStore()
  const { loadLists, lists, activeListId } = useListStore()
  const { loadSettings, settings, settingsOpen, setSettingsOpen } = useSettingsStore()

  const [route, setRoute] = useState<AppRoute>('todos')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const skipSync = useRef(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [savedTodos, savedLists, savedSettings] = await Promise.all([
          window.electronAPI.store.get('todos'),
          window.electronAPI.store.get('lists'),
          window.electronAPI.store.get('settings'),
        ])
        if (savedTodos) loadTodos(savedTodos)
        if (savedLists) loadLists(savedLists)
        if (savedSettings) loadSettings(savedSettings)
        else loadSettings({})
      } catch {
        loadSettings({})
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false
      return
    }
    if (todos.length > 0 || useTodoStore.getState().todos.length > 0) {
      window.electronAPI.store.set('todos', useTodoStore.getState().todos)
    }
  }, [todos])

  useEffect(() => {
    window.electronAPI.store.set('lists', lists)
  }, [lists])

  useEffect(() => {
    window.electronAPI.store.set('settings', settings)
  }, [settings])

  useEffect(() => {
    const unsub1 = window.electronAPI.on('shortcut:new-todo', () => setAddModalOpen(true))
    const unsub2 = window.electronAPI.on('shortcut:focus-search', () => {
      document.querySelector<HTMLInputElement>('[data-search-input]')?.focus()
    })
    const unsub3 = window.electronAPI.on('data:updated', ({ key, value }: any) => {
      if (key === 'todos') {
        skipSync.current = true
        loadTodos(value)
      }
    })
    return () => {
      unsub1?.()
      unsub2?.()
      unsub3?.()
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (settingsOpen) setSettingsOpen(false)
        else if (editingTodo) setEditingTodo(null)
        else if (addModalOpen) setAddModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settingsOpen, editingTodo, addModalOpen])

  if (isMini) {
    return (
      <MiniWindow
        todos={todos.filter((t) => !t.deletedAt && !t.completed).slice(0, 5)}
        onToggleComplete={toggleComplete}
        onDelete={deleteTodo}
        onAddTodo={(title) => {
          if (!title.trim()) return
          addTodo({
            title: title.trim(),
            note: '',
            priority: 'medium',
            dueDate: null,
            tags: [],
            completed: false,
            listId: activeListId || 'default',
            reminder: null,
            order: todos.length,
          })
        }}
      />
    )
  }

  const activeList = lists.find((l) => l.id === activeListId)
  const listTodos = todos.filter((t) => t.listId === activeListId && !t.deletedAt)

  return (
    <div className="win-window">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100% - 40px)' }}>
        <Sidebar
          lists={lists}
          activeListId={activeListId}
          route={route}
          onRouteChange={setRoute}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <SearchBar />
          <div className="flex-1 overflow-hidden">
            {route === 'todos' && (
              <TodoList
                todos={listTodos}
                onToggleComplete={toggleComplete}
                onEdit={setEditingTodo}
                onDelete={deleteTodo}
                onAdd={() => setAddModalOpen(true)}
              />
            )}
            {route === 'calendar' && (
              <CalendarView
                todos={todos.filter((t) => !t.deletedAt)}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onToggleComplete={toggleComplete}
              />
            )}
            {route === 'trash' && (
              <TrashPanel
                onRestore={restoreTodo}
                onPermanentDelete={permanentlyDeleteTodo}
              />
            )}
          </div>
        </div>
      </div>

      {addModalOpen && (
        <AddEditModal
          lists={lists}
          activeListId={activeListId || 'default'}
          onSave={(data) => {
            addTodo({
              ...data,
              completed: false,
              reminder: data.reminder || null,
              order: todos.filter((t) => t.listId === (activeListId || 'default') && !t.deletedAt).length,
            })
            setAddModalOpen(false)
          }}
          onClose={() => setAddModalOpen(false)}
        />
      )}

      {editingTodo && (
        <AddEditModal
          todo={editingTodo}
          lists={lists}
          activeListId={editingTodo.listId}
          onSave={(data) => {
            updateTodo(editingTodo.id, data)
            setEditingTodo(null)
          }}
          onClose={() => setEditingTodo(null)}
        />
      )}

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
