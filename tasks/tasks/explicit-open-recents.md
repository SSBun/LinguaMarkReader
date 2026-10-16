# 最近打开仅记录用户显式打开的入口

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 19:55) |
| Artifacts | [Artifacts](../artifacts/explicit-open-recents/) |
| Kind | Task |

## Scope

导入文件、导入目录及系统外部打开成功时记录入口；侧栏、链接、前进后退、刷新、恢复会话和应用内收藏／最近跳转不新增或重排。保留旧记录，不清空、不推断来源，不改收藏或真实打开能力。

## Plan

1. 将最近记录从当前文档更新中分离，仅在显式打开成功的入口记录。
2. 核对成功、失败、取消及被新导航取代的结果，验证首页和快捷打开使用同一数据。
3. 类型检查、构建、浏览器模拟原生调用核对；不运行测试套件，完成风险分级与审查。

## Task Summary

**阅读器打开流程**：[src](../../src/) 将最近记录从当前项目更新中移除，新增显式外部打开入口，仅导入和系统调用在成功完成打开后记录规范路径；原生打开函数返回成功项目，失败及过期导航不记录。保留内部导航和旧数据。

## Target
- [x] T1: 最近打开仅记录用户通过导入文件、导入目录或系统外部调用显式打开的文件与目录；内部浏览跳转不新增或重排记录。
- [x] T2: 首页与快捷打开浮层使用一致的最近记录语义，收藏及文件打开功能保持不变。

## Result

- T1: Chrome真实DOM与模拟原生接口：导入目录/文件、系统事件成功时记录；侧栏/链接/前进后退/列表/恢复/刷新均不改最近；失败、取消和慢读取被淘汰均不记录。见 ../artifacts/explicit-open-recents/evidence/observations.md。
- T2: 源码首页与快捷打开仍共用viewerRecents；模拟浏览器验证旧记录和收藏未清除，内部打开实际read_file成功但不重排。类型检查、前端构建、diff检查通过；原生环境未验证、未运行测试。
- Review gate: Passed — 独立审查 e7c7551b-e841-4188-979b-67c8e4b74040 无问题；报告 ../artifacts/explicit-open-recents/reviews/round-01.md；主会话已核验清单及全部文件哈希，解除快照身份待核验。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 改变异步导航成功结果与持久化边界，涉及系统打开和会话恢复竞争，需要独立核对。
- Snapshot: sha256:f376b4658df72d4c928c8ae2bda4594ec870b85f30e8616e499143d2a40150c1 (tasks/artifacts/explicit-open-recents/evidence/snapshot.json)
- Evidence: ../artifacts/explicit-open-recents/evidence/observations.md：来源区分及失败/取消/过期/恢复均经浏览器模拟核对。
- Task fingerprint: 3f8a51a6f45adbb8b533e8739782572b58833697795d42c66c4cf1a1c15e7260

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/explicit-open-recents/reviews/round-01.md) | sha256:f376b4658df72d4c928c8ae2bda4594ec870b85f30e8616e499143d2a40150c1 | no blocking findings；主会话核验快照后确认 |

## Verification

- Passed: 审查后check/build/diff检查通过，全部源码及证据散列匹配审查版本；浏览器模拟覆盖显式、内部、失败、取消、过期、恢复和刷新来源。未运行测试套件，未验证macOS原生环境。
