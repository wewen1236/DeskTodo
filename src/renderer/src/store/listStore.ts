import { create } from 'zustand'
import { TodoList } from '@/types'

interface ListState {
  lists: TodoList[]
  activeListId: string | null
  sidebarCollapsed: boolean

  loadLists: (lists: TodoList[]) => void
  addList: (name: string) => void
  renameList: (id: string, name: string) => void
  deleteList: (id: string) => void
  setActiveList: (id: string) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

const DEFAULT_LISTS: TodoList[] = [
  { id: 'default', name: '收集箱', icon: 'inbox', order: 0 },
  { id: 'work', name: '工作', icon: 'briefcase', order: 1 },
  { id: 'personal', name: '个人', icon: 'user', order: 2 },
]

export const useListStore = create<ListState>((set, get) => ({
  lists: DEFAULT_LISTS,
  activeListId: 'default',
  sidebarCollapsed: false,

  loadLists: (lists) => {
    if (lists && lists.length > 0) {
      set({ lists, activeListId: lists[0].id })
    }
  },

  addList: (name) => {
    const newList: TodoList = {
      id: crypto.randomUUID(),
      name,
      icon: 'list',
      order: get().lists.length,
    }
    set((state) => ({ lists: [...state.lists, newList] }))
  },

  renameList: (id, name) => {
    set((state) => ({
      lists: state.lists.map((l) => (l.id === id ? { ...l, name } : l)),
    }))
  },

  deleteList: (id) => {
    set((state) => {
      const newLists = state.lists.filter((l) => l.id !== id)
      const newActiveId = state.activeListId === id ? newLists[0]?.id || null : state.activeListId
      return { lists: newLists, activeListId: newActiveId }
    })
  },

  setActiveList: (id) => set({ activeListId: id }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
