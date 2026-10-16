# 移除阅读页面容器的焦点边框

| Field | Value |
| --- | --- |
| Status | Completed (2026-10-15 19:59) |
| Kind | Task |

## Task Summary

**阅读器样式**：[public](../../public/) 将阅读容器 focus-visible 的整页轮廓改为 none，不改变 tabindex、焦点恢复逻辑或交互控件的焦点样式。

## Target
- [x] T1: 阅读页面容器获得焦点时不显示整页选中边框，保留阅读键盘操作及真正交互控件的焦点提示。

## Result

- T1: 实际构建在独立Chrome：打开快捷面板再Esc，阅读容器focused=true、focus-visible=true、outline-style=none、tabIndex=0；首页按钮focus-visible仍为solid 2px。check/build/diff检查通过；未运行测试套件或原生WebKit验证。
- Review gate: Skipped — R1局部样式修正，浏览器已验证目标与交互控件提示保留，无独立审查义务。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 仅将现有阅读容器focus-visible样式从2px边框改为none，移除无效offset。
- Snapshot: public/markdown.css sha256:e0f4f00e205b6018fa08533a4f2a8d2e0a48419e2580edd8e31ff2bc9594171c；任务差异仅.linguamark-markdown-content:focus-visible声明，其他脏改动非本任务
- Evidence: Chrome实际构建检查：焦点恢复且轮廓none，按钮轮廓solid；类型检查、构建与diff检查通过。
- Result clarity: 用户明确移除整页选中边框，样式选择器与截图容器一致。
- Bounded impact: 仅一个阅读容器的视觉伪类，不涉及打开/存储/键盘逻辑。
- Low risk: 可逆的局部CSS，保留tabindex和全部控件焦点提示。
- Sufficient verification: 真实DOM快捷打开关闭后焦点仍在正文，outline none；按钮focus-visible solid 2px；check/build通过。
- Task fingerprint: 35d865703c3fe3598c70fad1316abfc0dc76d4dffa824da6696935980ab531d7

## Verification

- Passed: 实际构建DOM轮廓none且焦点/tabIndex保留、按钮轮廓solid；类型检查、构建、diff检查通过；CSS哈希e0f4f00e205b6018fa08533a4f2a8d2e0a48419e2580edd8e31ff2bc9594171c匹配。未运行测试或原生应用验证。
