import { useState } from 'react'
import { X, Sun, Moon, Type, Image, Palette, Clock } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'

interface SettingsPanelProps {
  onClose: () => void
}

const ACCENT_COLORS = [
  '#0067c0', // Blue
  '#c42b1c', // Red
  '#f7630c', // Orange
  '#0f7b0f', // Green
  '#7b4f9d', // Purple
  '#008272', // Teal
  '#e74856', // Rose
  '#e0790b', // Amber
]

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-win-card rounded-win-lg border border-win-border shadow-win-lg w-full max-w-md mx-4 animate-slide-in-right overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-win-border">
          <h2 className="text-base font-medium">设置</h2>
          <button className="win-btn-ghost p-1.5 rounded-win-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Theme */}
          <div>
            <label className="text-xs text-win-text-secondary font-medium flex items-center gap-1.5 mb-2">
              <Palette size={14} />
              主题模式
            </label>
            <div className="flex gap-2">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-win-sm border transition-all ${
                  settings.theme === 'light'
                    ? 'border-win-accent bg-win-input-focus text-win-accent font-medium'
                    : 'border-win-border hover:bg-win-input-bg'
                }`}
                onClick={() => updateSettings({ theme: 'light' })}
              >
                <Sun size={14} />
                <span className="text-sm">浅色</span>
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-win-sm border transition-all ${
                  settings.theme === 'dark'
                    ? 'border-win-accent bg-win-input-focus text-win-accent font-medium'
                    : 'border-win-border hover:bg-win-input-bg'
                }`}
                onClick={() => updateSettings({ theme: 'dark' })}
              >
                <Moon size={14} />
                <span className="text-sm">深色</span>
              </button>
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label className="text-xs text-win-text-secondary font-medium flex items-center gap-1.5 mb-2">
              <Palette size={14} />
              主题色
            </label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: settings.accentColor === color ? 'var(--win-text)' : 'transparent',
                    boxShadow:
                      settings.accentColor === color ? `0 0 0 2px ${color}40` : 'none',
                  }}
                  onClick={() => updateSettings({ accentColor: color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label className="text-xs text-win-text-secondary font-medium flex items-center gap-1.5 mb-2">
              <Type size={14} />
              字体大小
            </label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  className={`flex-1 py-1.5 rounded-win-sm border text-sm transition-all ${
                    settings.fontSize === size
                      ? 'border-win-accent bg-win-input-focus text-win-accent font-medium'
                      : 'border-win-border hover:bg-win-input-bg'
                  }`}
                  onClick={() => updateSettings({ fontSize: size })}
                >
                  {{ small: '小', medium: '中', large: '大' }[size]}
                </button>
              ))}
            </div>
          </div>

          {/* Default reminder time */}
          <div>
            <label className="text-xs text-win-text-secondary font-medium flex items-center gap-1.5 mb-2">
              <Clock size={14} />
              默认提醒时间
            </label>
            <input
              type="time"
              value={settings.defaultReminderTime}
              onChange={(e) => updateSettings({ defaultReminderTime: e.target.value })}
              className="win-input text-sm w-32"
            />
          </div>

          {/* Background blur */}
          <div>
            <label className="text-xs text-win-text-secondary font-medium flex items-center gap-1.5 mb-2">
              <Image size={14} />
              背景模糊强度: {settings.backgroundBlur}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={settings.backgroundBlur}
              onChange={(e) => updateSettings({ backgroundBlur: parseInt(e.target.value) })}
              className="w-full accent-win-accent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-win-border bg-win-bg-secondary/40">
          <span className="text-xs text-win-text-secondary">DeskTodo v1.0.0</span>
          <button className="win-btn win-btn-primary text-sm" onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
