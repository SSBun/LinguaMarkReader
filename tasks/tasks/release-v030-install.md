# 发布 v0.3.0 并安装到本机

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-21 11:29) |
| Kind | Task |

## Scope

- 沿用既有 GitHub 源码发布渠道，不上传安装包，不引入 Sparkle 或自动更新。
- 纳入全部本地改动，包括作品集注册记录；本地应用为 arm64 Release、ad-hoc 签名且未经公证。
- 远端发布与覆盖安装必须通过单独的具体操作确认；不运行测试套件。

## Plan

1. 将 Tauri 版本源及 npm、Cargo 元数据同步至 0.3.0，更新 README 与 CHANGELOG。
2. 检查全部新增文件，执行类型检查、Release 构建和产物版本/签名校验。
3. 提交发布范围，列出确切提交、远端、标签及本机安装位置，等待操作确认。
4. 确认后发布源码版本，备份旧应用并安装新版，核对远端引用、安装字节与运行路径。
5. 记录最终结果，提交并推送收尾记录，保证项目工作区干净。

## Target
- [x] T1: 当前项目全部本地改动经检查后提交，版本由 0.2.0 升至 0.3.0，完成对应版本发布。
- [x] T2: 构建 v0.3.0 macOS 应用，复制到本机应用程序目录并重新打开，核对安装版本。

## Result

- T1: 已将确认时全部本地改动提交为 5dbbfea7b5beb6379484dffea71a631d973d2ea3（18文件；历史构建日志仅去除行末空格）。npm/Tauri/Cargo及锁文件同步0.3.0。远端 main 与 annotated v0.3.0 解引用匹配该提交；稳定非draft Release https://github.com/SSBun/LinguaMarkReader/releases/tag/v0.3.0 返回HTTP200，无安装资产。独立下载源码归档229文件逐一匹配Git，SHA256 ac4720b3c09310f4acbe4f9665c29bb9e2ddab3200458922d8e675c383a69357。初次归档比较受Git中文路径转义影响，改为NUL分隔后通过。确认后另行新增的 assess-updater-integration 任务保持未提交。
- T2: npm run check、npm run build:mac及diff检查通过。Release为arm64，版本/构建均0.3.0，ad-hoc签名且未公证；codesign --verify --deep --strict通过。旧安装备份至/tmp/linguamark-before-v030.h5wovK/LinguaMark Reader.app，再安装到/Applications/LinguaMark Reader.app；全部4文件与构建完全一致，可执行SHA256 d7e4467c8c1a5f15e03900b7fafb620b9845c235e34e9947e4a2489128258c48，PID76898运行于安装路径。未运行测试套件，未直接观察窗口或原生表格交互。
- Review gate: Skipped — R1四项均具直接证据；既有表格修复验证未改变，无独立审查义务。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 实际新增交付为既有发布流程下的版本元数据、说明及本地构建安装；运行代码无本任务新增逻辑。
- Snapshot: git:5dbbfea7b5beb6379484dffea71a631d973d2ea3; tag:v0.3.0; installed-exe-sha256:d7e4467c8c1a5f15e03900b7fafb620b9845c235e34e9947e4a2489128258c48
- Evidence: T1远端引用/源码归档逐字节核对，T2类型检查/Release构建/签名/安装文件对照/启动路径。
- Result clarity: 目标0.3.0、源码发布、不上传安装包、本机安装及签名限制经具体确认；版本和发布状态已直接观测。
- Bounded impact: 版本及说明更新复用现有Tauri构建与GitHub发布，依赖版本未变，无新增运行逻辑；历史记录全部检查。
- Low risk: 公开源码元数据发布，无凭据与用户文档上传；本地只读应用替换前完整备份，未改授权或默认打开方式，已确认ad-hoc限制。
- Sufficient verification: 全部版本与实际bundle一致，归档229文件及安装4文件逐字节匹配，codesign和进程路径通过。未运行测试套件或观察原生UI；不将启动等同交互验证。
- Task fingerprint: 47b39c54d126fdf5da7b22dcbcf400eb2c39f575e7af42a90523f17c87514012

## Verification

- Passed: 终验发布标签仍绑定5dbbfea，GitHub稳定Release HTTP200且归档与发布源码一致；安装签名复查通过，PID76898仍运行于/Applications安装副本；版本0.3.0及可执行哈希不变，Context校验通过。未运行测试，原生UI未直接验证。
