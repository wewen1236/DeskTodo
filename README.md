# DeskTodo

Windows 11 原生风格的桌面待办应用。基于 Electron + React + TypeScript 构建，支持 Mica 毛玻璃背景、流畅动画和完整的待办管理功能。

## 环境要求

- **Windows 11** (Build 22000+) — 使用 Mica/Acrylic 窗口材质
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
npm run package:win
```

构建产物在 `dist/` 目录，生成 `.exe` NSIS 安装程序。

## 功能一览

| 功能 | 说明 |
|------|------|
| 待办管理 | 添加、编辑、删除，支持标题、备注、优先级、截止日期、标签 |
| 清单分组 | 侧边栏清单列表，可新增/重命名/删除，独立计数 |
| 提醒通知 | 单次/每天/每周/工作日提醒，Windows 原生通知 |
| 日历视图 | 内嵌月历，有事项日期显示圆点，点击查看当日待办 |
| 搜索筛选 | 实时搜索，按状态/优先级/标签筛选 |
| 置顶模式 | 一键置顶窗口 |
| 迷你悬浮窗 | 紧凑悬浮窗，显示最近待办，快速添加 |
| 回收站 | 删除待办进入回收站，可恢复或永久删除 |
| 导入导出 | JSON/CSV 格式导入导出 |
| 个性化 | 亮/暗主题切换、自定义主题色、字体大小调节 |
| 系统托盘 | 关闭窗口最小化到托盘，右键菜单快捷操作 |
| 拖拽排序 | 待办项支持拖拽排列 |
| 快捷键 | `Ctrl+N` 新建，`Ctrl+F` 搜索，`Esc` 关闭弹窗 |

## 技术栈

- **框架**: Electron 31 + React 18 + TypeScript 5
- **构建**: electron-vite + Vite
- **样式**: Tailwind CSS 3，Windows 11 Fluent Design 风格
- **状态管理**: Zustand
- **拖拽**: @dnd-kit
- **日期**: date-fns
- **图标**: lucide-react
- **持久化**: 主进程 JSON 文件存储（通过 IPC）
- **打包**: electron-builder (NSIS)

## 项目结构

```
DeskTodo/
├── electron.vite.config.ts    # electron-vite 构建配置
├── electron-builder.yml       # electron-builder 打包配置
├── tailwind.config.js         # Tailwind CSS 配置
├── src/
│   ├── main/                  # Electron 主进程
│   │   ├── index.ts           # 窗口创建、生命周期
│   │   ├── store.ts           # 数据持久化
│   │   ├── tray.ts            # 系统托盘
│   │   └── ipc.ts             # IPC 通信处理
│   ├── preload/               # 预加载脚本
│   │   └── index.ts           # contextBridge API
│   └── renderer/              # React 渲染进程
│       ├── index.html
│       └── src/
│           ├── main.tsx       # React 入口
│           ├── App.tsx        # 根组件
│           ├── index.css      # 全局样式 + Windows 11 变量
│           ├── env.d.ts       # TypeScript 类型声明
│           ├── types/         # 类型定义
│           ├── store/         # Zustand stores
│           ├── hooks/         # 自定义 hooks
│           ├── utils/         # 工具函数
│           └── components/    # UI 组件
│               ├── TitleBar.tsx
│               ├── Sidebar.tsx
│               ├── SearchBar.tsx
│               ├── TodoList.tsx
│               ├── TodoItem.tsx
│               ├── AddEditModal.tsx
│               ├── CalendarView.tsx
│               ├── MiniWindow.tsx
│               ├── SettingsPanel.tsx
│               └── TrashPanel.tsx
└── resources/                 # 应用图标等资源
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+N` | 新建待办 |
| `Ctrl+F` | 聚焦搜索框 |
| `Esc` | 关闭弹窗/面板 |
| `Ctrl+Enter` | 在编辑框中快速保存 |

## 许可证

MIT
