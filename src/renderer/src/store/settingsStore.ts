import { create } from 'zustand'
import { Settings } from '@/types'

interface SettingsState {
  settings: Settings
  settingsOpen: boolean

  loadSettings: (settings: Partial<Settings>) => void
  updateSettings: (updates: Partial<Settings>) => void
  setSettingsOpen: (open: boolean) => void
  applyTheme: () => void
}

const initialTheme: 'light' | 'dark' =
  typeof window !== 'undefined' && (window as any).__INITIAL_THEME__ === 'dark' ? 'dark' : 'light'

const DEFAULT_SETTINGS: Settings = {
  theme: initialTheme,
  accentColor: '#0067c0',
  backgroundBlur: 8,
  fontSize: 'medium',
  defaultReminderTime: '09:00',
  alwaysOnTop: false,
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  settingsOpen: false,

  loadSettings: (partial) => {
    const settings = { ...DEFAULT_SETTINGS, ...partial }
    set({ settings })
    get().applyTheme()
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }))
    get().applyTheme()
  },

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  applyTheme: () => {
    const { settings } = get()
    if (typeof document === 'undefined') return

    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply accent color
    const accent = settings.accentColor
    root.style.setProperty('--win-accent', accent)
    // Darken for hover
    root.style.setProperty('--win-accent-hover', adjustColor(accent, -15))

    // Apply font size
    const sizeMap: Record<string, string> = {
      small: '0.9',
      medium: '1',
      large: '1.15',
    }
    root.style.setProperty('--font-size-multiplier', sizeMap[settings.fontSize] || '1')
  },
}))

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
