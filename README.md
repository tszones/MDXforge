# MDXForge

MDXForge 是一个面向 AI 时代的本地 MDX 文档阅读器：让 AI 用比 Markdown 更强、比 HTML 更轻、更可控的格式写文档，然后像打开 `.md` 一样打开、分发、阅读 `.mdx` / `.md` 文件。

## 产品定位

MDXForge 只做 AI 文档工作流这个垂直领域。

目标路径是：

```txt
AI 生成结构化 MDX / Markdown -> 本地安全预览 -> 人类阅读、审阅、分享
```

这意味着 MDXForge 不是通用 Markdown 编辑器、笔记软件、云端协作平台，也不是完整文档站框架。它要解决的是 AI 生成的本地文档如何用受控组件、文档站式 UI 和本地文件工作区稳定呈现出来。

## 为什么做这个项目

AI 正在改变文档的生成方式。

过去，文档主要是人写给人看的；现在，越来越多文档会先由 AI 生成，再由人审阅、修改、发布。这个变化让「文档源文件」本身变得非常重要：它既要适合 AI 生成，也要适合人类维护，还要能被稳定、安全地渲染出来。

Markdown 是 AI 时代默认的文档书写材料。它简单、低噪音、易 diff、易分发，几乎所有模型都能稳定生成。但 Markdown 的问题也很明显：表达能力太弱。它适合段落、列表、代码块，却不擅长表达复杂的文档结构，例如提示卡片、步骤流、Tabs、API 参数表、对比矩阵、交互式图表、组件化示例等。

另一条路是 HTML。HTML 的表达能力足够强，任何界面都能写出来；AI 编码工具生态里也有很多人鼓励直接生成 HTML 原型或 HTML 文档。比如 Geoffrey Huntley 在关于 AI agent / context window 的文章里反复强调：上下文窗口像 RAM 一样宝贵，工具链不应该浪费它（见 [i dream about AI subagents; they whisper](https://ghuntley.com/subagents/)）。这也是我们不把 HTML 作为默认文档源的原因：HTML 虽然强，但 token 消耗高，标签噪音重，源码对 AI 和人类都不够友好。

MDXForge 选择第三条路：MDX。

## 为什么是 MDX

MDX 保留了 Markdown 的低成本写作体验，同时允许文档使用受控组件。

这意味着：

- 比 Markdown 更有表现力：文档可以使用 `Callout`、`Card`、`Tabs`、`Steps`、`TodoList`、`FileTree` 等结构化组件。
- 比 HTML 更省 token：内容仍然主要是 Markdown，不需要大量 `<div>`、`class`、闭合标签。
- 比任意 HTML 更可控：MDXForge 只渲染白名单组件，不鼓励任意 HTML 注入。
- 分发方式接近 Markdown：一个 `.mdx` 文件就是一个文档；一个文件夹就是一个文档库。
- 适合 AI 写作：给 AI 一个定制 Skill / 写作规则，它就能稳定输出符合阅读器约束的 MDX。
- 适合本地优先：无需云端服务，打开本地文件即可预览。

## 我们的判断

AI 时代的文档不应该停留在纯 Markdown，也不应该直接退化成 HTML 源码。

更好的目标是：

```txt
Markdown 的低噪音 + 组件化表达力 + 本地文件分发 + 安全可控渲染
```

MDXForge 就是这个目标的阅读器。

AI 负责根据规则生成 `.mdx`；MDXForge 负责把它安全、漂亮、稳定地渲染出来。

## 产品形态

MDXForge 是一个 Electron + React 桌面应用。

当前能力：

- 打开本地 `.mdx` / `.md` 文件
- 打开包含多个文档的文件夹
- 自动生成侧边栏文档树
- 渲染受控 MDX 组件
- 支持 Mermaid、数学公式、代码高亮、TOC
- 记住最近打开路径
- 支持中英文界面

## 使用方式

1. 用 AI 生成符合 MDXForge 规则的 `.mdx` 文档。
2. 用 MDXForge 打开这个文件或文件夹。
3. 像阅读正式文档站一样阅读本地文档。

推荐写作规则见：[`docs/mdx-authoring-rules.mdx`](docs/mdx-authoring-rules.mdx)。

## 开发

仓库现在是 pnpm workspace / Turborepo monorepo：

```txt
apps/
  desktop/   # Electron + React 桌面应用
packages/    # 后续放共享包
```

```bash
pnpm install
pnpm dev
```

`pnpm dev` 默认启动 `apps/desktop`。后续官网可以自然加入 `apps/web`。

## 构建

```bash
pnpm build
pnpm build:win
pnpm build:mac
pnpm build:linux
```

## Release

Releases are published to GitHub Releases. Create a version tag:

```bash
cd apps/desktop
pnpm version patch
cd ../..
git push origin main --follow-tags
```

The release workflow builds Windows, macOS, and Linux artifacts. Auto updates use the same GitHub Release assets.

## Roadmap

See [`docs/roadmap.mdx`](docs/roadmap.mdx).
