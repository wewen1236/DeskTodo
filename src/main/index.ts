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

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 720,
    minHeight: 480,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
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

function createMiniWindow(): BrowserWindow {
  if (miniWindow) {
    miniWindow.show()
    miniWindow.focus()
    return miniWindow
  }

  miniWindow = new BrowserWindow({
    width: 340,
    height: 420,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    backgroundMaterial: 'acrylic',
    titleBarStyle: 'hidden',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_RENDERER_URL) {
    const url = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'
    miniWindow.loadURL(url + '?mini=true')
  } else {
    miniWindow.loadFile(join(__dirname, '../renderer/index.html'), { query: { mini: 'true' } })
  }

  miniWindow.on('closed', () => {
    miniWindow = null
  })

  return miniWindow
}

function loadWindowContent(win: BrowserWindow) {
  if (process.env.NODE_ENV === 'development' || process.env.ELECTRON_RENDERER_URL) {
    const url = process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173'
    win.loadURL(url)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  const store = createStore()

  // Auto-start with Windows
  app.setLoginItemSettings({ openAtLogin: true })

  mainWindow = createMainWindow()
  loadWindowContent(mainWindow)

  tray = createTray(mainWindow, () => {
    if (miniWindow) {
      miniWindow.close()
      miniWindow = null
    }
    isQuitting = true
    app.quit()
  })

  registerIpcHandlers(mainWindow, store, {
    createMiniWindow,
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
