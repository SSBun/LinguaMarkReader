# 侧栏内容按钮直接切换模式

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-18 16:39) |
| Kind | Task |

## Target
- [x] T1: 点击侧栏内容模式按钮直接在文件树与文章目录之间往返切换，不再弹出选择菜单。
- [x] T2: 独立的侧栏显隐按钮行为保持不变。

## Result

- T1: 源码逐项对照：原生 button 替代 select；click 用 files/outline 二元反转，经可用性检查后同步内容并打开侧栏；双内容可往返切换，缺少任一内容则禁用。旧菜单 DOM/CSS 引用已清除；npm run check、npm run build、git diff --check 通过。未运行测试或原生 GUI 实测。
- T2: git diff 对照显示显隐按钮 click 仍为 setSidebarOpen(!sidebarOpen)，禁用表达式仍为两种内容均不可用；内容切换仍调用原有 syncSidebar/setSidebarOpen(true)，宽度、响应式与文件授权逻辑未改动。
- Review gate: Skipped — 当前 R1 四项依据成立：局部控件替换与原有行为可直接对照，类型检查、构建及差异检查通过，无独立审查义务。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 局部二态 UI 控件替换，复用既有侧栏状态同步与工具栏按钮样式。
- Snapshot: HEAD=142352f73d7b474f8b8334ce6db9b36aa2f84405; unstaged SHA256 src/main.ts=72d9cf95973cfac1a10119ea3e5be9b6dd0fc43faf32fcd68ea76e54dcc1cc59 public/markdown.css=0c9e6643bb611cd0e0b66309cbb1e396140fa5b7823d124ffb37f448532d6642 README.md=5df6701bb090448146d680884d44672fa97b77d46117d5a3ea35a59e6eba973d; 无暂存交付物改动
- Evidence: T1/T2 源码与差异核对、类型检查及前端构建均通过。
- Result clarity: 已确认直接往返切换、无菜单、独立显隐保持不变。
- Bounded impact: 影响仅控件创建、事件入口、提示及废弃样式；setSidebar 的默认选择与所有调用保持不变。
- Low risk: 仅可恢复的阅读 UI 状态，无文件写入、权限或持久数据变更。
- Sufficient verification: 核对两个方向及内容缺失分支、显隐 handler 与禁用等价条件；tsc 和构建通过；未运行测试与 GUI 实测。
- Task fingerprint: d6222b5e6c9af431dc7f6f8c6a9ccc3c393c0eeef922099c679d888b565eefdb

## Verification

- Passed: 最终类型检查及 git diff --check 通过，三个交付文件 SHA256 与评估快照一致；源码核对完成，未运行测试、GUI 或应用打包安装。
