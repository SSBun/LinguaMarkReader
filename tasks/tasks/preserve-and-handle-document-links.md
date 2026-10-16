# 保留原始文档链接并正确响应点击

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 17:34) |
| Artifacts | [Artifacts](../artifacts/preserve-and-handle-document-links/) |
| Kind | Task |

## Target
- [x] T1: 保留文档原始链接，不因单文件模式或本地目标类型删除或替换链接地址。
- [x] T2: 本地相对路径、绝对路径及 file URL 的文件和目录链接正确响应点击，网页及页内锚点保持可用；无法打开时明确反馈而非静默失效。

## Scope

- 用户纠正：本地 Markdown 阅读器不得删除原始链接，所有链接点击均应有响应；已确认单文件跳转、目录目标、其他协议按适当方式处理、错误明确提示。
- 保留必要安全校验，不恢复可执行 URL；未授权目标通过原生确认后只授予该目标访问权限，不自动授予父目录。
- 不修改既有图片加载策略，不发布、不安装；不运行测试。工作区原有 Folio 品牌改动不属于本任务。

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [Round 01](../artifacts/preserve-and-handle-document-links/reviews/round-01.md) | snapshot-02.sha256 | 无确认缺陷；缺少哈希核对与运行点击证据 |
| 02 | [Round 02](../artifacts/preserve-and-handle-document-links/reviews/round-02.md) | snapshot-02.sha256 | TR-1/TR-2 已解决，无剩余阻断项 |

## Plan

1. 保留安全原始链接，统一点击分流及基于当前文档的路径解析。
2. 原生层校验目标、确认访问权限，文件在阅读器打开，目录进入文件树；网页及常用通信协议交由系统处理，其他类型明确提示。
3. 执行类型检查、Rust 编译检查与差异检查；独立检查权限边界及调用路径。

## Task Summary

**前端阅读器**（[src](../../src/)）：保留本地链接，移除单文件和目录模式的链接禁用逻辑；统一解析并打开链接，增加错误反馈和跨文档锚点处理。

**原生访问层**（[src-tauri](../../src-tauri/)）：新增链接目标校验及按目标确认授权；允许 HTTP/HTTPS、mailto、tel、sms 交由系统处理，其他协议明确报错；在构建清单声明 resolve_link_target 并向本地主窗口授予对应命令权限，修复用户实际点击时出现的 Command not found。

## Result

- T1: 源码检查：两个原有链接禁用循环已移除；Markdown 接受 file URL，净化前后保留非可执行 href；npm run check、npm run build 通过。身份见 evidence/snapshot.sha256；未运行 GUI 和测试。
- T2: 原截图报错根因为构建清单及主窗口 ACL 漏项，已补齐；cargo check、npm run check、生成 ACL 核对通过。重启后的真实应用中 AXPress 点击截图同名链接，正文标题变为目标文档，无旧错误；随后点击文档内 file URL 文件夹，工具栏变为 sops，文件树加载成功。证据 evidence/file-click-02.txt、directory-click-02.txt；六文件哈希全部匹配 hash-check-02.txt。没有触发新授权弹窗，取消路径仅源码核验，未运行测试。
- Review gate: Passed — 独立审查 round-02，mission 4f102728-ed10-408c-b787-9504eb9e4708：TR-1/TR-2 已解决，无确认问题或阻断风险；主代理复核六文件哈希全部一致。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 保持原 R2 跨层权限审查义务，补充运行证据。
- Snapshot: tasks/artifacts/preserve-and-handle-document-links/evidence/snapshot-02.sha256
- Evidence: 实际文件/目录链接点击成功；哈希校验全部 OK；编译与类型检查通过；授权取消仅源码核验。
- Task fingerprint: 68ba606b82c45e0ec5a2a043f55d2f864e2e1c645549ddd4b846e78381673488

## Verification

- Passed: 最终六文件哈希全部 OK，git diff --check 通过；真实应用已成功打开截图文档链接和 file URL 目录；类型/编译/ACL 检查通过。未运行测试，未实机覆盖新授权确认/取消及所有协议分支。
