import { Tray, Menu, BrowserWindow, app, nativeImage, NativeImage } from 'electron'
import { join } from 'path'

export function createTray(
  mainWindow: BrowserWindow,
  onQuit: () => void
): Tray {
  const iconPath = join(__dirname, '../../resources/icon-16.png')
  let icon: NativeImage
  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) throw new Error('empty')
  } catch {
    icon = nativeImage.createFromDataURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEoSURBVDiNpZMxTsNAEEX/rNeOAwUlHVdA4gJcAokLUNDRcAQkLkCBaOgouQIVHZyAgoKSK0TnZNdLwWLFjp2VLM3szP/3d2ZWCcBfHMbYDyAWkd8kIgER50T0FpEAYIz5BgCRpt/3L4wxP0SU9wFEzs2yrM7n87O+70e9Xm9R1/Vm13WTJEk2VVXtA4AQ60dENk3THM8BrusmSZK8KKV2AJRzAM65F0KIGwBbALiu6/6s6/roA0AIIQeGYWzbNgPoASilVF3X1Waz+Z5MJk/XAd5733EcR2ZZnud5KaUsAHzf99+EEB8AJs45NhgM3jjnW9/3P8fj8dc1AAAMw/A5SZI3IUSnlMrn8/nPsizzPM8XaZo+p2n6QG6aph8A3qbT6XsI8Q0cIW6EEI1SagvgIoQ4I+ea+qY5Qoi/Afxrr0gIgJsAAAAASUVORK5CYII='
    )
  }

  const tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('DeskTodo')

  const updateMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          mainWindow.show()
          mainWindow.focus()
        }
      },
      {
        label: '快速新建待办',
        click: () => {
          mainWindow.show()
          mainWindow.focus()
          mainWindow.webContents.send('shortcut:new-todo')
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: onQuit
      }
    ])
    tray.setContextMenu(contextMenu)
  }

  updateMenu()

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  return tray
}
