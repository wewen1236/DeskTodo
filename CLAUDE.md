# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server with HMR (main + renderer)
npm run build         # Production build
npm run package:win   # Build + package NSIS installer for Windows
```

No test suite is configured.

## Architecture

Electron app with three layers, built by **electron-vite** (Vite-based, not Webpack):

### Process model

| Layer | Directory | Purpose |
|-------|-----------|---------|
| Main | `src/main/` | Window creation, IPC handlers, JSON file persistence, tray, global shortcuts |
| Preload | `src/preload/index.ts` | Bridges renderer ↔ main via `contextBridge.exposeInMainWorld('electronAPI', ...)` |
| Renderer | `src/renderer/src/` | React 18 app — all UI |

### Two-window design

The same entry point (`App.tsx`) renders different UIs based on `?mini=true` query param:
- **Main window** — frameless, no transparency (`transparent: false`), CSS `border-radius: 14px` on `html, body, #root` for rounded corners
- **Mini window** — frameless, always-on-top, same `index.html` with `?mini=true`

Both windows share the same preload script. Data changes in the main window are pushed to the mini window via `webContents.send('data:updated', ...)` in `ipc.ts`. The broadcast sends to all other windows (not the sender) for both `todos` and `settings` keys.

### App routing

Three routes managed via local `useState<AppRoute>` in `App.tsx`:
- `todos` — list view with date header + filtered todos
- `calendar` — calendar month grid + per-date todo list
- `trash` — deleted todos with restore/permanent-delete

### Data persistence

**In-memory (renderer)** → IPC → **main process Store** (`src/main/store.ts`) → `{userData}/desktodo-data.json`

Zustand stores (renderer) hold canonical state during the session. `App.tsx` uses `useEffect` to sync `todos`, `lists`, and `settings` to disk on every change via `window.electronAPI.store.set()`. On startup, data is loaded from disk with `store.get()`.

A `skipSync` ref flag prevents infinite loops when the renderer receives a `data:updated` IPC event that would overwrite state just synced to disk.

Three Zustand stores:
- `todoStore` — todos, filtering, sorting, drag-reorder, selected date; `getFilteredTodos(listId)` runs all filters in-memory
- `listStore` — todo lists (default: 收集箱, 工作, 个人), active list selection, sidebar state
- `settingsStore` — theme (light/dark via `.dark` class on `<html>`), accent color (CSS custom properties), font size

### Date-focused main view

The main list view is date-centric. `todoStore.selectedDate` (defaults to today via `getTodayStr()`) drives what's shown:

- **`DateHeader`** component sits between SearchBar and TodoList — left/right arrows navigate days, "回到今天" button returns to today
- **`getFilteredTodos`** applies a date filter at the end: todos without `dueDate` pass through; todos with `dueDate` must match `selectedDate`
- **Periodic todos** (`isPeriodic: true`) are excluded from list/trash/mini-window — they only appear in `CalendarView`

### Periodic / recurring tasks

Todos can span a date range with independent per-day completion:

```
Todo {
  isPeriodic: boolean
  periodStart: string | null    // 'yyyy-MM-dd'
  periodEnd: string | null      // 'yyyy-MM-dd'
  completedDates: string[]      // array of 'yyyy-MM-dd'
}
```

Key behaviors:
- **Completion**: `toggleComplete(id, date?)` — for periodic todos, toggles the date in `completedDates[]`; for normal todos, toggles `completed` boolean
- **Visibility**: `getFilteredTodos` initially filters out `isPeriodic` todos. `CalendarView.getTodosForDate` includes periodic todos whose range covers the current day
- **Styling**: `isTodoCompletedToday()` helper resolves the correct "completed" state for both types
- **Sidebar badge count** uses `isTodoCompletedToday()` to count incomplete todos

### Theming and style

Tailwind CSS with Windows 11 Fluent Design tokens defined as CSS custom properties on `:root` and `.dark`. Key tokens: `--win-bg`, `--win-card`, `--win-border`, `--win-text`, `--win-accent`, etc. Component classes like `.win-btn`, `.win-input`, `.win-checkbox` are defined in `index.css`. Dark mode toggled via `html.classList.toggle('dark')`.

Theme sync between windows: `ipc.ts` broadcasts `settings` changes via `data:updated`, and `App.tsx` listener calls `loadSettings(value)` in the mini window.

Rounded corners are achieved via CSS `border-radius: 14px` on `html, body, #root`, with Electron transparency disabled (`transparent: false`) so the OS draws native rounded window corners.

### Window chrome

The window is frameless (`frame: false`). `TitleBar.tsx` provides custom minimize/maximize/close buttons wired through IPC → main process window controls. The title bar region is draggable via `-webkit-app-region: drag`.

### IPC channels

All written with `namespace:action` convention:
- `window:minimize/maximize/close`, `window:isMaximized` (handle), `window:toggleAlwaysOnTop`, `window:openMini/closeMini/restoreFromMini`
- `store:get/set/delete` (handle) — JSON file read/write; `set` broadcasts `data:updated` for `todos` and `settings` keys
- `notification:show` — Windows native notification
- `file:export/import` (handle) — save/open dialogs
- `window:maximizeChange` — main → renderer event for maximize state
- Renderer listeners: `shortcut:new-todo`, `shortcut:focus-search`, `data:updated`

### Import alias

`@/` maps to `src/renderer/src/` via both `tsconfig.json` paths and `electron.vite.config.ts` resolve alias. Use `@/types`, `@/store/todoStore`, etc. in renderer code.

### Path aliases

- `electron.vite.config.ts` — build config for all three targets (main/preload/renderer)
- `electron-builder.yml` — packaging config, NSIS installer, x64 only

## Component tree

```
App
├── TitleBar (window controls)
├── Sidebar (lists, route nav, settings button)
├── Main content area
│   ├── SearchBar
│   ├── DateHeader (only on todos route — day navigation)
│   └── Route content
│       ├── TodoList (list view, with TodoItem children)
│       ├── CalendarView (month grid + per-date todos)
│       └── TrashPanel (deleted todos)
├── AddEditModal (create/edit todo, includes period fields)
├── SettingsPanel
└── MiniWindow (only when ?mini=true)
```

## Key patterns

- **Date strings**: Always `yyyy-MM-dd` format (no time component). Use `getTodayStr()` from helpers, never `new Date().toISOString()` for date-only comparisons.
- **Completion state**: Never read `todo.completed` directly for display. Always use `isTodoCompletedToday(todo)` from helpers, which handles both periodic and normal todos correctly.
- **Multi-window sync**: When adding new data fields to `store:set` broadcasts, update the key check in `ipc.ts` and the `data:updated` listener in `App.tsx`.
- **New Todo fields**: When adding fields to the Todo type, remember to add defaults in all `addTodo()` call sites (main App modal, MiniWindow quick-add).
- **Border radius**: The app relies on CSS border-radius + non-transparent Electron windows for rounded corners. Do not re-enable `transparent: true` in BrowserWindow configs.
