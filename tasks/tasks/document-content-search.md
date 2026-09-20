# 支持快捷键搜索当前文档内容

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-18 17:33) |
| Artifacts | [Artifacts](../artifacts/document-content-search/) |
| Kind | Task |

## Scope

只搜索当前文档（Markdown 和 JSON），不搜索目录、不修改源文件。保留所有任务开始前的工作区修改。

## Plan

1. 增加文档搜索入口、查询输入和匹配定位，处理快捷键、焦点和切换文档。
2. 将 JSON 延迟生成的折叠内容纳入搜索，保留正文交互及只读边界。
3. 使用类型检查、构建和非测试浏览器观察验证，再进行独立审查。

## Target
- [x] T1: 用户按 Cmd+F 可以输入关键词并定位当前 Markdown 或 JSON 文档的匹配内容。

## Result

- T1: 当前 snapshot-02：npm run check、前端 build、Tauri 原生 debug build、git diff --check 通过。Chrome 常规行为证据 browser-observations-01/02；修复后03确认原文 mark/链接/图片/粗体节点身份及链接事件保留，details.open true→false。真实 macOS WebView 经系统选择器导入 Markdown/JSON 后按 Cmd+F，输入框 AXFocused=true；截图观察 Markdown 1/3→3/3、JSON AX记录1/2→2/2，Enter 定位折叠深层匹配，Esc 关闭清理并恢复折叠。详见 evidence/native-observations.md 与对应PNG/TXT。未运行单元测试；其他平台、大文档性能未验证；图片、SVG、数学公式不参与文本搜索。
- Review gate: Passed — fresh 只读 reviewer 5ef73176-528d-4c95-821d-462a8ecdb31f 第02轮无 Findings，TR-1、TR-2 均 resolved；报告 reviews/round-02.md 已保存索引。主 Agent 重算源码与原生二进制hash一致，核对证据及关闭状态截图。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 新增搜索状态与DOM高亮、键盘输入法及JSON延迟内容准备；保留强制独立审查。
- Snapshot: sha256:6ff2a814314af914b96ec473a389595ed99df1da4b7df8546b5ad8f847cadbb8
- Evidence: Result T1；evidence/snapshot-02.json、scope-02.diff、browser-observations-03.json、native-observations.md 及原生截图/AX记录。
- Task fingerprint: 13f9a984b36ab7cb12b9bc06828d48022bbaaee3c9c2c853a006e1e9366f2c57
## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第01轮](../artifacts/document-content-search/reviews/round-01.md) | sha256:2b1e813a582d659b9624132762c55a2ab3cc8f95b71c9d2942f7cb417a66cda6 | TR-1 清理所有权问题；TR-2 原生验证缺口 |
| 02 | [第02轮](../artifacts/document-content-search/reviews/round-02.md) | sha256:6ff2a814314af914b96ec473a389595ed99df1da4b7df8546b5ad8f847cadbb8 | 无阻断发现；TR-1、TR-2 均 resolved |

## Verification

- Passed: 最终 npm run check、npm run build、git diff --check 均通过；交付源码 SHA256 与第02轮审查快照一致，报告链接有效。真实 macOS WebView 与浏览器观察见 Result T1；未运行单元测试。Windows/Linux、超大文档性能及图片/SVG/数学公式搜索不在已验证覆盖内。
