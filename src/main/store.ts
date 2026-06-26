import { app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

class Store {
  private data: Record<string, any> = {}
  private filePath: string

  constructor() {
    const userDataPath = app.getPath('userData')
    this.filePath = join(userDataPath, 'desktodo-data.json')
    this.load()
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

  get(key: string): any {
    return this.data[key]
  }

  set(key: string, value: any): void {
    this.data[key] = value
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
