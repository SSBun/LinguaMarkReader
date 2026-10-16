# 评估并接入应用内 Updater

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-21 11:50) |
| Artifacts | [Artifacts](../artifacts/assess-updater-integration/) |
| Kind | Plan |

## Target
- [x] T1: 在关于页接入官方 Tauri Updater，支持手动检查更新、展示检查结果、用户确认后下载并显示进度、安装及重启，失败时可重试。
- [x] T2: 配套签名更新产物及 GitHub Releases 更新清单的配置和发布说明；明确仍需用户提供的密钥或发布前提，不将占位配置声称为可用更新链路。
- [x] T3: 保持既有阅读功能、文件授权边界及应用标识；不默认启用启动自动检查，不实际发布、安装替换本机应用或办理 Apple 签名公证。

## Scope

- 用户已要求从评估转为接入实施，并确认当前实施目标；交付应用更新接入代码及配套本地发布命令和说明。
- 允许静态检查验证；不运行测试套件。真实发布、凭据配置、Apple 签名公证与本机安装另行授权。

## Decisions

- 当前项目可采用 Tauri 2 官方 Updater，无需桥接 Sparkle。package.json 使用 Tauri 2 API/CLI；src-tauri/Cargo.toml 使用 tauri 2，Cargo.lock 锁定 tauri 2.11.5。
- 使用官方 updater/process 插件；主窗口仅增加配置就绪查询、检查、下载安装、资源释放和重启权限。不开放退出、单独下载或任意网络访问权限。
- 更新入口位于现有设置/关于页，只在用户点击时检查。用户第二次点击明确标注下载、安装并重启的按钮后才下载安装；重启失败不重复安装。更新说明按纯文本渲染。
- macOS 覆盖配置启用 app 打包，signingIdentity 为 ad-hoc 的“-”；基础配置禁用 bundle 不代表 macOS 无法打包。Tauri 更新签名与 Apple Developer ID 签名/公证是不同链路。
- 更新地址指向 SSBun/LinguaMarkReader GitHub Releases 的 latest.json。build:mac:update 仅构建本机 Node 架构对应的稳定版，生成架构标识归档、签名及单架构清单；多架构合并和发布由负责人按说明执行，不增加自动发布工作流。
- 公钥保持空值，应用通过原生配置查询明确报告配置未就绪，不发送检查请求；发布命令拒绝空公钥或缺少签名私钥。未生成私钥、访问签名凭据或声称线上链路已可用。
- 保留应用标识 com.linguamark.reader、文档只读授权和正文远程内容限制；Updater 原生网络请求不应成为放宽正文 CSP 的理由。
- 当前未包含 Updater 的旧安装不能自行获得更新能力，必须先手动安装首个包含 Updater 的版本。

## Plan

1. 接入原生插件与最小权限，在关于页提供手动更新交互和状态恢复。
2. 增加独立签名更新构建命令，保留普通本地构建无需更新私钥的行为，补齐发布与首次启用说明。
3. 执行 TypeScript、Rust、脚本语法与无写入前端打包等静态验证；对照现有阅读入口、授权和持久化边界自检。
4. 按 R2 执行独立只读 task-review，核实问题并修复，随后复核当前内容和交付边界。
5. 真实签名升级、网络失败、版本对比、安装重启和升级后的数据保留属于配置密钥并授权实际分发后的验证，不在本次声称已验证的范围。

## Result

- T1: scope-01.json 固定的代码中，关于页接入手动检查、确认下载安装、进度、失败重试及安装后仅重试重启；原生配置为空时明确提示且不调用 check。static-checks-01.log 记录 TypeScript、cargo check、Clippy 和前端内存打包通过；未运行 UI 或真实升级，公钥仍未配置。
- T2: scripts/build-update.mjs 经 node --check，通过源码检查确认拒绝空公钥和缺少私钥、显式开启签名更新产物并按当前 Mac 架构生成清单；README 提供配置、草稿发布、多架构合并及首次手动安装说明。未实际签名构建、发布或核验密钥对；配置空公钥不是可用线上更新服务。
- T3: changes-01.patch 显示应用标识、CSP、文件读取授权、收藏/设置存储及 macOS 签名配置未改变；更新仅由关于页点击启动，权限限于本地主窗口。未运行测试、安装或发布。cargo fmt --check 未通过，但对 HEAD 与当前内容的 rustfmt 输出比较确认差异完全既有（main.rs 36 行、native_picker.rs 8 行），新改动无额外格式差异；git diff --check 通过。
- Review gate: Passed — fresh 只读 Reviewer 0e8cb077-131d-41fe-8464-c9c31e0d842c 未发现阻断问题；反馈已保存并索引于 reviews/round-01.md。所有者重新计算 14 个文件、patch、证据和 HEAD，与 scope-01.json 一致。真实升级与发布保留为已披露的交付外验证。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 涉及原生更新安装、重启权限、更新签名配置和前后端状态协调，不能按低风险变更豁免独立审查。
- Snapshot: sha256:77f5fcab24b356ba96abe64e131e97b80429f3c1fa4436b63143fe900081be7f; tasks/artifacts/assess-updater-integration/evidence/scope-01.json
- Evidence: tasks/artifacts/assess-updater-integration/evidence/static-checks-01.log; Result T1-T3; changes-01.patch。仅验证静态集成，不声称已完成签名发布或真实升级。
- Task fingerprint: 3b65eaf08d0dcd1da85d29390a1b604599eee38732948c481020d90238ac4962

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [Round 01](../artifacts/assess-updater-integration/reviews/round-01.md) | sha256:77f5fcab24b356ba96abe64e131e97b80429f3c1fa4436b63143fe900081be7f | no blocking findings；所有者已复核内容无漂移 |

## Verification

- Passed: 独立审查后重新执行 npm run check、node --check、cargo check --locked、cargo clippy --locked -D warnings、git diff --check 均通过；Context validate 通过，14 个文件哈希及报告快照再次匹配。未运行测试、签名构建、真实更新或发布；既有 rustfmt 差异未改动。
