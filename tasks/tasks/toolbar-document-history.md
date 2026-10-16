# 在阅读工具栏显示文档后退与前进按钮

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 18:15) |
| Artifacts | [Artifacts](../artifacts/toolbar-document-history/) |
| Kind | Task |

## Scope

- 工具栏显示后退和前进箭头，复用已实现的文档浏览历史；不改变授权、保存或原生菜单逻辑。
- 共享工作区正在发生快捷打开面板改动；保留该范围，本任务 CSS 仅修改工具栏两处列宽，不能将 before 副本与当前完整差异全部归入本任务。

## Plan

1. 在工具栏最左侧加入两个带无障碍标签和快捷键提示的箭头按钮。
2. 与菜单共用历史游标及禁用状态，复用 navigateHistory。
3. 调整五按钮布局，执行类型检查、构建与任务范围差异核对。

## Task Summary

**阅读工具栏**：[前端](../../src/)增加左右箭头图标和按钮，将点击接入已有历史导航，同步按钮与菜单禁用状态。

**工具栏布局**：[样式](../../public/)将左侧导航从三列调整为五列并扩展对应轨道宽度；未改快捷打开面板。

## Target
- [x] T1: 从列表文档点击超链接进入另一文档后，用户可通过窗口内可见的后退箭头回到之前的列表文档。
- [x] T2: 工具栏提供前进箭头；无对应历史时按钮禁用，保留现有菜单与快捷键。

## Result

- T1: 工具栏 navigation.append 首两项为 backButton/forwardButton，点击分别调用已有 navigateHistory(back/forward, viewer)；文档超链接仍经 openNativeFile 成功后写入同一历史。npm run check 与 npm run build 通过；未运行测试或 GUI 实测。
- T2: 两按钮初始 disabled；updateNavigationMenu 在原有四处状态刷新点同步两个 disabled 后沿用原生 IPC，菜单/快捷键代码未改；5×34+4×6=194px 与左轨道一致，640px 最小窗口下保留标题空间。
- Review gate: Skipped — R1：低风险工具栏入口复用既有导航，当前检查足以覆盖改动范围。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 有界 UI 入口补充，历史及权限逻辑不变。
- Snapshot: tasks/artifacts/toolbar-document-history/evidence/snapshot.sha256
- Evidence: Result T1/T2；before 副本及任务范围差异核对；TS 检查、前端构建及 diff 检查通过。
- Result clarity: 明确显示窗口内左右箭头，绑定已有浏览历史而非新行为。
- Bounded impact: 仅两个按钮、两条图标路径和两处栅格列宽；已有状态计算及历史导航不变。
- Low risk: 可逆显示与事件绑定，无文件写入、权限或原生行为变更；保留并行面板改动。
- Sufficient verification: 静态核对全部四个状态刷新调用及点击绑定，TS 编译和前端构建通过；未进行 GUI 实测或测试。
- Task fingerprint: 021e18b742e1d001d09f27a6d885bc93cec5d76d915ef7692dce2e9b83dcb0cd

## Verification

- Passed: 最终三文件 SHA256 均一致，git diff --check 通过；类型检查与前端构建绑定当前内容。按钮入口、禁用同步与194px布局已静态核对；未运行测试或 GUI 验收。
