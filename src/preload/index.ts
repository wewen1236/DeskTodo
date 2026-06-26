import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    toggleAlwaysOnTop: (isOnTop: boolean) => ipcRenderer.send('window:toggleAlwaysOnTop', isOnTop),
    openMini: () => ipcRenderer.send('window:openMini'),
    closeMini: () => ipcRenderer.send('window:closeMini'),
    restoreFromMini: () => ipcRenderer.send('window:restoreFromMini'),
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
      const handler = (_event: any, isMaximized: boolean) => callback(isMaximized)
      ipcRenderer.on('window:maximizeChange', handler)
      return () => ipcRenderer.removeListener('window:maximizeChange', handler)
    },
  },
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },
  notification: {
    show: (data: { title: string; body: string }) => ipcRenderer.send('notification:show', data),
  },
  file: {
    export: (data: { content: string; defaultName: string; filters: any[] }) =>
      ipcRenderer.invoke('file:export', data),
    import: (filters: any[]) => ipcRenderer.invoke('file:import', filters),
  },
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = ['shortcut:new-todo', 'shortcut:focus-search', 'data:updated']
    if (validChannels.includes(channel)) {
      const handler = (_event: any, ...args: any[]) => callback(...args)
      ipcRenderer.on(channel, handler)
      return () => ipcRenderer.removeListener(channel, handler)
    }
    return () => {}
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
