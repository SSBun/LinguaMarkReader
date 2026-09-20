# 修复文件树选中类型标签对比度

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 16:10) |
| Artifacts | [Artifacts](../artifacts/selected-file-badge-contrast/) |
| Kind | Task |

## Target
- [x] T1: 文件树选中状态的文件类型标签文字清晰可辨，且不改变正文样式。

## Result

- T1: WKWebView复现selected+focus-visible的浅底白字；修复后MD/JSON/HTML/PDF/IMG/FILE标签均使用rgb(47,90,64)实色背景和rgb(250,247,239)文字，对比度7.38:1，非选中及正文计算样式不变，已查看after.png。仅修改一行选中标签背景；npm run check/build及范围diff检查通过，未运行测试。
- Review gate: Skipped — R1四项均有证据且无独立审查义务，单行CSS在WebKit中完成前后验证。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 仅文件树选中标签背景一行CSS修复，恢复与已有浅色文字匹配的实色底。
- Snapshot: public/markdown.css sha256:fc79b0249fd6815fd6861894411b3ea45c6eaf11376c6d9ea506dfe5efc00148
- Evidence: tasks/artifacts/selected-file-badge-contrast/evidence/before.log、after.log、after.png、scope.diff。
- Result clarity: 六种标签的selected/focus-visible计算颜色明确，对比度7.38:1。
- Bounded impact: 限定is-active下的badge，不影响行背景或正文；差异仅一行。
- Low risk: 纯视觉且可回滚，无授权/读写/运行逻辑变化。
- Sufficient verification: WebKit前后复现、六种类型计算样式、截图目视、类型检查与前端构建成功。
- Task fingerprint: 3b4335522284416fb06859ff2dbdc58f00959c31b6a313729e20174285b32e1b

## Verification

- Passed: 最终CSS身份fc79b024...与运行检查一致，scope.diff只含背景一行，正文/普通标签未变；日志与截图存在，类型检查和构建成功。
