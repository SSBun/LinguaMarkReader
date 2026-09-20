# 原生 macOS 观察记录

## 构建与运行身份

- 命令：`npm run tauri -- build --debug --no-bundle --config '{"identifier":"com.linguamark.reader.search-preview"}'`。
- Tauri 原生构建成功，自动执行前端构建。只覆盖应用 identifier 以隔离预览授权存储，未更改源码、产品名或前端内容。
- 为避免与用户既有同名应用的辅助功能引用混淆，将生成的可执行文件复制为 `/tmp/linguamark-search-preview-native`，运行 PID 61381。该实例已在观察后停止，未停止用户原有实例。
- 交付源码身份、二进制 SHA256 见 [snapshot-02.json](snapshot-02.json)。本记录不是单元测试或测试套件结果。

## 真实原生入口

通过 macOS System Events 聚焦预览进程，使用 Cmd+O 打开系统选择器，通过“前往文件夹”输入本任务 `native-preview.md` / `native-preview.json` 的完整路径，再按原生“导入”按钮。读取经过真实 Tauri IPC、Rust 文件授权与文件读取，未模拟 IPC。

## Markdown

- 按 Cmd+F 后直接键入 `SEARCH_NEEDLE`，搜索框获得焦点并显示关键词。
- 首个实例的窗口截图 [native-markdown-01.png](native-markdown-01.png) 显示 `1 / 3`、首项高亮、尚未展开的第三项及原文链接。
- 独立命名实例的 AX 记录 [native-markdown-02.txt](native-markdown-02.txt) 返回 `SEARCH_NEEDLE, true`，即输入值正确、AXFocused 为 true；该记录后续空字段来自对计数组 description 的读取，不作为计数证据。
- 同一实例连续按 Enter 两次，[native-markdown-02.png](native-markdown-02.png) 显示 `3 / 3`，原来折叠的段落展开，第三项带当前项边框。
- 按 Esc 后，[native-markdown-closed.png](native-markdown-closed.png) 显示搜索栏关闭、高亮清理、段落重新折叠；原文 `mark[data-document-search]` 中链接仍存在。

## JSON

- 原生导入 `native-preview.json` 后按 Cmd+F 并输入关键词，AX 记录 [native-json-01.txt](native-json-01.txt) 返回：`SEARCH_NEEDLE, true, 1 / 2, 2 / 2`。
- 输入框获得焦点；初始定位第一项，Enter 后定位第二项。
- [native-json-01.png](native-json-01.png) 显示 `2 / 2`，深层对象展开并定位其匹配内容；[native-json-closed.png](native-json-closed.png) 显示 Esc 后搜索栏和搜索高亮消失，深层节点恢复折叠。

## 其他证据与限制

- [browser-observations-03.json](browser-observations-03.json) 补充原文 mark、链接、图片、粗体节点身份及链接事件保留的浏览器观察，并用布尔值确认 Markdown details 的展开与还原。
- 本次为本机 macOS WebView 观察，没有 Windows/Linux 实机或大文档性能验证。
