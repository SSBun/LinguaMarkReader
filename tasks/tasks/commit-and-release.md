# 提交全部本地改动并发布新版本

| Field | Value |
| --- | --- |
| Status | In Progress (2026-09-20 14:56) |
| Artifacts | [Artifacts](../artifacts/commit-and-release/) |
| Kind | Task |
| Parent | release-install-markdown-default |

## Scope

- 纳入当前全部 Git 非忽略本地改动，包括既有功能与任务记录；不强制加入构建目录或依赖目录。
- 沿用现有 GitHub 源码 Release，不上传安装包、公证或 Sparkle/npm 产物；本机 ad-hoc 应用包由队列其他阶段准备与安装。
- 项目应用显示版本由 Tauri 配置提供；同步 npm 与 Cargo 清单及锁文件。本项目没有独立 App build number。

## Plan

1. 核对公开仓库 SSBun/LinguaMarkReader、main 分支、既有 v0.1.0 源码发布，准备向后兼容功能版本 v0.2.0；纳入已完成的 macOS Markdown 系统打开及类型标签对比度修正。
2. 检查全部待提交内容与敏感文件，同步版本与更新日志，执行类型检查、构建与已有运行检查，不运行测试套件。
3. 核对既有发布前审查及新增原生打开子任务审查，创建补充发布提交；用户已确认更新后的源码发布范围、安装目标及上下文修订。
4. 推送分支与标签、创建源码 Release；核验远端版本、提交和源码归档，进行最终结果独立审查；队列末尾提交所有收尾记录保持工作区干净。

## Target
- [x] T1: 当前项目全部本地改动已纳入 Git 提交。
- [ ] T2: 新版本已发布，版本信息、发布内容与对应提交一致，可提供版本号及发布入口。

## Result

- T1: 已创建本地提交6958c272edfa3886a18f3c352e72a4f028249d39（95文件），包含全部原有非忽略改动、版本0.2.0与发布前验证证据；提交后git status为空。后续审查/发布任务收尾记录将在远端确认后另行提交。
- Review gate: Required — Task left In Review; rerun the applicable review after revisions
## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [发布前审查](../artifacts/commit-and-release/reviews/round-01.md) | git:6958c272edfa3886a18f3c352e72a4f028249d39 | no blocking findings；T2远端发布待授权及验证 |

## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Stale
- Reason: 公开发布包含多个原生与前端功能的全部本地改动；需核对版本一致性、发布范围与敏感数据。T2远端发布尚未执行，预发布审查不声称完成。
- Snapshot: git:6958c272edfa3886a18f3c352e72a4f028249d39
- Evidence: release提交内容；tasks/artifacts/commit-and-release/evidence 中build.log、runtime.log、short-pages.log、versions.json、preflight.json；源码/配置whitespace通过，原始证据结构性空白保留。
- Task fingerprint: 645b45320d1480e7c27740fd1205708d1a704c7ebe7fa0ff140fb6b7262d2887
