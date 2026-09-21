# 构建并重新打开包含表格滚动修复的应用

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-21 11:13) |
| Kind | Task |

## Target
- [x] T1: 当前源码（含表格独立横向滚动修复）成功构建为 macOS 应用，关闭旧实例并重新打开本次构建产物。

## Result

- T1: npm run build:mac -- --debug 成功，产物为 src-tauri/target/debug/bundle/macos/LinguaMark Reader.app；osascript 正常退出旧应用，确认旧进程消失后 open -n 启动本次产物，PID 52457 的完整可执行路径与本次构建一致。未覆盖 /Applications 安装版；未运行测试套件，未直接观察窗口或交互。
- Review gate: Skipped — R1 本地构建启动操作，构建与进程证据充分，无源码修改或独立审查义务。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 使用现有构建入口生成本地 Debug app 并启动，无源码变更。
- Snapshot: 本地 Debug app 可执行文件 SHA256:519637e831117a46957bf61b44a130d5f3250130eb65933a20c49688e7e6e3aa
- Evidence: 构建输出及 PID 52457 的完整启动路径。
- Result clarity: 构建当前源码并退出旧实例、打开新产物，目标明确。
- Bounded impact: 仅本地构建产物及运行实例；未安装覆盖、发布或修改源码。
- Low risk: 可逆本地只读阅读器重启；未改变文件授权与数据。
- Sufficient verification: 构建成功、旧进程退出、新进程路径确认；未观察 UI，未运行测试套件。
- Task fingerprint: 5eace5e8a547682cc2d2883140ef6c46b652894adbe8f35dd2fb4da1f974a991

## Verification

- Passed: 再次确认 PID 52457 运行于本次 Debug app 路径，可执行文件 SHA256 未变化。构建及重新启动完成；窗口与交互待用户观察，未运行测试。
