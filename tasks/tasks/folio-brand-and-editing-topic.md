# 更名为 Folio 并建立编辑功能维护主题

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 17:10) |
| Kind | Queue |

## Target
- [x] T1: 项目的产品名称统一为 Folio。
- [x] T2: 建立 Folio 编辑功能的持久 Topic，记录编辑正文及保存回原文件的目标，区分已明确要求与待定设计；本次不实现编辑功能。

## Scope

- 统一应用展示、打包名称与当前文档，建立编辑功能 Topic；不实现编辑、不发布、不更改远程仓库或本地目录，保留用户数据及更新兼容身份。

## Plan

1. rename-product-folio：完成品牌更名并核验兼容边界。
2. create-folio-editing-topic：建立共享编辑规格并关联已有任务。

## Task Summary

本父任务仅协调两个子任务并验证集成结果，没有额外代码或组件改动。

## Children

1. [统一 Folio 产品品牌并保留兼容身份](rename-product-folio.md)
2. [建立 Folio 编辑功能共享规格](create-folio-editing-topic.md)

## Result

- T1: 更名子任务完成且独立审查无阻断；集成阶段重新核对六文件 SHA256 均一致。保留身份、存储与更新端点，未发布。
- T2: Topic folio-editing 已创建，目标与待定设计分离，关联已有编辑任务；两个 Topic 文件哈希与子任务验收一致，未实现编辑。
- Review gate: Skipped — R0 协调任务，无父任务额外改动。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R0
- State: Current
- Reason: 父任务仅协调，无额外交付文件变更；两个子任务分别完成审查门。
- Snapshot: rename-product-folio/evidence/snapshot.sha256 + Topic sha256:daadbd7ca888be8c17f846df77675fa44df856f1250f06401af58454b160ec3f
- Evidence: 父任务 Result T1/T2，两个子任务 Completed，next 返回无剩余任务。
- Task fingerprint: 97431837f4beec197057002aa2a5c53271c4d051455ceb15b81f0f2a3e48fa9b

## Verification

- Passed: 集成哈希一致、diff 检查通过、Context 验证通过；产品品牌与 Topic 统一 Folio，边界未扩张。
