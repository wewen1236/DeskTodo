import { useState, useEffect } from 'react'
import { X, Save, Bell, BellOff } from 'lucide-react'
import { Todo, TodoList, Reminder } from '@/types'
import { useSettingsStore } from '@/store/settingsStore'

interface AddEditModalProps {
  todo?: Todo
  lists: TodoList[]
  activeListId: string
  onSave: (data: {
    title: string
    note: string
    priority: 'high' | 'medium' | 'low'
    dueDate: string | null
    tags: string[]
    listId: string
    reminder: Reminder | null
  }) => void
  onClose: () => void
}

export function AddEditModal({ todo, lists, activeListId, onSave, onClose }: AddEditModalProps) {
  const { settings } = useSettingsStore()
  const isEditing = !!todo

  const [title, setTitle] = useState(todo?.title || '')
  const [note, setNote] = useState(todo?.note || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(todo?.priority || 'medium')
  const [dueDate, setDueDate] = useState(todo?.dueDate || '')
  const [dueTime, setDueTime] = useState(() => {
    if (todo?.dueDate) {
      const d = new Date(todo.dueDate)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    return '23:59'
  })
  const [tagsInput, setTagsInput] = useState(todo?.tags.join(', ') || '')
  const [listId, setListId] = useState(todo?.listId || activeListId)
  const [reminderEnabled, setReminderEnabled] = useState(todo?.reminder?.enabled || false)
  const [reminderType, setReminderType] = useState<Reminder['type']>(todo?.reminder?.type || 'once')
  const [reminderTime, setReminderTime] = useState(todo?.reminder?.time || settings.defaultReminderTime || '09:00')

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && e.ctrlKey && title.trim()) {
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [title, note, priority, dueDate, dueTime, tagsInput, listId, reminderEnabled, reminderType, reminderTime])

  function handleSave() {
    if (!title.trim()) return

    let fullDueDate: string | null = null
    if (dueDate) {
      const dt = new Date(dueDate)
      const [h, m] = dueTime.split(':')
      dt.setHours(parseInt(h), parseInt(m))
      fullDueDate = dt.toISOString()
    }

    const reminder: Reminder | null = reminderEnabled
      ? { type: reminderType, time: reminderTime, enabled: true }
      : null

    const tags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    onSave({
      title: title.trim(),
      note: note.trim(),
      priority,
      dueDate: fullDueDate,
      tags,
      listId,
      reminder,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-win-card rounded-win-lg border border-win-border shadow-win-lg w-full max-w-lg mx-4 animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-win-border">
          <h2 className="text-base font-medium">{isEditing ? '编辑待办' : '新建待办'}</h2>
          <button className="win-btn-ghost p-1.5 rounded-win-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="待办标题 *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="win-input w-full text-base font-medium"
              autoFocus
            />
          </div>

          {/* Note */}
          <div>
            <textarea
              placeholder="添加备注..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="win-input w-full resize-none text-sm"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-win-text-secondary mb-1.5 block">优先级</label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  className={`flex-1 py-1.5 text-sm rounded-win-sm border transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'border-[#c42b1c] bg-[#c42b1c]/10 text-[#c42b1c] font-medium'
                        : p === 'medium'
                        ? 'border-[#f7630c] bg-[#f7630c]/10 text-[#f7630c] font-medium'
                        : 'border-[#0078d4] bg-[#0078d4]/10 text-[#0078d4] font-medium'
                      : 'border-win-border text-win-text-secondary hover:bg-win-input-bg'
                  }`}
                  onClick={() => setPriority(p)}
                >
                  {{ high: '高', medium: '中', low: '低' }[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-win-text-secondary mb-1.5 block">截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="win-input w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-win-text-secondary mb-1.5 block">时间</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="win-input w-full text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs text-win-text-secondary mb-1.5 block">标签（逗号分隔）</label>
            <input
              type="text"
              placeholder="例如: 重要, 紧急, 项目A"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="win-input w-full text-sm"
            />
            {tagsInput.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tagsInput
                  .split(/[,，]/)
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
                  .map((tag) => (
                    <span key={tag} className="win-tag text-xs">
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* List */}
          <div>
            <label className="text-xs text-win-text-secondary mb-1.5 block">所属清单</label>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="win-input w-full text-sm"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reminder */}
          <div className="border-t border-win-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-win-text-secondary font-medium flex items-center gap-1.5">
                {reminderEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                提醒
              </label>
              <button
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  reminderEnabled
                    ? 'bg-win-accent text-win-accent-text'
                    : 'bg-win-input-bg text-win-text-secondary'
                }`}
                onClick={() => setReminderEnabled(!reminderEnabled)}
              >
                {reminderEnabled ? '已开启' : '已关闭'}
              </button>
            </div>
            {reminderEnabled && (
              <div className="flex gap-3 animate-slide-down">
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value as Reminder['type'])}
                  className="win-input text-sm flex-1"
                >
                  <option value="once">单次提醒</option>
                  <option value="daily">每天</option>
                  <option value="weekly">每周</option>
                  <option value="weekdays">工作日</option>
                </select>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="win-input text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-win-border bg-win-bg-secondary/40">
          <button className="win-btn text-sm" onClick={onClose}>
            取消
          </button>
          <button
            className="win-btn win-btn-primary text-sm"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Save size={14} />
            {isEditing ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}
