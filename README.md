# DeskTodo V2.0

Windows 11 原生风格的桌面待办应用。基于 Electron + React + TypeScript 构建，支持 DWM 圆角窗口、Mica/Acrylic 材质、流畅动画和完整的待办管理功能。

## 环境要求

- **Windows 11** (Build 22000+) — 使用 Mica/Acrylic 窗口材质和 DWM 圆角
- **Node.js** 18+
- **npm** 9+ (或 pnpm / yarn)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

### 构建安装包

```bash
npm run build
npm run package:win
```

构建产物在 `dist/` 目录，生成 `.exe` NSIS 安装程序。

## 功能一览

| 功能 | 说明 |
|------|------|
| 日期聚焦视图 | 主界面按日期组织待办，可切换日期查看，一键回到今天 |
| 进度跟踪 | 侧边栏环形进度条、日历日期小圆环、迷你窗线性进度条，实时更新 |
| 待办管理 | 添加、编辑、删除，支持标题、备注、优先级、截止日期、标签 |
| 周期任务 | 支持设置日期区间，每日独立追踪完成状态 |
| 清单分组 | 侧边栏清单列表，可新增/重命名/删除，独立待办计数 |
| 提醒通知 | 单次/每天/每周/工作日提醒，Windows 原生通知 |
| 日历视图 | 月历网格，每日待办完成度圆环，点击日期跳转列表视图 |
| 搜索筛选 | 实时搜索，按状态/优先级/标签筛选，多字段排序 |
| 主题同步 | 主窗口切换亮/暗主题，迷你窗实时同步 |
| 置顶模式 | 一键置顶窗口 |
| 迷你悬浮窗 | 紧凑悬浮窗，日期切换，快速添加，进度条显示 |
| 回收站 | 删除待办进入回收站，可恢复或永久删除（保留1年后自动清除） |
| 导入导出 | JSON/CSV 格式导入导出 |
| 个性化 | 亮/暗主题切换、自定义主题色、字体大小调节 |
| 系统托盘 | 关闭窗口最小化到托盘，右键菜单快捷操作 |
| 拖拽排序 | 待办项支持拖拽排列 |
| 快捷键 | `Ctrl+N` 新建，`Ctrl+F` 搜索，`Esc` 关闭弹窗 |
| 数据持久化 | JSON 文件存储，已完成/已删除数据保留1年自动清理 |

## 技术栈

- **框架**: Electron 31 + React 18 + TypeScript 5
- **构建**: electron-vite + Vite
- **样式**: Tailwind CSS 3，Windows 11 Fluent Design 风格
- **状态管理**: Zustand
- **拖拽**: @dnd-kit
- **日期**: date-fns
- **图标**: lucide-react
- **持久化**: 主进程 JSON 文件存储（通过 IPC），1 年自动清理策略
- **打包**: electron-builder (NSIS)
- **窗口**: DWM 原生圆角（frame: false + Mica/Acrylic 材质）

## 项目结构

```
DeskTodo/
├── electron.vite.config.ts    # electron-vite 构建配置
├── electron-builder.yml       # electron-builder 打包配置
├── tailwind.config.js         # Tailwind CSS 配置
├── src/
│   ├── main/                  # Electron 主进程
│   │   ├── index.ts           # 窗口创建、生命周期
│   │   ├── store.ts           # 数据持久化 + 1年自动清理
│   │   ├── tray.ts            # 系统托盘
│   │   └── ipc.ts             # IPC 通信处理 + 主题同步广播
│   ├── preload/               # 预加载脚本
│   │   └── index.ts           # contextBridge API
│   └── renderer/              # React 渲染进程
│       ├── index.html
│       └── src/
│           ├── main.tsx       # React 入口
│           ├── App.tsx        # 根组件 + 路由 + 数据同步
│           ├── index.css      # 全局样式 + Windows 11 设计变量
│           ├── env.d.ts       # TypeScript 类型声明
│           ├── types/         # 类型定义
│           ├── store/         # Zustand stores（todos/lists/settings）
│           ├── hooks/         # 自定义 hooks
│           ├── utils/         # 工具函数 + 日期统计
│           └── components/    # UI 组件
│               ├── TitleBar.tsx
│               ├── Sidebar.tsx
│               ├── SearchBar.tsx
│               ├── DateHeader.tsx
│               ├── TodoList.tsx
│               ├── TodoItem.tsx
│               ├── AddEditModal.tsx
│               ├── CalendarView.tsx
│               ├── ProgressRing.tsx
│               ├── MiniWindow.tsx
│               ├── SettingsPanel.tsx
│               └── TrashPanel.tsx
└── resources/                 # 应用图标等资源
```

## 架构

### 双窗口设计

同一入口 (`App.tsx`) 根据 `?mini=true` 参数渲染不同 UI：

- **主窗口** — 无边框 Mica 材质，三路由（todos / calendar / trash），日期导航，完整管理功能
- **迷你窗口** — 无边框 Acrylic 材质，常驻顶层，日期切换，快速添加，进度条

两窗口共享 preload 脚本。数据变更通过 IPC `data:updated` 广播，迷你窗自动同步。

### 日期系统

- 所有日期统一使用 `yyyy-MM-dd` 格式
- 周期任务 `isPeriodic` 支持日期区间，`completedDates[]` 按日独立追踪
- `getDateStats(todos, dateStr)` 统一计算日期完成统计

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 新建待办 |
| `Ctrl+F` | 聚焦搜索框 |
| `Esc` | 关闭弹窗/面板 |
| `Ctrl+Enter` | 在编辑框中快速保存 |

## 许可证

MIT
