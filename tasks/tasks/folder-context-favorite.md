# 文件夹右键菜单支持收藏

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-18 17:50) |
| Artifacts | [Artifacts](../artifacts/folder-context-favorite/) |
| Kind | Task |

## Scope

根目录标题与子文件夹使用现有收藏机制；不改变文件菜单及目录展开、折叠行为。保留任务开始前已有修改。

## Plan

1. 将根目录标题接入文件树右键菜单，并让目录菜单复用现有收藏操作。
2. 验证根目录、子目录、空目录收藏与取消收藏，以及文件菜单和目录展开、折叠保持原行为。
3. 执行类型检查、构建与非测试交互观察，按实际风险完成验证。

## Target
- [x] T1: 文件树根目录标题及子文件夹的右键菜单提供 Add to Favorite，可将对应目录加入收藏。

## Result

- T1: npm run check、npm run build、git diff --check 通过。Chrome 右键观察根标题/子目录/空目录的 Add to Favorite，实际localStorage保存kind=directory及正确绝对路径，刷新仍保留且收藏点击调用read_directory正确路径；已收藏可移除并再次添加，收藏未切换正文或展开目录。文件菜单仍为原三项，Expand/Collapse Subtree保持全部子树状态。详见 evidence/browser-observations.json。未运行单元测试，IPC采用样例模拟，未另做原生右键实机验证。
- Review gate: Skipped — 当前R1四项依据充分：单一现有菜单入口与ViewerItem类型分支，复用现有收藏/导航/错误处理，浏览器直接验证全部目标与保留行为；没有独立审查义务。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 仅将目录标题纳入现有contextmenu事件范围，并让已有收藏动作按文件/目录生成ViewerItem；无新增存储或授权逻辑。
- Snapshot: sha256:29304082a430c47377e0d274973d48fb29cca6a83a97c802ac4d41791a8f6528
- Evidence: evidence/scope.diff、snapshot.json、browser-observations.json；Result T1与类型检查/构建。
- Result clarity: 目标是根目录及子目录菜单可收藏；浏览器直接观察对应标签、正确路径和directory类型。
- Bounded impact: 改动限main.ts两个现有函数；复用toggleViewerFavorite和openViewerItem，文件菜单、正文以及子树控制已有对照观察。
- Low risk: 只新增本地收藏入口，不读写源文件、不改变Rust权限或存储格式，收藏操作可取消，已有错误回滚保持不变。
- Sufficient verification: 类型检查、构建、diff检查通过，非测试浏览器检查根/子/空目录、保存后刷新、收藏重开、取消及文件菜单/子树回归；真实localStorage生效。未实机复查原生右键菜单，事件映射无平台专属新增代码。
- Task fingerprint: 34c5dca7a993f8c73efd69b2af51d2db4b74acf49ec886276e0df99453a95b99

## Verification

- Passed: 最终类型检查、git diff --check通过，src/main.ts SHA256与当前评估快照一致，构建与浏览器观察均绑定此内容。根/子/空目录收藏及取消、刷新保留、重新打开、文件菜单及子树控制已验证；未运行单元测试，未本轮实机复查原生右键。
