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
- **Main window** — frameless with `backgroundMaterial: 'mica'`, loaded from `index.html` normally
- **Mini window** — frameless, always-on-top, `backgroundMaterial: 'acrylic'`, same `index.html` with `?mini=true`

Both windows share the same preload script. Data changes in the main window are pushed to the mini window via `webContents.send('data:updated', ...)` in `ipc.ts`.

### Data persistence

**In-memory (renderer)** → IPC → **main process Store** (`src/main/store.ts`) → `{userData}/desktodo-data.json`

Zustand stores (renderer) hold canonical state during the session. `App.tsx` uses `useEffect` to sync `todos`, `lists`, and `settings` to disk on every change via `window.electronAPI.store.set()`. On startup, data is loaded from disk with `store.get()`.

Three Zustand stores:
- `todoStore` — todos, filtering, sorting, drag-reorder; `getFilteredTodos(listId)` runs all filters in-memory
- `listStore` — todo lists (default: 收集箱, 工作, 个人), active list selection, sidebar state
- `settingsStore` — theme (light/dark via `.dark` class on `<html>`), accent color (CSS custom properties), font size

### Window chrome

The window is frameless (`frame: false`). `TitleBar.tsx` provides custom minimize/maximize/close buttons wired through IPC → main process window controls. The title bar region is draggable via `-webkit-app-region: drag`.

### Styling system

Tailwind CSS with Windows 11 Fluent Design tokens defined as CSS custom properties on `:root` and `.dark`. Key tokens: `--win-bg`, `--win-card`, `--win-border`, `--win-text`, `--win-accent`, etc. Component classes like `.win-btn`, `.win-input`, `.win-checkbox` are defined in `index.css`. Dark mode toggled via `root.classList.add('dark')`.

### IPC channels

All written with `namespace:action` convention:
- `window:minimize/maximize/close`, `window:isMaximized` (handle), `window:toggleAlwaysOnTop`, `window:openMini/closeMini/restoreFromMini`
- `store:get/set/delete` (handle) — JSON file read/write
- `notification:show` — Windows native notification
- `file:export/import` (handle) — save/open dialogs
- Renderer listeners: `shortcut:new-todo`, `shortcut:focus-search`, `data:updated`

### Import alias

`@/` maps to `src/renderer/src/` via both `tsconfig.json` paths and `electron.vite.config.ts` resolve alias. Use `@/types`, `@/store/todoStore`, etc. in renderer code.

### Path aliases

- `electron.vite.config.ts` — build config for all three targets (main/preload/renderer)
- `electron-builder.yml` — packaging config, NSIS installer, x64 only
