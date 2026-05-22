# MDX 写作规则

本项目的 MDX 内容用于本地预览工具渲染。为保证稳定，AI 生成 MDX 时必须遵守本规则。

## 总原则

- 只写内容，不写业务逻辑。
- 禁止在 MDX 中写 `import` / `export`。
- 禁止定义自定义 React 组件。
- 禁止使用未列入白名单的 JSX 组件。
- 禁止执行任意 JS，例如 `{fetch(...)}`、`{window...}`、复杂表达式等。
- 可使用 Markdown 标准语法：标题、段落、列表、引用、表格、链接、图片、代码块。
- 可使用本文列出的组件。

## Frontmatter

每个 MDX 文件建议包含：

```mdx
---
title: 文档标题
description: 简短描述
---
```

规则：

- `title`：必填，短标题。
- `description`：可选，一句话摘要。
- 不要在 frontmatter 中写复杂对象，除非后续规则明确允许。

## Markdown 基础语法

允许：

```mdx
# 一级标题

## 二级标题

正文内容。

- 列表项 A
- 列表项 B

> 引用内容

[链接文字](https://example.com)

![图片描述](./image.png)

| 列 A | 列 B |
| --- | --- |
| 1 | 2 |
```

## 代码块

允许 fenced code block：

````mdx
```ts
function hello(name: string) {
  return `Hello ${name}`
}
```
````

规则：

- 代码块只展示代码，不执行。
- 必须标注语言，例如 `ts`、`tsx`、`js`、`bash`、`json`、`mdx`。

## 组件白名单

当前允许使用以下组件：

### Callout

用于提示、警告、说明。

```mdx
<Callout>
这是一个提示。
</Callout>
```

可选写法：

```mdx
<Callout title="注意">
这里是说明内容。
</Callout>
```

规则：

- 用于短提示，不要放过长正文。
- 不要嵌套复杂组件。

### Cards / Card

用于展示入口、链接、资源卡片。

```mdx
<Cards>
  <Card title="快速开始" href="https://example.com">
    阅读快速开始指南。
  </Card>
  <Card title="API 文档" href="https://example.com/api">
    查看 API 用法。
  </Card>
</Cards>
```

规则：

- `Card` 必须有 `title`。
- `href` 可选。
- `Card` 必须放在 `Cards` 内。

### CodeBlockTabs / CodeBlockTab

用于多语言或多文件代码示例。

```mdx
<CodeBlockTabs defaultValue="npm">
  <CodeBlockTab value="npm">

```bash
npm install
```

  </CodeBlockTab>
  <CodeBlockTab value="pnpm">

```bash
pnpm install
```

  </CodeBlockTab>
</CodeBlockTabs>
```

规则：

- `CodeBlockTab` 必须有 `value`。
- 每个 tab 内推荐只放一个代码块。

## 临时兼容组件

以下组件当前只是占位兼容，允许临时使用，但渲染效果不是最终版：

- `Accordion`
- `Accordions`
- `Step`
- `Steps`
- `File`
- `Files`
- `Tabs`
- `Tab`

示例：

```mdx
<Steps>
  <Step>
    第一步：打开文件。
  </Step>
  <Step>
    第二步：预览内容。
  </Step>
</Steps>
```

规则：

- AI 默认不要优先使用这些组件。
- 除非用户明确要求步骤、折叠、文件树、标签页。
- 后续项目会实现正式组件后再放开。

## 禁止内容

禁止：

```mdx
import Something from './Something'

export const data = {}

function MyComponent() {
  return <div />
}

<MyUnknownComponent />

{fetch('/api')}

{window.location.href}
```

禁止原因：

- 破坏本地渲染稳定性。
- 可能触发安全问题。
- 组件不存在会导致渲染失败。

## AI 生成 MDX 的固定要求

AI 生成 MDX 时必须：

1. 输出完整 MDX。
2. 包含 frontmatter。
3. 只使用白名单组件。
4. 不写 import/export。
5. 不写自定义 React 组件。
6. 不写运行时代码。
7. 代码示例放进 fenced code block。
8. 如果需要强调信息，优先用 `Callout`。
9. 如果需要资源入口，使用 `Cards/Card`。
10. 如果不确定组件是否支持，退回普通 Markdown。

## 推荐模板

```mdx
---
title: 标题
description: 一句话描述
---

# 标题

开头说明。

<Callout title="提示">
这里放重要提示。
</Callout>

## 小节

正文内容。

```ts
console.log('example')
```

## 相关资源

<Cards>
  <Card title="资源名称" href="https://example.com">
    资源描述。
  </Card>
</Cards>
```
