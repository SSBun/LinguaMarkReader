# 文档内容搜索：第 01 轮审查

## 主 Agent 元数据

- 任务：document-content-search
- 模式：fresh 只读 reviewer
- Run：e7f90f7f-3c67-4dee-9b3e-c026cb7b5112
- 快照：sha256:2b1e813a582d659b9624132762c55a2ab3cc8f95b71c9d2942f7cb417a66cda6
- 以下为 Reviewer 原始反馈。

---

## 审查模式与范围

Review mode: independent subagent。本轮为一次 fresh、只读审查；未修改文件、运行测试、委派或变更任务状态。

对照原始要求、已接受的 Target，审查本任务五个交付文件及必要调用链；排除既有 JSON、侧栏和图标改动。增量依据为 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/document-content-search/evidence/scope-01.diff"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/document-content-search/evidence/scope-01.diff)。

声明快照：`sha256:2b1e813a582d659b9624132762c55a2ab3cc8f95b71c9d2942f7cb417a66cda6`。

## Findings

### TR-1 — Concern / P1：清理搜索高亮会误删文档原有元素及其交互

- **位置**：[ "/Users/caishilin/Desktop/personal/LinguaMarkReader/src/search.ts"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/src/search.ts) 第7、48–51、81、178行。
- **问题**：`clearMarks()` 按文档内的 `mark[data-document-search]` 选择全部元素，而非仅清理搜索功能实际创建的节点，并以纯文本替换整个子树。
- **证据**：Markdown 允许原始 HTML；净化配置及后续安全处理未移除该属性，见 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/src/main.ts"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/src/main.ts) 第89–90、175–183、234–254行。已安装 DOMPurify 默认保留 `data-*`，见 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/node_modules/dompurify/dist/purify.es.mjs"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/node_modules/dompurify/dist/purify.es.mjs) 第827、2009行。
- **可复现输入**：Markdown 包含 `<mark data-document-search><a href="https://example.com">链接</a></mark>`。根据上述执行路径，仅按下 ⌘F、尚未输入关键词，首次 `search()` 就会将整段替换为“链接”文本，删除链接元素。此为源码推导，未运行浏览器复现。
- **影响**：合法正文的链接、图片或嵌套格式可被搜索操作破坏；关闭搜索不会恢复。源文件未被写入，但违反保留正文 DOM 交互的要求。
- **建议**：按节点身份维护本功能创建的高亮集合，仅清理这些节点；不要把文档可自行携带的属性当作节点所有权凭证。

该确认问题需要主 Agent 修复。

## 未验证风险

1. **原生快捷键链路缺证，阻断 T1 的最终验证**：作者证据来自模拟 Tauri IPC 的 Chrome，不能证明目标 macOS WebView 中 ⌘F 的实际分发、输入聚焦及定位。建议主 Agent 在原生应用完成一次 Markdown、JSON 快捷键冒烟观察；不需要运行测试套件。
2. **快照身份仍需主 Agent 最终核对**：审查前后读取的快照记录一致，抽查源码未见可见漂移；工具不支持重算哈希，不能独立证明五个文件仍对应声明快照。完成前须核对实际内容身份；本轮未观察到漂移。
3. 图片、SVG、数学公式明确不参与匹配；披露不等于用户接受范围缩减。本轮未将其直接判定为新增缺陷，也未验证这类文档的搜索体验；不能据此声称覆盖全部可见内容。

## 本人检查

- 静态核对字面量匹配、跨文本节点高亮、清理、快捷键、IME、焦点恢复、文档替换及 MutationObserver。
- 核对 JSON 延迟内容准备、祖先折叠展开及关闭恢复路径。
- 核对正文净化和链接消费者，发现 TR-1。
- 未运行命令、类型检查、构建、浏览器操作或测试。

## 查阅作者证据

源码检查后查阅任务 Result 及：

- ["/Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/document-content-search/evidence/browser-observations-01.json"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/document-content-search/evidence/browser-observations-01.json)
- ["/Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/document-content-search/evidence/browser-observations-02.json"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/document-content-search/evidence/browser-observations-02.json)

记录支持常规匹配、导航、JSON 深层内容及 IME 等观察，但未覆盖 TR-1。首份记录中 Markdown 折叠观察为空字符串、关闭后 `detailsOpen` 为 `null`，不能单独证明 Markdown 折叠恢复成功。类型检查、构建及 diff 检查通过属于作者报告，非本人重跑结果。

## 覆盖限制

未审计无关改动；未验证原生 WebView、其他平台、超大文档性能。上述结论为反馈，不授予完成或合并授权。