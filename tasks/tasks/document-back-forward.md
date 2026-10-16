# 增加文档浏览前进与后退导航

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 18:08) |
| Artifacts | [Artifacts](../artifacts/document-back-forward/) |
| Kind | Task |

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/document-back-forward/reviews/round-01.md) | tasks/artifacts/document-back-forward/evidence/snapshot.sha256 | no blocking findings；未执行 GUI 验收 |

## Scope

- macOS 顶部导航菜单，后退与前进及对应快捷键；不是撤销重做，不修改 Dock 命名。
- 历史仅当前会话保存；不绕过读取授权，不修改用户文档。保留既有未提交的品牌、链接处理、目录枚举改动。

## Plan

1. 原生菜单发送导航事件，窄 IPC 同步禁用状态并保留默认菜单。
2. 前端仅记录成功打开的文档或目录；历史导航复用读取入口，恢复原目录上下文，新访问截断前进历史。
3. 执行类型检查、前端构建及 Rust 编译检查，独立审查后验证当前内容。

## Task Summary

**前端导航**：[前端](../../src/)维护会话历史、成功加载后提交游标、串行同步菜单状态，并恢复历史文档的目录上下文。

**原生菜单与权限**：[Tauri 原生层](../../src-tauri/)保留默认菜单并添加导航菜单及快捷键，通过主窗口权限限定的命令更新可用状态。

## Target
- [x] T1: 用户可通过应用中的后退与前进菜单在已浏览文档之间导航。
- [x] T2: 无可返回或前进的历史时，相应菜单项不可用。

## Result

- T1: 原生默认菜单追加导航菜单与 CmdOrCtrl+[ / ]，前端订阅事件并经已有文件读取入口恢复历史；成功加载提交历史、失败不移动游标、分支截断前进历史。npm run check、npm run build、cargo check --locked 通过；未运行测试或 GUI 实测。
- T2: 原生两个菜单初始禁用；前端根据游标与历史长度计算状态，历史加载中禁用，串行 IPC 防止旧状态覆盖；编译与权限生成通过，源代码快照存于 evidence/snapshot.sha256。
- Review gate: Passed — 独立审查 9d662972-4e12-4292-9b06-875cf5994394 无发现；报告 round-01 已保存，六文件哈希复算一致。GUI 运行未验收，作为交付限制披露。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 异步文档历史与原生菜单跨边界联动，需要独立核对竞争和失败路径。
- Snapshot: tasks/artifacts/document-back-forward/evidence/snapshot.sha256
- Evidence: Result T1/T2；改动前副本 before/ 用于区分已有未提交改动；TS、前端构建与 Rust 编译通过。
- Task fingerprint: 048293e84b10e6c0aa5d1fea37c88251e9d604af269aa90d823f1a710f608f1b

## Verification

- Passed: 审查后快照六项一致、TypeScript 检查、Rust cargo check --locked 和 diff 检查通过；前端 build 已通过且内容未漂移。导航和禁用路径经独立静态审查；未运行测试及 GUI 验收。
