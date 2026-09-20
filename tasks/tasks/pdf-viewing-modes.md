# PDF 固定工具栏与双阅读模式

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 14:33) |
| Artifacts | [Artifacts](../artifacts/pdf-viewing-modes/) |
| Kind | Task |

## Target
- [x] T1: PDF 顶部工具栏在阅读页面时保持固定可见。
- [x] T2: PDF 支持纵向连续排列滚动，以及每次一页、点击左右箭头切页的横向模式，两者可切换。
- [x] T3: 保留页码跳转与缩放，不旋转页面，不改变 PDF 文档颜色或 HTML 阅读行为。

## Plan

1. 调整 PDF 阅读区结构，将固定工具栏与页面滚动容器分离。
2. 实现纵向按需渲染与横向单页切换，维护当前页、缩放、尺寸变化及异步资源释放。
3. 用 WebKit 运行检查覆盖固定位置、两种模式、切换/跳转/缩放和既有 HTML 行为，执行类型检查与构建，不运行测试套件。
4. 完成当前快照独立只读审查并记录验证边界。

## Result

- T1: TR-1修正后再次运行实际构建资源的 macOS WKWebView smoke；纵向5页与横向200%内部滚动300px后工具栏 top 仍为58px，fixed=true。见 ../artifacts/pdf-viewing-modes/evidence/runtime-02.log；IPC 模拟，非真实选择器端到端。
- T2: runtime-02.log 的12页混合尺寸样例再次通过纵向连续滚动（附近2–3张画布）、横向仅1页、左右箭头、页码同步、模式切换保页及快速切换。short-after.log 覆盖1107px阅读区、459px短页：跳5页、连续上一页到1、跳12页、上一页11、切换横/纵仍11，均与预期一致。
- T3: 修正后 runtime-02.log 确認200%缩放、窗口变化/展开文本的自动适配、HTML净化与切回HTML均正常；short-before.log 复现TR-1，short-after.log 同场景通过显式跳页与手动首尾。未改PDF旋转或颜色。npm run check/build/build:desktop 与 git diff --check 成功（build-02.log）；未运行测试套件，其他平台/复杂PDF/超大页数未实测。
- Review gate: Passed — fresh只读审查39a5856b-9f0f-4544-886a-034290189074确认TR-1 resolved且无新增阻断发现，round-02.md已保存并索引；主会话重算清单及全部源码哈希一致。
## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/pdf-viewing-modes/reviews/round-01.md) | sha256:48d984a46341c0716fa7317b6f8757d1b4cb687dca2d2cf6abdfd4baa9710ffc | findings: TR-1 |
| 02 | [第 02 轮](../artifacts/pdf-viewing-modes/reviews/round-02.md) | sha256:7286f4bde6351eeee777e78271167569d63d983fb232370e42fc12917ece6108 | no blocking findings；TR-1 resolved，主会话已核验哈希 |

## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 异步多页渲染及导航修复后保持R2，需核对TR-1修复与新增回归。
- Snapshot: sha256:7286f4bde6351eeee777e78271167569d63d983fb232370e42fc12917ece6108 (tasks/artifacts/pdf-viewing-modes/evidence/snapshot-02.json)
- Evidence: T1/T2/T3当前Result；runtime-02.log、short-before/after.log、build-02.log、task-02.diff、tr1.diff。
- Task fingerprint: 38d35d35c23cc1f97a5640fea4d6f2e47ca8173008fa8e48d3a95fccd68d2126

## Verification

- Passed: 审查后npm run check、git diff --check与Context验证成功；源码身份与已通过的runtime-02/short-after运行检查和build-02桌面构建一致，报告与链接已核验。未运行测试套件；IPC模拟、其他平台及复杂PDF未实测。
