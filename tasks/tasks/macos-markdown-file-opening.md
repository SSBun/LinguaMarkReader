# 实现 macOS Markdown 文件打开与应用打包

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 16:23) |
| Artifacts | [Artifacts](../artifacts/macos-markdown-file-opening/) |
| Kind | Task |
| Parent | release-install-markdown-default |

## Plan

1. 用 Tauri macOS 配置生成带 Markdown UTI/扩展名声明的本地应用包，使用 ad-hoc 签名，不增加 DMG 或公证。
2. 将系统文件打开事件缓存在 setup 前可用的状态中，前端监听就绪后领取并验证文件，再通过既有授权读取正文。
3. 实际运行应用验证冷启动、已运行状态、中文空格路径及非 Markdown 拒绝；核对授予单文件而非父目录权限。
4. 执行构建、签名完整性和独立只读审查，交给后续发布与安装阶段。

## Target
- [x] T1: 可构建带 Markdown 文件类型声明的本地 macOS 应用包。
- [x] T2: 系统打开 Markdown 文件时，冷启动和已运行状态均可读取对应正文，且只授权被打开文件。

## Result

- T1: npm run build:mac成功生成0.2.0 arm64应用包，Info.plist声明md/markdown、net.daringfireball.markdown与Viewer/Alternate，codesign --verify --deep --strict成功；签名为ad-hoc，未公证。见bundle.json与build-final.log。
- T2: 真实Tauri .app：同一PID79726冷启动含中文空格路径.md后AX发现NATIVE_COLD_OPEN_OK，已运行时打开.markdown后发现NATIVE_WARM_OPEN_OK；打开txt显示拒绝提示且未授权，两个验证文件获授权、父目录未授权。见cold-open.json、warm-open.json、rejected-open.json、authorization.json和截图。已修复Opened先于setup访问Access的崩溃。未运行测试套件。
- Review gate: Passed — 独立只读审查4ce0258f-77e9-457a-aa11-3c61e0f446d1无阻断发现；报告已保存并索引，主会话复核所有源码及.app可执行文件SHA256一致。
## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/macos-markdown-file-opening/reviews/round-01.md) | sha256:fac2822431938096cfd5c0d08e2c09f878047e442f1abf281bfd8ca04192a5de | no blocking findings；主会话核验源码和可执行文件身份一致 |

## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 新增系统打开授权入口、启动事件时序、前端恢复协调及应用文件关联，需要独立核对信任边界。
- Snapshot: sha256:fac2822431938096cfd5c0d08e2c09f878047e442f1abf281bfd8ca04192a5de (tasks/artifacts/macos-markdown-file-opening/evidence/snapshot.json)
- Evidence: T1/T2 Result；实际原生冷/热启动与拒绝路径AX证据、授权记录布尔检查、签名、构建日志；npm run check与cargo clippy成功。
- Task fingerprint: 421ad5e0afb82a6a597a77a7f97d395b3857b61ce3d87df855bd42d16da0ee36

## Verification

- Passed: 审查后npm run check及codesign --verify --deep --strict成功；原生冷/热启动和拒绝检查对应相同源与可执行文件哈希。未运行测试，未进行安装或默认应用更改。
