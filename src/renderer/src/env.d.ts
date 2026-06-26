/// <reference types="vite/client" />

interface ElectronAPI {
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    isMaximized: () => Promise<boolean>
    toggleAlwaysOnTop: (isOnTop: boolean) => void
    openMini: () => void
    closeMini: () => void
    restoreFromMini: () => void
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void
    setBackgroundColor: (color: string) => void
  }
  store: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<boolean>
    delete: (key: string) => Promise<boolean>
  }
  notification: {
    show: (data: { title: string; body: string }) => void
  }
  file: {
    export: (data: { content: string; defaultName: string; filters: any[] }) => Promise<boolean>
    import: (filters: any[]) => Promise<string | null>
  }
  on: (channel: string, callback: (...args: any[]) => void) => (() => void) | undefined
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    __INITIAL_THEME__: 'light' | 'dark'
  }
}

export {}
