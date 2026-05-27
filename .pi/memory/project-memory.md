# Project Memory

Auto-extracted durable memories from Pi conversations.
Keep only useful, cross-session project knowledge. Do not store secrets.

## 2026-05-27T08:04:38.638Z
Session: C:\Users\admin\.pi\agent\sessions\--C--Users-admin-Desktop-mdx-preview--\2026-05-27T07-56-22-998Z_019e686f-4456-70f1-96ba-26c3c7cdd4bc.jsonl

- **todo**: 添加 .gitattributes 固定 TS 等文件 LF 换行，避免反复出现 LF/CRLF 警告。
- **todo**: 重构 apps/desktop/src/renderer/src/App.tsx，抽出 useAppSettings、useWorkspaceActions、useInitialOpenPath。
- **todo**: 重构 WorkspaceSidebar.tsx，拆分搜索逻辑、tabs/filter/context menu 与纯展示组件。
- **todo**: 抽取 IPC contract，集中 channel 名并让 main/preload/renderer 共用类型。
