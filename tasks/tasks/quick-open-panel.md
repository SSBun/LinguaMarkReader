# 将收藏与最近浏览改为快捷打开面板

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 18:22) |
| Artifacts | [Artifacts](../artifacts/quick-open-panel/) |
| Kind | Task |

## Scope

仅改造工具栏打开的收藏与最近浏览浮层；保留首页列表、已有持久化和原生文件访问授权逻辑，不改变其他任务的未提交内容。

## Plan

1. 将浮层替换为搜索优先的单列列表，保留现有视觉变量。
2. 接入收藏与最近项目，完成筛选、去重、键盘选择与焦点恢复。
3. 执行类型检查、前端构建和浏览器交互核对；不运行测试套件。
4. 根据实际改动完成独立只读审查与最终核对。

## Task Summary

**快捷打开界面**： [src](../../src/) 新增独立的快捷打开浮层，主界面接入现有收藏、最近项目与文件打开流程，提供名称／路径搜索、去重、键盘选择、空状态及阅读焦点恢复。

**阅读器样式**： [public](../../public/) 将大尺寸双栏弹窗改为暖色绿色的限高单列浮层，突出文件名并弱化路径，保留首页原有列表样式。

## Target
- [x] T1: 收藏与最近浏览使用保留暖色绿色风格的紧凑单列搜索浮层，文件名突出、路径次要，列表限高滚动。
- [x] T2: 打开即聚焦搜索；空查询分组展示收藏和最近项目，查询按名称与路径过滤并去重、保留收藏标识。
- [x] T3: 支持上下键选择、Enter 打开、Esc 关闭及鼠标操作，关闭恢复阅读焦点；不扩展为全局文件搜索或命令中心。

## Result

- T1: 类型检查和前端构建通过；浏览器截图显示 680px 单列暖色浮层，390px 窄窗口无横向溢出，25 项列表内部滚动；见 evidence/observations.md 与 snapshot.json。
- T2: Chrome 实际构建 DOM：打开输入框聚焦；2 收藏+5 最近去重后5项；名称及路径组合搜索返回1项且星标保留；无匹配与全空状态均核对。见 ../artifacts/quick-open-panel/evidence/observations.md。
- T3: CDP 键盘上下选择、Enter 打开、Escape 关闭及鼠标目录打开均核对，关闭焦点为阅读容器；原生 invoke 使用模拟接口观察命令参数，未验证 macOS WebKit/真实磁盘授权；未运行测试套件。见 ../artifacts/quick-open-panel/evidence/observations.md。
- Review gate: Passed — 独立只读 reviewer 运行 a53054d4-718b-4d10-9814-e38f78be97e2 无发现；报告 ../artifacts/quick-open-panel/reviews/round-01.md；主会话复核全部快照散列一致。原生验证限制非阻断，已披露。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 涉及搜索结果状态、选择、弹窗焦点及主界面多个行为的联动，需要独立核对遗漏。
- Snapshot: sha256:03b5f578b04a11e110555b3dd3df4877e111742b994d3728570be45d86cadeee (tasks/artifacts/quick-open-panel/evidence/snapshot.json)
- Evidence: 见 ../artifacts/quick-open-panel/evidence/observations.md；类型检查、构建、DOM交互及响应式截图通过；原生 WebKit 未验证。
- Task fingerprint: 0163d2acbb3754bf08068d51736f989221c7357ac1258565aefc795cd35c8b51

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/quick-open-panel/reviews/round-01.md) | sha256:03b5f578b04a11e110555b3dd3df4877e111742b994d3728570be45d86cadeee | no blocking findings |

## Verification

- Passed: 审查后再次 npm run check、npm run build、git diff --check 通过；全部冻结源码和证据散列与审查一致，报告链接已核对，Context 校验通过。浏览器交互与截图见 observations.md；未运行测试套件，未验证 macOS 原生打包应用。
