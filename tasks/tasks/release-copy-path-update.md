# 发布包含原始路径复制改动的新版本

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-24 16:49) |
| Kind | Task |

## Scope

发布 v0.4.1，包含已完成的文章目录复制路径修复和版本元数据；不纳入无关本地任务、分析文件，不替换本机应用，不办理 Apple 公证。

## Plan

1. 同步 Tauri、npm、Cargo 版本及锁文件、README、CHANGELOG。
2. 使用现有更新密钥构建 arm64 归档，验证签名、版本、架构与更新清单。
3. 用户确认远端发布后，仅提交本次 8 个交付文件，推送 main 与 v0.4.1 标签；上传草稿 Release，核对后设为最新稳定版。
4. 核验远端发布资源与下载内容，再记录结果及最终验证。

## Preparation

- npm run check、npm run build:mac:update、git diff --check 通过；构建脚本已用公钥验证更新归档及签名版本。
- codesign --verify --deep --strict 通过；实际应用版本和构建号均为 0.4.1，主程序为 arm64。
- 发布归档：src-tauri/target/aarch64-apple-darwin/release/bundle/macos/LinguaMark-Reader_0.4.1_aarch64.app.tar.gz。
- 归档 SHA-256：d4b7ee985bc82c2e4c10d0544cdbeb7dab4644f717218ae7ce92b3a76dd453ea。
- 清单为 darwin-aarch64，下载地址指向 v0.4.1；应用仍为 ad-hoc 签名，未经公证。
- 未运行测试套件，未进行原生剪贴板实测或真实安装升级。
- 用户在远端安全确认后回复“publish it”，授权提交、推送、上传并设为最新稳定版。
- 已发布提交 18c0c8ff0f0ac141c4529cc1a3e7526ebe56cf64 及标签 v0.4.1；仅提交约定的 8 个交付文件，任务记录和其他本地内容保留未提交。
- 草稿 Release 三个附件下载后均与本地 cmp 逐字节一致，再公开为最新稳定版。公开 latest/download/latest.json 与本地清单一致；GitHub latest API 返回 v0.4.1。
- 发布页面：https://github.com/SSBun/LinguaMarkReader/releases/tag/v0.4.1 。未替换本机应用。

## Target
- [x] T1: 发布包含文章目录 Copy Link 原始文件路径复制改动的新版本，并可获取对应发布产物。

## Result

- T1: v0.4.1 已在 https://github.com/SSBun/LinguaMarkReader/releases/tag/v0.4.1 公开为最新稳定版；提交 18c0c8f 含 Copy Link 修复。3 个远端附件下载后与本地逐字节一致；公开 latest.json 为 0.4.1，指向已上传 arm64 归档。构建、签名及版本验证通过；未安装或实测升级。
- Review gate: Skipped — R1：既有流程补丁发布，版本/产物/签名/远端字节已有确定性核验，无新增发布机制及独立审查要求。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 沿用已有发布构建与签名流程的补丁版本发布，没有修改更新机制或密钥信任边界。
- Snapshot: git:18c0c8ff0f0ac141c4529cc1a3e7526ebe56cf64; v0.4.1 archive sha256:d4b7ee985bc82c2e4c10d0544cdbeb7dab4644f717218ae7ce92b3a76dd453ea; latest.json sha256:205894f363b4d96c7cd6e0002abeb4e7823fe0481891737ca595e838a7df665f
- Evidence: Preparation 与 T1：类型检查、签名构建、公钥验证、codesign、草稿下载逐字节核对、公开清单核对。
- Result clarity: 已明确发布包含目录复制路径修复的 0.4.1；用户单独批准远端动作。
- Bounded impact: 8 个交付文件只含既有低风险修复及同步版本和说明；使用未改动的更新打包脚本，仅现有 arm64 平台。
- Low risk: 未改密钥、权限、安装器或更新协议；不覆盖旧版本且不替换本机应用；既有更新流程要求用户确认安装，发布产物签名已验证。
- Sufficient verification: 原生 release 构建、应用与更新签名验证成功；远端归档、签名、清单逐字节匹配，latest API 和公开清单均指向 0.4.1。未运行测试或真实安装升级，不将其宣称为已验证。
- Task fingerprint: ca27b79035a302e91980358786d7803172e1c958a37fab51c0c32a69cc2a73a3

## Verification

- Passed: 最终交付文件与 18c0c8f 一致、git diff --check 通过；GitHub Release 非草稿非预发布且 latest 为 v0.4.1，公开更新清单与已验证本地清单一致。未运行测试、安装或实际升级。
