export interface Todo {
  id: string
  title: string
  note: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  tags: string[]
  completed: boolean
  listId: string
  reminder: Reminder | null
  order: number
  createdAt: string
  deletedAt: string | null
  isPeriodic: boolean
  periodStart: string | null
  periodEnd: string | null
  completedDates: string[]
}

export interface Reminder {
  type: 'once' | 'daily' | 'weekly' | 'weekdays'
  time: string
  enabled: boolean
}

export interface TodoList {
  id: string
  name: string
  icon: string
  order: number
}

export interface Settings {
  theme: 'light' | 'dark'
  accentColor: string
  backgroundBlur: number
  fontSize: 'small' | 'medium' | 'large'
  defaultReminderTime: string
  alwaysOnTop: boolean
}

export type ViewType = 'list' | 'calendar'
export type AppRoute = 'todos' | 'calendar' | 'trash' | 'settings'
