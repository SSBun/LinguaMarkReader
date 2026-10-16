# 重新设计阅读器空页面与留白

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 19:42) |
| Artifacts | [Artifacts](../artifacts/redesign-empty-page/) |
| Kind | Task |

## Scope

仅修改空首页及其打开入口和列表呈现；保留已有文件访问逻辑、正文排版、快捷打开浮层和其他任务改动。

## Plan

1. 简化首页引导，增加直达现有文件／目录选择器的入口。
2. 将收藏与最近列表改为文件名优先的单列布局，建立页面外缘与内部的响应式留白。
3. 类型检查、前端构建及独立浏览器中的布局和交互核对；不运行测试套件。
4. 根据实际结果完成风险分级和必要的独立审查。

## Task Summary

**首页界面**：[src](../../src/) 简化空首页引导，增加复用现有选择器的文件与目录入口，将最近项目和收藏改为文件名优先、父路径辅助的列表。

**首页布局**：[public](../../public/) 移除双栏大卡片与固定垂直居中，使用限宽单列内容、响应式页面边距和内部留白；列表随页面滚动，窄窗口下约束空首页网格宽度，不改变正文与快捷打开浮层样式。

## Target
- [x] T1: 未打开文档时呈现清晰、紧凑的开始阅读页面，收藏与最近项目以文件名为主、位置为辅，不再使用失衡的大面积双栏卡片。
- [x] T2: 空页面在侧栏展开、收起和窄窗口下均保持适当的四周内边距、区块间距和内容宽度，不贴边、不溢出。
- [x] T3: 保留暖色绿色视觉风格及现有文件、目录、收藏和最近项目打开行为，不改变正文阅读排版或已完成的快捷打开浮层。

## Result

- T1: 真实构建浏览器截图显示简短引导、打开入口及单列最近/收藏列表，文件名与父路径分层；空记录无固定大空白。见 ../artifacts/redesign-empty-page/evidence/observations.md。
- T2: 侧栏展开及收起均保留24px外缘和限宽720px内容；390/320px窗口为12px外缘及20px内边距，内容无横向溢出；类型检查和构建通过。见浏览器截图与 observations.md。
- T3: mock invoke 验证按钮复用 pick_entry/pick_directory、列表使用原路径打开；取消不改存储。正文padding仍48px 56px 96px；快捷打开回归聚焦/Esc通过且源码未改。原生WebKit及真实授权未验证，未运行测试。
- Review gate: Passed — 独立审查 ab4d1a59-a8fa-43df-90d7-f2f9cb916f08 无问题；报告 ../artifacts/redesign-empty-page/reviews/round-01.md。主会话已逐一核对 manifest 及所有文件SHA256一致，清除快照身份待核对项。原生验证限制已披露。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 首页样式与正文共用选择器、侧栏响应式网格及新增打开入口存在联动，独立检查回归。
- Snapshot: sha256:3bb81112bdee192789d256c9ef4dc2eaf92b079271688b4fbc15a419a9924c00 (tasks/artifacts/redesign-empty-page/evidence/snapshot.json)
- Evidence: ../artifacts/redesign-empty-page/evidence/observations.md：类型检查、构建、布局截图和浏览器动作核对通过；原生环境未验证。
- Task fingerprint: ec458fdbbb154e2094692edcb45ce5a01b9fd17e94e6ef97f9b291bf65d05269

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/redesign-empty-page/reviews/round-01.md) | sha256:3bb81112bdee192789d256c9ef4dc2eaf92b079271688b4fbc15a419a9924c00 | no blocking findings；主会话须复核哈希 |

## Verification

- Passed: 审查后类型检查、构建、diff检查通过，最终SHA256与审查清单一致；截图及浏览器交互覆盖目标，Context校验通过。未运行测试套件、未验证真实原生应用或安装发布。
