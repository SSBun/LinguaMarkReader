# 独立审查第 01 轮

- 任务：preserve-and-handle-document-links
- 模式：独立只读子代理
- Mission：f8c2bf8a-8edd-4997-8600-0676e06a4d4b
- 快照：../evidence/snapshot-02.sha256

## Reviewer 原始反馈

## Review

- **Review mode:** independent subagent（独立子代理，只读）。
- **范围／快照：**指定的六个文件、相关调用及失败路径；对照 `review-02.diff` 和 `snapshot-02.sha256`。排除既有 Folio 更名。
- **Findings: none。** No issues found.

**已确认的正确实现**
- `src/main.ts:208–247` 保留安全 href，并阻止恢复可执行协议；`1094–1125` 将本地、网页及其他协议分流并显示异常。
- `src-tauri/src/main.rs:372–409` 校验来源授权、规范化目标路径，对未授权目标请求确认，不自动授权文件的父目录。
- 命令调用与注册链一致：`src/platform.ts:37–38`、`src-tauri/src/main.rs:495`、`src-tauri/build.rs:9`、`src-tauri/capabilities/main.json:12`；自动生成权限文件第 6 行明确允许 `resolve_link_target`。生成的 capabilities 也包含该权限。

**Unverified risks**
- **快照身份：阻断 T1/T2 的严格当前快照核验。**工具不支持计算 SHA-256；仅核对了差异内容，结束时重读清单、生成权限并检查差异统计，不能证明六个文件实际哈希与声明一致，也不能完整排除审查期间漂移。
- **真实点击链：阻断 T2 的端到端验证。**没有重启后点击原截图链接的运行证据。源码与生成 ACL 已补齐，但进程重启、编译成功不能单独证明原报错消失。需由拥有任务的会话补充实际点击、授权取消及失败提示的观察。

**实际检查与作者证据**
- 本轮实际执行：只读检查需求、差异、净化边界、导航分流、授权及目录读取、ACL 和生成权限；未运行测试、构建或 GUI。
- 作者证据：已阅读 canonical Result／Assessment 中类型检查、前端构建、Rust 检查、差异检查通过及开发进程重启的记录；未独立复跑，也未见对应完整命令日志。
- 覆盖限制：无运行时安全验证或跨平台交互验证；本轮无历史 TR 条目，无确认问题需要分配 TR-ID。
