import { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, NativeImage, nativeImage, Notification } from 'electron'
import { join } from 'path'
import { createStore } from './store'
import { createTray } from './tray'
import { registerIpcHandlers } from './ipc'

let mainWindow: BrowserWindow | null = null
let miniWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

const isWin11 = process.platform === 'win32'

function createMainWindow(theme: string): BrowserWindow {
  const win = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 720,
    minHeight: 480,
    frame: false,
    backgroundColor: theme === 'dark' ? '#202020' : '#f3f3f3',
    backgroundMaterial: 'mica',
    titleBarStyle: 'hidden',
    show: false,
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.on('ready-to-show', () => {
    // Don't auto-show — user clicks tray icon to open
  })

  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  return win
}

function createMiniWindow(theme: string): BrowserWindow {
  if (miniWindow) {
    miniWindow.show()
    miniWindow.focus()
    return miniWindow
  }

  miniWindow = new BrowserWindow({
    width: 340,
    height: 420,
    minWidth: 280,
    minHeight: 320,
    frame: false,
    backgroundColor: theme === 'dark' ? '#202020' : '#f3f3f3',
    backgroundMaterial: 'acrylic',
    titleBarStyle: 'hidden',
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_RENDERER_URL) {
    const url = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'
    miniWindow.loadURL(url + '?mini=true&theme=' + theme)
  } else {
    miniWindow.loadFile(join(__dirname, '../renderer/index.html'), { query: { mini: 'true', theme } })
  }

  miniWindow.on('closed', () => {
    miniWindow = null
  })

  return miniWindow
}

function loadWindowContent(win: BrowserWindow, theme: string) {
  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_RENDERER_URL) {
    const url = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'
    win.loadURL(url + '?theme=' + theme)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { query: { theme } })
  }
}

app.whenReady().then(() => {
  const store = createStore()

  // Auto-start with Windows
  app.setLoginItemSettings({ openAtLogin: true })

  const settings = store.get('settings') as { theme?: string } | undefined
  const savedTheme = settings?.theme || 'light'

  mainWindow = createMainWindow(savedTheme)
  loadWindowContent(mainWindow, savedTheme)

  tray = createTray(mainWindow, () => {
    if (miniWindow) {
      miniWindow.close()
      miniWindow = null
    }
    isQuitting = true
    app.quit()
  })

  const wrappedCreateMiniWindow = () => {
    const settings = store.get('settings') as { theme?: string } | undefined
    return createMiniWindow(settings?.theme || 'light')
  }

  registerIpcHandlers(mainWindow, store, {
    createMiniWindow: wrappedCreateMiniWindow,
    getMiniWindow: () => miniWindow,
  })

  globalShortcut.register('CommandOrControl+N', () => {
    mainWindow?.show()
    mainWindow?.focus()
    mainWindow?.webContents.send('shortcut:new-todo')
  })

  globalShortcut.register('CommandOrControl+F', () => {
    mainWindow?.show()
    mainWindow?.focus()
    mainWindow?.webContents.send('shortcut:focus-search')
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit, minimize to tray
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
})
