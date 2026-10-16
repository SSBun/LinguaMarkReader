# 统一 Folio 产品品牌并保留兼容身份

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 17:08) |
| Artifacts | [Artifacts](../artifacts/rename-product-folio/) |
| Kind | Task |
| Parent | folio-brand-and-editing-topic |

## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/rename-product-folio/reviews/round-01.md) | tasks/artifacts/rename-product-folio/evidence/snapshot.sha256 | no blocking findings |

## Scope

- 修改显示名称和更新归档名称；不改变应用标识、存储键、更新端点、公钥、密钥位置、内部包名、历史发布或项目目录。

## Task Summary

**前端品牌**：[界面](../../src/)及[页面入口](../../public/)改为 Folio。

**原生应用配置**：[原生层](../../src-tauri/)的产品名与窗口标题改为 Folio，保留兼容身份。

**更新归档**：[构建脚本](../../scripts/)产物命名改为 Folio，下载清单继续使用原仓库。

**产品说明**：[README](../../README.md)使用新品牌并说明未发布与兼容边界。

## Target
- [x] T1: 应用展示名称、打包名称及当前产品文档统一为 Folio。
- [x] T2: 保留现有用户数据与更新兼容身份，不改远程仓库或本地目录，不发布版本。

## Result

- T1: 六个产品文件已更名；npm run check、npm run build、node --check scripts/build-update.mjs、git diff --check 通过。未运行测试、原生打包或安装。
- T2: 与 HEAD 的确定性比较确认配置仅 productName 改变，platform/settings/Cargo/package 未变，更新脚本仅归档名改变；未发布。此为源码兼容边界验证，未实测旧安装更新。
- Review gate: Passed — 独立运行 89d0ec70-e0b9-4469-ba8d-66e43d812bf1，无阻断项；round-01 报告已保存，主 Agent 复算六文件 SHA256 全部一致。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 产品更名涉及应用打包与更新兼容边界，需要独立核查遗漏。
- Snapshot: tasks/artifacts/rename-product-folio/evidence/snapshot.sha256
- Evidence: Result T1/T2；六文件 SHA256 清单，类型检查及前端构建通过。
- Task fingerprint: 208a162af97bbf0ec93690252e171b81c479a05c09e0b2f15debaf692d94e221

## Verification

- Passed: 审查后六文件 SHA256 和 git diff --check 通过；类型检查及前端构建证据仍对应相同内容；原生升级验证留待发行，不宣称已验证。
