import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

interface TodoItem {
  id: string
  completed: boolean
  deletedAt: string | null
  createdAt: string
  isPeriodic?: boolean
  completedDates?: string[]
  [key: string]: any
}

class Store {
  private data: Record<string, any> = {}
  private filePath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.filePath = join(userDataPath, 'desktodo-data.json')
    this.load()
    this.cleanup()
  }

  private load() {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw)
      }
    } catch {
      this.data = {}
    }
  }

  private save() {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to save store:', err)
    }
  }

  private cleanup() {
    const todos: TodoItem[] | undefined = this.data['todos']
    if (!todos || !Array.isArray(todos)) return

    const cutoff = Date.now() - ONE_YEAR_MS

    const cleaned = todos.filter((t) => {
      if (t.deletedAt && new Date(t.deletedAt).getTime() < cutoff) return false
      if (t.completed && !t.isPeriodic && new Date(t.createdAt).getTime() < cutoff) return false
      return true
    }).map((t) => {
      if (t.isPeriodic && t.completedDates && t.completedDates.length > 0) {
        const cutoffStr = new Date(cutoff).toISOString().slice(0, 10)
        return { ...t, completedDates: t.completedDates.filter((d: string) => d >= cutoffStr) }
      }
      return t
    })

    if (cleaned.length !== todos.length) {
      this.data['todos'] = cleaned
    }
  }

  get(key: string): any {
    return this.data[key]
  }

  set(key: string, value: any): void {
    this.data[key] = value
    if (key === 'todos') {
      this.cleanup()
    }
    this.save()
  }

  delete(key: string): void {
    delete this.data[key]
    this.save()
  }

  getAll(): Record<string, any> {
    return { ...this.data }
  }
}

let storeInstance: Store | null = null

export function createStore(): Store {
  if (!storeInstance) {
    storeInstance = new Store()
  }
  return storeInstance
}

export type AppStore = Store
