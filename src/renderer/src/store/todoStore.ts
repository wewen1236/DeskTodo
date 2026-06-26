import { create } from 'zustand'
import { Todo, Reminder } from '@/types'
import { getTodayStr, isDateInPeriod } from '@/utils/helpers'

interface TodoState {
  todos: Todo[]
  searchQuery: string
  filterCompleted: 'all' | 'active' | 'completed'
  filterPriority: 'all' | 'high' | 'medium' | 'low'
  filterTag: string | null
  sortBy: 'order' | 'dueDate' | 'createdAt' | 'priority'
  sortDirection: 'asc' | 'desc'
  selectedDate: string

  setSelectedDate: (date: string) => void
  goToToday: () => void
  loadTodos: (todos: Todo[]) => void
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'deletedAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  permanentlyDeleteTodo: (id: string) => void
  restoreTodo: (id: string) => void
  toggleComplete: (id: string, date?: string) => void
  reorderTodos: (activeId: string, overId: string) => void

  setSearchQuery: (query: string) => void
  setFilterCompleted: (filter: 'all' | 'active' | 'completed') => void
  setFilterPriority: (filter: 'all' | 'high' | 'medium' | 'low') => void
  setFilterTag: (tag: string | null) => void
  setSortBy: (sort: 'order' | 'dueDate' | 'createdAt' | 'priority') => void
  toggleSortDirection: () => void

  getFilteredTodos: (listId: string) => Todo[]
  getTrashTodos: () => Todo[]
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  searchQuery: '',
  filterCompleted: 'all',
  filterPriority: 'all',
  filterTag: null,
  sortBy: 'order',
  sortDirection: 'asc',
  selectedDate: getTodayStr(),

  setSelectedDate: (date) => set({ selectedDate: date }),
  goToToday: () => set({ selectedDate: getTodayStr() }),
  loadTodos: (todos) => set({ todos }),

  addTodo: (todo) => {
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      deletedAt: null,
      isPeriodic: todo.isPeriodic ?? false,
      periodStart: todo.periodStart ?? null,
      periodEnd: todo.periodEnd ?? null,
      completedDates: todo.completedDates ?? [],
    }
    set((state) => ({ todos: [...state.todos, newTodo] }))
  },

  updateTodo: (id, updates) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },

  deleteTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t
      ),
    }))
  },

  permanentlyDeleteTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }))
  },

  restoreTodo: (id) => {
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, deletedAt: null } : t
      ),
    }))
  },

  toggleComplete: (id: string, date?: string) => {
    set((state) => ({
      todos: state.todos.map((t) => {
        if (t.id !== id) return t

        if (t.isPeriodic && date) {
          const day = date.slice(0, 10)
          const alreadyCompleted = t.completedDates.includes(day)
          return {
            ...t,
            completedDates: alreadyCompleted
              ? t.completedDates.filter((d) => d !== day)
              : [...t.completedDates, day],
          }
        }

        return { ...t, completed: !t.completed }
      }),
    }))
  },

  reorderTodos: (activeId, overId) => {
    set((state) => {
      const activeIndex = state.todos.findIndex((t) => t.id === activeId)
      const overIndex = state.todos.findIndex((t) => t.id === overId)
      if (activeIndex === -1 || overIndex === -1) return state

      const newTodos = [...state.todos]
      const [moved] = newTodos.splice(activeIndex, 1)
      newTodos.splice(overIndex, 0, moved)

      return {
        todos: newTodos.map((t, i) => ({ ...t, order: i })),
      }
    })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCompleted: (filter) => set({ filterCompleted: filter }),
  setFilterPriority: (filter) => set({ filterPriority: filter }),
  setFilterTag: (tag) => set({ filterTag: tag }),
  setSortBy: (sort) => set({ sortBy: sort }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
    })),

  getFilteredTodos: (listId) => {
    const { todos, searchQuery, filterCompleted, filterPriority, filterTag, sortBy, sortDirection, selectedDate } = get()
    let filtered = todos.filter((t) => t.listId === listId && !t.deletedAt && !t.isPeriodic)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.note.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (filterCompleted === 'active' || filterCompleted === 'completed') {
      const today = getTodayStr()
      filtered = filtered.filter((t) => {
        if (t.isPeriodic && t.periodStart && t.periodEnd && isDateInPeriod(today, t.periodStart, t.periodEnd)) {
          const isCompletedToday = t.completedDates.includes(today)
          return filterCompleted === 'active' ? !isCompletedToday : isCompletedToday
        }
        return filterCompleted === 'active' ? !t.completed : t.completed
      })
    }

    if (filterPriority !== 'all') filtered = filtered.filter((t) => t.priority === filterPriority)

    if (filterTag) {
      filtered = filtered.filter((t) => t.tags.includes(filterTag!))
    }

    // Date filter: only show todos matching the selected date
    // Todos without dueDate pass through; todos with dueDate must match selectedDate
    filtered = filtered.filter((t) => {
      if (!t.dueDate) return true
      return t.dueDate.slice(0, 10) === selectedDate
    })

    filtered.sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'order':
          cmp = a.order - b.order
          break
        case 'dueDate':
          cmp = (a.dueDate || '').localeCompare(b.dueDate || '')
          break
        case 'createdAt':
          cmp = a.createdAt.localeCompare(b.createdAt)
          break
        case 'priority': {
          const prio = { high: 3, medium: 2, low: 1 }
          cmp = (prio[b.priority] || 0) - (prio[a.priority] || 0)
          break
        }
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return filtered
  },

  getTrashTodos: () => {
    return get().todos.filter((t) => t.deletedAt !== null)
  },
}))
