# 提交全部本地改动并发布新版本

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 16:48) |
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
- [x] T2: 新版本已发布，版本信息、发布内容与对应提交一致，可提供版本号及发布入口。

## Result

- T1: 本地全部非忽略项目改动已纳入6958c272edfa3886a18f3c352e72a4f028249d39及补充提交6557da4dc27237bfaf3f9bcaff889bf9485ca655，两者均已推送main；包含原生Markdown打开与标签修正。只剩队列阶段的任务收尾证据，按已批准计划在队列结束统一提交。
- T2: 已按用户最终Safety Confirmation发布稳定非draft v0.2.0：https://github.com/SSBun/LinguaMarkReader/releases/tag/v0.2.0；HTTP200，latest API返回v0.2.0，远端main与annotated tag解引用均为6557da4。独立下载源码归档203文件逐一与Git blob匹配，SHA256 13c23a58bc60a9d6b7e23b8692aa0b369a0f1d943186f308037176c48171dc74。见remote-release.json与archive-verification.json；无安装包资产。
- Review gate: Passed — fresh只读结果审查b382e166-d2e1-4b9d-95b8-d14347d295fd无阻断发现；round-02已保存，主会话复核源码、远端main/tag、归档SHA256及发布正文一致。
## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [发布前审查](../artifacts/commit-and-release/reviews/round-01.md) | git:6958c272edfa3886a18f3c352e72a4f028249d39 | no blocking findings；T2远端发布待授权及验证 |
| 02 | [发布结果审查](../artifacts/commit-and-release/reviews/round-02.md) | git:6557da4dc27237bfaf3f9bcaff889bf9485ca655 | no blocking findings；主会话已核验远端正文、引用及归档身份 |

## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 发布最终结果审查：核对源提交、版本、公开Release与下载归档的一致性，保留既有R2义务。
- Snapshot: git:6557da4dc27237bfaf3f9bcaff889bf9485ca655; v0.2.0; archive-sha256:13c23a58bc60a9d6b7e23b8692aa0b369a0f1d943186f308037176c48171dc74
- Evidence: 当前T1/T2 Result；remote-release.json、archive-verification.json、既有版本/构建记录；native-file-opening独立审查与源码SHA256再次匹配。
- Task fingerprint: 0c6c87eeb7544f21d1461d5faabae1863d14ac03e106c38df2e47f475f4295ba

## Verification

- Passed: 最终远端main/tag解引用6557da4，稳定Release正文与CHANGELOG提取说明一致，archiveSHA256保持13c23a58...；203文件比对证据有效，源码无漂移，后续任务记录按已授权计划收尾提交。
