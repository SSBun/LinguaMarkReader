# 安装已发布应用并设置 Markdown 默认打开方式

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 16:57) |
| Artifacts | [Artifacts](../artifacts/install-markdown-default/) |
| Kind | Task |
| Parent | release-install-markdown-default |

## Plan

1. 核对已发布提交6557da4及已验证应用包身份，记录现有默认处理器与用户授权集合。
2. 正常退出同名应用进程，将签名完整的本地应用包复制到 /Applications/LinguaMark Reader.app；若已存在则先移至用户目录备份。
3. 使用 macOS 公共 API 只设置 Markdown UTI 的默认应用，核对 md/markdown 实际路由及 txt/html/pdf/json 默认值不变。
4. 不指定应用直接打开验证 Markdown，检查安装后正文、版本、签名、应用文件身份及已有用户授权保留，完成独立结果审查。

## Target
- [x] T1: Mac Applications 中安装的应用版本与已发布版本一致，保留已有用户数据。
- [x] T2: Markdown 文件默认交给 LinguaMark Reader 且可实际打开正文，其他文件类型的默认应用不变。

## Result

- T1: 已安装/Applications/LinguaMark Reader.app，版本/构建0.2.0，4个bundle文件逐字节SHA256匹配发布提交6557da4对应的已验证构建；可执行SHA256 50807498cca20618f7651c454f9a1b612817737126e3980d8d381b62767fcda1，ad-hoc签名deep/strict有效，未公证。无旧安装包无需备份，正常退出旧进程后安装；原有文件/目录授权集合全部保留，未移除或覆盖用户数据目录。见installation.json、data-preservation.json。
- T2: NSWorkspace公共API将Markdown UTI改为com.linguamark.reader，md/markdown解析均指向/Applications安装副本；移除仅用于验证的build.app重复注册，txt/html/pdf/json处理器与应用路径逐项未变。不指定应用执行open .md与.markdown，同一安装进程PID12480的AX树分别发现冷/热正文标记。见defaults-before/after.json与default-md/markdown-open.json、installed-reader.png。
- Review gate: Passed — 独立只读审查c078e7f1-76cc-48bc-add2-4419137d7192无阻断发现，报告已保存并索引；主会话重新计算应用/证据哈希、查询实时默认值、核对原授权集合，全部匹配。
## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [安装结果审查](../artifacts/install-markdown-default/reviews/round-01.md) | sha256:206a250a5f1c05eb67b56fb559d3b55f93b1c40aecd473328a34a34ed9fc255e | no blocking findings；主会话完成应用/默认值/证据身份实时复核 |

## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 本机应用安装与文档默认路由改变属于系统配置边界，使用独立结果审查核对范围和身份。
- Snapshot: sha256:206a250a5f1c05eb67b56fb559d3b55f93b1c40aecd473328a34a34ed9fc255e (tasks/artifacts/install-markdown-default/evidence/snapshot.json)
- Evidence: T1/T2 Result；应用包四文件对比、签名、默认处理器前后快照及实际默认打开AX证据。
- Task fingerprint: 352280f28329bae5002ab14fb67dcb3a2d082da77e9c4a3124f89e31c4be27c9

## Verification

- Passed: 最终codesign deep/strict成功，安装可执行文件SHA25650807498...；md/markdown仍路由/Applications安装副本，txt/html/pdf/json与基线一致，原用户授权全部保留。实际默认打开冷/热验证已通过，未运行测试。
