# 项目 Pi Extensions

本目录存放 MDXForge 项目级 Pi extensions。启动 Pi 时自动加载；新增或修改 extension 后，在 Pi 中执行：

```txt
/reload
```

## 命令速查

| 命令 | 来源文件 | 用途 |
| --- | --- | --- |
| `/commit <English message>` | `commit.ts` | 暂存全部改动并提交 Git commit |
| `/commit` | `commit.ts` | 暂存并先提交 `WIP`，再让 AI 生成英文 commit message 并 amend |
| `/release-tag [version\|vX.Y.Z]` | `auto-release-tag.ts` | 基于指定版本或根 `package.json` 版本创建并推送 Git tag |
| `/release-bump [patch\|minor\|major]` | `auto-release-tag.ts` | 升级 workspace package 版本、commit、tag、推送 branch + tag；默认 `patch` |
| `/line-check` | `file-line-guard.ts` | 手动检查源码是否超过 500 行限制 |

## 自动行为

| Extension | 触发时机 | 行为 |
| --- | --- | --- |
| `biome-lint.ts` | AI 当前 turn 使用 `write` / `edit` 修改文件后 | 执行 `biome check --write .`；仍有问题时弹出警告 |
| `file-line-guard.ts` | 每条 assistant 消息完成后 | 执行 `node scripts/check-file-lines.cjs`；存在超 500 行源码时弹出警告 |

---

## `/commit`

文件：`commit.ts`

### 指定提交信息

```txt
/commit feat: add folder workspace navigation
```

执行内容：

```bash
git add -A
git commit -m "feat: add folder workspace navigation"
```

成功后通知 commit short hash 与提交信息。

### 由 AI 生成提交信息

```txt
/commit
```

执行流程：

1. `git add -A`
2. 创建临时提交：`git commit -m "WIP"`
3. 将 staged diff stat 发给 AI
4. AI 生成不超过 72 字符的英文提交信息
5. AI 执行：

```bash
git commit --amend -m "generated message"
```

### 注意

- 会暂存当前仓库**全部改动**。
- 无改动时只提示 `Nothing to commit.`。
- 使用前确认不包含不应提交的临时文件或密钥。

---

## `/release-tag`

文件：`auto-release-tag.ts`

创建并推送 release tag，不修改 package 版本。

### 使用根 `package.json` 当前版本

若根 `package.json` 中版本为 `0.2.0`：

```txt
/release-tag
```

等价于创建并推送：

```bash
git tag v0.2.0
git push origin v0.2.0
```

### 指定版本

```txt
/release-tag 0.3.0
/release-tag v0.3.0
```

两者均生成 tag：

```txt
v0.3.0
```

### 前置条件

- 当前目录必须是 Git 仓库。
- working tree 必须干净，否则拒绝执行。
- 若 tag 本地已存在，则跳过创建、直接尝试推送。

### 注意

此命令会向 `origin` 推送 tag，属于远程发布动作。执行前确认版本与远程仓库正确。

---

## `/release-bump`

文件：`auto-release-tag.ts`

统一升级 package 版本，提交、打 tag、推送。

### 用法

```txt
/release-bump
/release-bump patch
/release-bump minor
/release-bump major
```

默认：

```txt
/release-bump patch
```

版本规则：

| 参数 | 示例 |
| --- | --- |
| `patch` | `0.2.0` → `0.2.1` |
| `minor` | `0.2.0` → `0.3.0` |
| `major` | `0.2.0` → `1.0.0` |

### 会更新的文件

```txt
package.json
apps/desktop/package.json
apps/web/package.json
packages/mdx/package.json
packages/mdx-components/package.json
packages/ui/package.json
```

仅处理存在 string `version` 字段的文件。

### 执行流程

以 `0.2.0` → `0.2.1` 为例：

```bash
# 更新 package.json versions
git add <changed-package-json-files>
git commit -m "chore: release v0.2.1"
git tag v0.2.1
git push origin HEAD
git push origin v0.2.1
```

### 前置条件

- 当前目录必须是 Git 仓库。
- working tree 必须干净，否则拒绝执行。
- package version 必须为支持的 semver：`X.Y.Z`。

### 注意

此命令会创建 commit、创建 tag、推送当前分支及 tag 到 `origin`。执行后会影响远程仓库与发布流程，使用前确认目标版本。

---

## `/line-check`

文件：`file-line-guard.ts`

手动运行源码行数规则：

```txt
/line-check
```

底层命令：

```bash
node scripts/check-file-lines.cjs
```

规则：

- 最大行数：`500`
- 扫描目录：`apps/`、`packages/`
- 扫描扩展名：`.ts`、`.tsx`、`.js`、`.jsx`、`.mjs`、`.cjs`
- 忽略生成物、构建目录、测试/配置/声明文件等例外

超限示例：

```txt
File line limit exceeded (max 500 lines):
- apps/desktop/src/renderer/src/components/MdxPreview.tsx: 624 lines
```

处理方式：按职责拆分文件；仅生成代码或合理例外才应加入忽略规则。

---

## 自动 Biome 修复

文件：`biome-lint.ts`

此 extension 无手动命令。

AI 通过 `write` 或 `edit` 改动文件后，自动执行：

```bash
node_modules/.bin/biome check --write .
```

- 可自动格式化/修复的问题会直接写回文件。
- 仍无法修复的问题会通过 Pi warning 提醒。

注意：AI 修改后，文件可能因自动格式化产生额外 diff。

---

## 自动 500 行告警

文件：`file-line-guard.ts`

每条 AI assistant 消息完成后，自动执行：

```bash
node scripts/check-file-lines.cjs
```

若存在超限源码，Pi 弹出 warning 通知。也可随时用 `/line-check` 手动验证。

## Extension 生效/排障

修改本目录代码后执行：

```txt
/reload
```

检查命令是否注册：在 Pi 输入 `/`，查看命令列表中是否存在：

```txt
/commit
/release-tag
/release-bump
/line-check
```

若 `/line-check` 无输出或自动告警未出现：

1. 先执行 `/reload`。
2. 执行 `/line-check` 验证 extension 是否已加载。
3. 终端直接执行脚本，验证规则本身：

```bash
node scripts/check-file-lines.cjs
```

