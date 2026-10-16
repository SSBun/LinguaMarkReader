# 取消目录一万个条目的打开限制

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 17:49) |
| Artifacts | [Artifacts](../artifacts/remove-directory-entry-limit/) |
| Kind | Task |

## Target
- [x] T1: 目录不再因条目超过 10000 而被拒绝打开，文件树仍可正常浏览。
- [x] T2: 保留文件访问授权及其他无关安全校验，避免大目录加载导致界面长时间无响应。

## Scope

- 仅取消目录总条目数硬上限，不放宽访问授权、符号链接/特殊文件排除、根路径校验或 32 层深度限制。
- 保留目录排序、文件树展开/折叠与文件点击；不增加依赖、不发布安装、不运行测试套件。

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [Round 01](../artifacts/remove-directory-entry-limit/reviews/round-01.md) | snapshot.sha256 | TR-1：完成回调抢焦点并重新展开用户已折叠目录 |
| 02 | [Round 02](../artifacts/remove-directory-entry-limit/reviews/round-02.md) | snapshot-02.sha256 | TR-1 已解决，无剩余阻断项 |

## Plan

1. 移除原生目录递归的条目计数拒绝条件。
2. 分批建立文件树 DOM，批次间让出主线程；旧树构建在新目录树创建时退出。
3. 类型/构建检查，并在真实应用中打开超过一万个条目的临时目录、展开末尾目录并打开末尾文档；独立审查异步渲染与安全边界。

## Task Summary

**原生目录读取**（[src-tauri/src](../../src-tauri/src/)）：移除 10,000 条目录条目计数及报错，保留其他目录检查。

**前端文件树**（[src](../../src/)）：以最多 200 条或约 8 ms 的批次构建嵌套树，批次间让出事件循环；显示加载状态，完成后恢复工具栏与当前文件选中状态，不自动移动焦点或展开目录，切换目录时停止旧树构建。

## Result

- T1: 真实 Tauri 开发应用通过原生选择器打开 101 个目录+10100 个文件（总 10201 条）；辅助功能树读取到 101 个根目录，末目录 100 个文件；AXPress 打开末项 document-099.md，正文标题为 大目录验证 100-099。见 evidence/gui-large-directory.txt 与 fixture-location.txt。
- T2: task-02.diff 确认安全检查未改，DOM 构建按 200 条/8ms 让出事件循环并取消旧树。TR-1 已改为完成时 reveal=false，仅同步选中状态，在展开/滚动/focus 之前返回；手动定位保留默认 reveal=true。checks-02.log 通过；GUI 重载后 101 个目录和末文档标题仍在（gui-after-focus-fix.txt）。未运行测试、焦点竞态 GUI 重放或极大规模性能基准。
- Review gate: Passed — 独立 round-02，mission 27532310-a1ae-4c40-961a-3edd9bd0861d：TR-1 已解决，无确认缺陷或阻断风险；主代理复核两文件哈希一致。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 继续异步树渲染审查，TR-1 修复后刷新快照。
- Snapshot: tasks/artifacts/remove-directory-entry-limit/evidence/snapshot-02.sha256
- Evidence: T1/T2 实机大目录观察、checks-02.log、hash-check-02.txt；完成回调 reveal=false 源码核验。
- Task fingerprint: ded1e60bc84fbf22dcbf8e1bab30923a8cf3c5574e072ebcbd63b2a19ffae1da

## Verification

- Passed: 最终哈希核对和 git diff --check 通过；checks-02.log 类型/构建/Rust 检查通过；真实 10201 条目录成功打开且末文档可读，完成回调不再展开/滚动/抢焦点。未运行测试套件、GUI 焦点竞态重放或任意规模性能基准。
