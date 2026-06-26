import { Todo } from '@/types'

export function exportToJSON(todos: Todo[]): string {
  return JSON.stringify(todos, null, 2)
}

export function exportToCSV(todos: Todo[]): string {
  const headers = ['title', 'note', 'priority', 'dueDate', 'tags', 'completed', 'listId', 'createdAt']
  const rows = todos.map((t) =>
    headers
      .map((h) => {
        const val = (t as any)[h]
        if (Array.isArray(val)) return `"${val.join(';')}"`
        if (val === null || val === undefined) return ''
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`
        return String(val)
      })
      .join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export function importFromJSON(json: string): Partial<Todo>[] {
  try {
    const data = JSON.parse(json)
    if (!Array.isArray(data)) throw new Error('Invalid format')
    return data
  } catch {
    throw new Error('无法解析 JSON 数据')
  }
}

export function importFromCSV(csv: string): Partial<Todo>[] {
  const lines = csv.split('\n').filter((l) => l.trim())
  if (lines.length < 2) throw new Error('CSV 文件为空或格式错误')

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  const rows: Partial<Todo>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    values.push(current.trim())

    const row: any = {}
    headers.forEach((h, idx) => {
      let val: string = values[idx] || ''
      val = val.replace(/^"|"$/g, '')
      if (h === 'tags') row[h] = val ? val.split(';') : []
      else if (h === 'completed') row[h] = val === 'true'
      else row[h] = val || null
    })
    rows.push(row)
  }

  return rows
}

export function generateId(): string {
  return crypto.randomUUID()
}
