# AGENTS.md

## 项目定位

MDXForge 是一个本地优先的 MDX / Markdown 文档渲染与预览工具，目标是给 AI 生成的结构化 MDX 文档提供一个安全、可控、好看的桌面阅读环境。

明确定位：
- MDXForge 只聚焦 AI 文档工作流：AI 生成结构化 MDX / Markdown，本地打开、预览、导航、校验与分发。
- 不做通用 Markdown 编辑器，不做普通笔记软件，不做完整文档站框架，不做云端协作平台。
- 所有功能取舍都优先服务「AI 生成文档 → 本地安全预览 → 人类阅读/审阅/分享」这条路径。

核心价值：
- 让用户直接打开本地 `.mdx` / `.md` 文件并渲染预览。
- 让用户打开包含多个 MDX / Markdown 文件的文件夹，通过侧边栏切换文档阅读。
- 给 AI 一个明确的 MDX 写作与渲染目标：使用受控组件、避免任意 HTML、输出更适合文档阅读的结构化内容。
- 用 Fumadocs 风格的文档 UI，把本地文件渲染成接近正式文档站的阅读体验。

## 当前产品形态

这是一个 Electron + React 桌面应用：
- 主进程：负责打开文件/文件夹、读取 MDX、编译 MDX、保存设置、窗口控制、自动更新入口。
- 预加载层：通过 `window.api` 暴露安全 IPC 能力给渲染进程。
- 渲染进程：负责界面、文档预览、侧边栏、主题、语言、设置页。

关键路径：
- `src/main/index.ts`：Electron app 启动、窗口、IPC、打开路径、单实例处理。
- `src/main/mdx.ts`：MDX / Markdown 文件读取、frontmatter 解析、MDX 编译、最近打开路径。
- `src/main/page-tree.ts`：扫描文件夹、生成文档树、支持 `meta.json` 排序/分组/外链。
- `src/main/mdx-options.ts`：MDX 插件配置，支持 Mermaid、数学公式、代码高亮、Twoslash、TOC。
- `src/renderer/src/App.tsx`：应用主界面，打开文件/文件夹、设置页、预览页切换。
- `src/renderer/src/components/MdxPreview.tsx`：MDX 渲染、侧边栏、TOC、文档切换。
- `src/renderer/src/components/mdx-components.tsx`：允许 MDX 使用的 Fumadocs 组件白名单。
- `messages/en-US.json` / `messages/zh-CN.json`：多语言文案源。

## 已支持/应保持的能力

### 1. 本地 MDX / Markdown 渲染

用户可以打开单个 `.mdx` / `.md` 文件，应用会：
1. 读取文件内容。
2. 解析 frontmatter。
3. 用 `@mdx-js/mdx` 编译。
4. 注入受控 MDX 组件。
5. 在 Fumadocs 文档布局中渲染。

### 2. 文件夹工作区

用户可以打开一个文件夹，应用会：
- 自动寻找 `README.mdx`、`README.md`、`index.mdx`、`index.md` 或第一个 MDX/MD 文件作为入口。
- 扫描文件夹中的 `.mdx` / `.md` 文件。
- 忽略 `.git`、`node_modules`、`dist`、`build`、`.next`、`out` 等目录。
- 生成侧边栏文档树。
- 支持点击侧边栏切换当前文档。
- 支持 `meta.json` 控制标题、描述、图标、排序、分隔符、外链、折叠分组。

### 3. 多语言

项目已接入 Paraglide / inlang 多语言体系：
- 当前支持 `zh-CN`、`en-US`、`system`。
- 应用 UI 文案从 `messages/*.json` 管理。
- 运行时通过 `src/renderer/src/lib/language.ts` 应用语言。
- 设置页允许切换界面语言。
- 注意：语言切换只影响应用 UI，不自动翻译 MDX 文档内容。

新增/修改 UI 文案时：
- 必须同时更新 `messages/en-US.json` 和 `messages/zh-CN.json`。
- 不要在组件里硬编码可见 UI 文案，优先使用 `m.xxx()`。
- 改完多语言文案后运行 `pnpm run paraglide:compile` 或 `pnpm run typecheck:web` 生成类型。

### 4. 三端支持

项目面向三端桌面分发：
- Windows
- macOS
- Linux

构建脚本：
- `pnpm build:win`
- `pnpm build:mac`
- `pnpm build:linux`

Electron Builder 配置在 `electron-builder.yml`：
- Windows：`mdx`、`md` 文件关联。
- macOS：DMG 构建、基础权限描述。
- Linux：AppImage、snap、deb。

做功能时必须尽量保持跨平台：
- 路径处理使用 Node `path` API，不要手拼 `/` 或 `\\`。
- 文件选择使用 Electron `dialog`。
- 外部链接用 `shell.openExternal`。
- 不要写只适用于某一端的 UI/文件系统假设。

## AI 编码上下文

本项目不是普通网页文档站，而是「本地 MDX 文件 → 桌面应用安全渲染」工具。

AI 写代码时优先遵守：
1. 垂直聚焦：只做 AI 文档工作流相关能力，避免向通用 Markdown 编辑器、笔记软件或文档站平台发散。
2. 本地优先：不要引入云端依赖；默认读取本地文件。
3. 安全渲染：MDX 组件走白名单；谨慎扩大可执行/可注入能力。
4. 跨平台：Windows/macOS/Linux 都要可用。
5. 多语言：新增 UI 文案必须中英双语。
6. 类型安全：保持 TypeScript 类型完整。
7. 小步实现：优先改清晰边界内的文件。
8. 文档体验：UI 应像文档站，阅读、导航、目录优先。

## 技术栈

- Electron / electron-vite
- React 19
- TypeScript
- Tailwind CSS 4
- Fumadocs UI / Fumadocs MDX 插件
- `@mdx-js/mdx` / `@mdx-js/react`
- `gray-matter`
- Mermaid
- KaTeX / remark-math / rehype-katex
- Twoslash
- Paraglide / inlang
- Biome
- electron-builder

## 常用命令

```bash
pnpm install
pnpm dev
pnpm run typecheck
pnpm run lint
pnpm build:win
pnpm build:mac
pnpm build:linux
```

## 开发注意事项

- 改主进程能力：看 `src/main/*`。
- 改 renderer UI：看 `src/renderer/src/*`。
- 改可用 MDX 组件：看 `src/renderer/src/components/mdx-components.tsx`。
- 改 MDX 编译插件：看 `src/main/mdx-options.ts`。
- 改文档树/文件夹扫描：看 `src/main/page-tree.ts`。
- 改应用设置：看 `src/main/settings.ts`、`SettingsPage.tsx`。
- 改多语言：同步改 `messages/en-US.json` 和 `messages/zh-CN.json`。

## 当前目标

优先完成并打磨第一个核心功能：打开本地 MDX 文件并直接渲染出来。

在此基础上继续完善：
1. 打开文件夹。
2. 文件树切换。
3. 多语言 UI。
4. 三端打包与文件关联。
5. 面向 AI 的 MDX 写作规则和组件约束。
