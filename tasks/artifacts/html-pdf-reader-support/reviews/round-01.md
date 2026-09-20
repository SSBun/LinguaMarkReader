# 独立审查记录

- 任务：html-pdf-reader-support
- 轮次：01
- 运行：ac089992-64f5-49d7-8792-21fa98bf3c18
- 快照：sha256:6a0edb188cdbb2520799ed55303e0767d0cda3f59522c2e1c64acf96a24a5f13
- 主会话核验：审查前已生成源码哈希清单；返回后逐项重算，无漂移。

---

## Review

**Review mode**：independent subagent（独立、只读审查）。

### 范围与快照

审查 HTML 净化与阅读集成、PDF 渲染及释放、文件类型与 IPC、原生选择器、CSP、资源打包及相关调用链；未将既有 JSON、搜索等无关改动归入本任务。

依据任务差异和当前源码，快照标识为 `sha256:6a0edb188cdbb2520799ed55303e0767d0cda3f59522c2e1c64acf96a24a5f13`，清单见 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/html-pdf-reader-support/evidence/snapshot.json"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/html-pdf-reader-support/evidence/snapshot.json)。

### Findings: none

No issues found.

- HTML 接入现有 DOMPurify 净化、受限资源读取及目录链接流程，没有新增绕过文件授权的读取接口。
- PDF 经原生层既有授权和 32 MiB 限制读取；渲染包含分页、缩放、错误提示，以及切换文档时取消渲染和销毁加载任务。
- 前后端文件类型、选择器扩展名与 PDF.js 本地资源路径相互对应；CSP 仍禁止远程图片、嵌入框架和表单提交。

未发现需要整改的已证实问题；本轮不新增 TR 编号。

### 未验证风险

1. **快照一致性**：工具不能计算哈希，未独立完成审查前后内容身份校验，也没有证据表明发生漂移。主会话仍须完成前后哈希检查；如果不一致，本报告不能用于验证当前 Target。
2. **原生端到端路径**：运行证据来自独立 WKWebView 加载构建后的前端资源，使用自定义协议处理器和模拟 IPC，**不是实际 Tauri 可执行程序内的端到端验证**。真实选择器、授权读取、Tauri 资源响应尚无运行证据；源码链路已检查。本轮不视为阻断 T1/T2，但不能宣称这些路径已实测。
3. Windows/Linux、复杂扫描 PDF、加密文件未覆盖；属于已披露边界，不阻断本次限定 Target。

### 本人检查与作者证据

- **本人执行**：只读检查任务差异、关键源码、相关搜索与导航调用链、配置、资源打包及说明；未运行测试、构建或命令，未修改文件。
- **作者证据**：阅读任务 Result、[运行日志](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/html-pdf-reader-support/evidence/runtime.log)及对应 smoke 源码。日志支持 HTML 净化、两页 PDF 非空画布、翻页、缩放、文本提取、损坏文件提示和快速切换观察。
- 类型检查、前后端构建及差异检查通过仅由任务记录提供，本人未重跑，也未取得独立命令输出。简单 PDF 样例不证明所有字体、图像编码或扫描文档兼容性。

以上为审查反馈，不授予合并或任务完成授权。