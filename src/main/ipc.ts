import { BrowserWindow, ipcMain, dialog, Notification } from 'electron'
import { writeFileSync, readFileSync } from 'fs'
import { AppStore } from './store'

export function registerIpcHandlers(
  mainWindow: BrowserWindow,
  store: AppStore,
  windows: {
    createMiniWindow: () => BrowserWindow
    getMiniWindow: () => BrowserWindow | null
  }
) {
  // Window controls
  ipcMain.on('window:minimize', () => mainWindow.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  ipcMain.on('window:close', () => mainWindow.hide())

  ipcMain.handle('window:isMaximized', () => mainWindow.isMaximized())

  ipcMain.on('window:toggleAlwaysOnTop', (_event, isOnTop: boolean) => {
    mainWindow.setAlwaysOnTop(isOnTop)
  })

  // Mini window
  ipcMain.on('window:openMini', () => {
    windows.createMiniWindow()
  })

  ipcMain.on('window:closeMini', () => {
    const mini = windows.getMiniWindow()
    if (mini) {
      mini.close()
    }
  })

  ipcMain.on('window:restoreFromMini', () => {
    const mini = windows.getMiniWindow()
    if (mini) {
      mini.close()
    }
    mainWindow.show()
    mainWindow.focus()
  })

  // Store operations
  ipcMain.handle('store:get', (_event, key: string) => {
    return store.get(key)
  })

  let lastBgColor = ''

  ipcMain.handle('store:set', (event, key: string, value: any) => {
    store.set(key, value)

    // Sync window background color synchronously when theme changes
    // This runs BEFORE data:updated broadcast to prevent DWM/CSS mismatch flash
    if (key === 'settings' && value?.theme) {
      const bgColor = value.theme === 'dark' ? '#202020' : '#f3f3f3'
      if (bgColor !== lastBgColor) {
        lastBgColor = bgColor
        BrowserWindow.getAllWindows().forEach((win) => {
          win.setBackgroundColor(bgColor)
        })
      }
    }

    // Notify all other windows of data change
    if (key === 'todos' || key === 'settings') {
      BrowserWindow.getAllWindows().forEach((win) => {
        if (win.webContents.id !== event.sender.id) {
          win.webContents.send('data:updated', { key, value })
        }
      })
    }
    return true
  })

  ipcMain.handle('store:delete', (_event, key: string) => {
    store.delete(key)
    return true
  })

  // Notifications
  ipcMain.on('notification:show', (_event, data: { title: string; body: string }) => {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: data.title,
        body: data.body,
        icon: undefined,
      })
      notification.on('click', () => {
        mainWindow.show()
        mainWindow.focus()
      })
      notification.show()
    }
  })

  // File export
  ipcMain.handle('file:export', async (_event, data: { content: string; defaultName: string; filters: any[] }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: data.defaultName,
      filters: data.filters,
    })
    if (!result.canceled && result.filePath) {
      writeFileSync(result.filePath, data.content, 'utf-8')
      return true
    }
    return false
  })

  // File import
  ipcMain.handle('file:import', async (_event, filters: any[]) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters,
      properties: ['openFile'],
    })
    if (!result.canceled && result.filePaths.length > 0) {
      return readFileSync(result.filePaths[0], 'utf-8')
    }
    return null
  })

  // Theme background color
  ipcMain.on('window:setBackgroundColor', (event, color: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      win.setBackgroundColor(color)
    }
  })

  // Window maximize state change
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximizeChange', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximizeChange', false)
  })
}
