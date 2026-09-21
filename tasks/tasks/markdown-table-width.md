# 修复 Markdown 表格超出阅读区宽度

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-21 11:02) |
| Kind | Task |

## Target
- [x] T1: Markdown 超宽表格仅在表格区域横向滚动，所有列均可完整访问，不撑宽页面且页面仍正常纵向滚动。

## Plan

1. 检查 Markdown 渲染与阅读区布局，局部隔离表格横向溢出。
2. 运行类型检查、构建及可用的浏览器布局检查，不运行单元测试或项目测试套件。

## Result

- T1: 修改前 Chromium 900px 视口下阅读区 clientWidth=890、scrollWidth=3157，复现整页横向溢出。修改后使用当前 createArticle 实际函数（内存打包仅移除应用启动调用）与完整 CSS 检查 420/900/1440px 视口，阅读区 scrollWidth 均等于 clientWidth；宽表容器可滚至末列，页面 scrollLeft=0、scrollTop=100；窄表无溢出、12 个表头保留、方向键可滚动；HTML 不新增容器。npm run check、npm run build、git diff --check 通过。未运行单元测试或项目测试套件，未在原生 WebKit 实机验证。
- Review gate: Skipped — R1 四项依据及当前双文件 SHA256 已核对，局部低风险展示修改有浏览器直接观测证据，无独立审查义务。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 局部 Markdown 表格展示修复，原生滚动容器隔离横向溢出。
- Snapshot: src/main.ts sha256:1e3e8df9e9a0bd4c2d27ede4acde20eee20f7b83fa81a30463b96b817d370743; public/markdown.css sha256:19ffa5779038f4f50cb1a5d63cddff1cc3264f79118b5525d9ca9f04c10baa10；两文件仅工作区未暂存修改
- Evidence: T1 Result 的改前复现、改后布局和键盘冒烟检查，以及类型检查、构建和 diff 检查。
- Result clarity: 确认目标为表格独立横向滚动、页面保持纵向滚动，观测对应宽度与 scrollLeft/scrollTop。
- Bounded impact: 仅 Markdown createArticle 分支包装 table，CSS 限定新增类；HTML、PDF、JSON 及读取授权不变。
- Low risk: 可逆的 DOM/CSS 展示修改，保留 table/th 语义、焦点和原生键盘滚动，不修改数据或权限。
- Sufficient verification: 三种视口、宽表/窄表、纵向滚动、键盘横向滚动和 HTML 边界通过 Chromium 检查；类型检查和构建通过；未验证原生 WebKit，未运行测试套件。
- Task fingerprint: 8c002493602203a1fb49c5a413ddc6db7e271b2f32b5f9b3fa6751ddf803fc82

## Verification

- Passed: 最终核对两文件内容与 assessment SHA256 一致，无后续交付改动；重新运行 npm run check 与 git diff --check 通过，T1 浏览器布局证据仍有效。未运行单元测试或项目测试套件，未验证原生 WebKit。
