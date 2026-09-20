# 支持 HTML 与 PDF 文件阅读

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 10:27) |
| Artifacts | [Artifacts](../artifacts/html-pdf-reader-support/) |
| Kind | Task |

## Plan

1. 扩展文件识别、原生选择器及授权后的内容读取，支持 HTML/HTM 与 PDF。
2. 将 HTML 接入现有静态内容安全净化与目录资源读取；采用本地打包的 PDF.js 实现 PDF 分页、缩放及资源释放。
3. 执行类型检查、前后端构建及可用的渲染检查，不运行测试套件；完成独立只读审查。
4. 修正用户截图中的 PDF 页码输入与缩放控件配色，核对普通、聚焦、禁用状态及 PDF 页面颜色，再进行当前快照审查。

## Target
- [x] T1: 阅读器可以打开并阅读 HTML 文件。
- [x] T2: 阅读器可以打开并阅读 PDF 文件。
- [x] T3: PDF 工具栏页码输入框与缩放选择框的配色与阅读器主题协调，文字及控件标识清晰可辨，不改变 PDF 页面本身的颜色。

## Result

- T1: 配色修复后再次运行实际构建资源的 WKWebView smoke，HTML 标题/目录正常，脚本及 iframe/事件被净化，外部图片被 CSP 阻断；见 ../artifacts/html-pdf-reader-support/evidence/colors-after.log。IPC 为模拟数据，未实测 Tauri 原生端到端，未运行测试。
- T2: 配色修复后重复 PDF 两页、翻页、200% 缩放、文本提取、错误与切换检查成功；画布尺寸与 7092 深色像素不变。npm run check、npm run build、npm run build:desktop 均成功。见 ../artifacts/html-pdf-reader-support/evidence/colors-after.log，其他平台/复杂扫描/密码文件未实测。
- T3: WKWebView 修复前复现深底深字（对比度 1.38:1），修复后 input/select 前景 rgb(44,58,50) 背景 rgb(250,247,239)，对比度 8.61:1；绿色边框及聚焦实线与背景对比 3.65:1。禁用态使用灰绿字浅底不透明，原生箭头固定浅色方案。已查看 colors-after.png；colors-before/after.log 记录计算样式，colors.diff 仅改 PDF 控件 CSS，PDF 画布不变。
- Review gate: Passed — 独立只读审查 3cf3e035-bc99-423f-81cc-e5abe5987fc1 无阻断发现；报告 round-02.md 已保存并索引，主会话重算 snapshot-02.json 与全部源码哈希一致。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R2
- State: Current
- Reason: 原 HTML/PDF 集成任务重开后的配色修正，保留已有 R2 独立审查义务；本次增量仅 PDF 控件 CSS。
- Snapshot: sha256:6d74c30f6c0665395db808f9e7a46f9c89473a3e159f3f93eb595c7d2eaa716a (tasks/artifacts/html-pdf-reader-support/evidence/snapshot-02.json)
- Evidence: 当前 T1/T2/T3 Result；colors-before.log、colors-after.log、colors-after.png；类型检查、前端及桌面构建成功。
- Task fingerprint: 5225b705dc19d5f881b6bf6a61fefad03fa2c17abdde45c09f9af365d7c27687
## Review Reports

| Round | Report | Snapshot | Outcome |
| --- | --- | --- | --- |
| 01 | [第 01 轮](../artifacts/html-pdf-reader-support/reviews/round-01.md) | sha256:6a0edb188cdbb2520799ed55303e0767d0cda3f59522c2e1c64acf96a24a5f13 | no blocking findings；主会话已核验源码哈希无漂移 |
| 02 | [第 02 轮](../artifacts/html-pdf-reader-support/reviews/round-02.md) | sha256:6d74c30f6c0665395db808f9e7a46f9c89473a3e159f3f93eb595c7d2eaa716a | no blocking findings；配色修正审查，主会话重算哈希无漂移 |

## Verification

- Passed: 审查后 npm run check 与 git diff --check 成功，源码哈希与已通过构建、WKWebView 配色 smoke 的快照一致。截图已目视检查；PDF 画布样式/渲染源码未变。未运行测试套件，原生菜单展开/其他平台未实测。
