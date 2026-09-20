## Project Core

### Purpose
- 独立的本地只读文档阅读器，支持 Markdown、JSON、HTML 与 PDF。

### Global Vocabulary
- 文件树展示已授权目录；文章目录展示当前文档的标题结构。

### System Map
- TypeScript 前端负责阅读界面与渲染。
- Tauri/Rust 原生层负责文件选择、读取与目录授权。

### Global Invariants
- 文件访问受用户通过原生选择器或 macOS 系统打开操作授予的范围限制；系统打开只授权所选 Markdown 文件。
- 阅读器不提供文件编辑或删除能力。

## CTX-document-formats — 文档格式与安全渲染
- Scope: HTML、PDF 及现有文档格式的读取与阅读边界。
- Paths: `src/platform.ts`, `src/main.ts`, `src/pdf.ts`, `src-tauri/src/main.rs`, `scripts/build.mjs`, `src-tauri/tauri.conf.json`
- Keywords: HTML, HTM, PDF, PDF.js, 授权, 静态渲染, WebKit
- Authority: `src/platform.ts`, `src/main.ts`, `src/pdf.ts`, `src-tauri/src/main.rs`, `scripts/build.mjs`, `src-tauri/tauri.conf.json`
- Recheck: 修改文件类型、读取协议、PDF.js 依赖、资源打包或 CSP 时重新核对。

### Purpose and Boundaries
- 阅读器还支持 JSON、HTML/HTM 和 PDF；类型识别需同步前端、Rust 与原生选择器。
- HTML 沿用 DOMPurify 静态净化及正文作用域 CSS，不执行脚本；相对图片与文档必须通过已授权目录读取。
- PDF 经同一授权与大小检查后以 Base64 返回；固定工具栏与独立滚动区分离。纵向模式按需渲染视区附近页面并释放远处画布；横向模式只显示当前页，切模式保留页码但重新打开不持久恢复。任务在切换文档时销毁，扫描件不做 OCR。

### Structure
- PDF.js worker、CMap、字体、WASM 和 ICC 资源由构建脚本本地复制；CSP 允许本地资源连接、worker 与 WASM，但不开放远程资源。
- 当前页文本通过 ReadableStream reader 提取，避免部分 WebKit 不支持异步流迭代导致失败。
- PDF 滚动使用自身 viewport，而不是 Markdown/HTML 的外层 content；键盘阅读滚动需选择对应容器。模式、缩放和自动适配尺寸变化通过渲染代次取消过期任务，销毁时断开滚动/尺寸观察器。

## CTX-macos-file-opening — macOS 系统文件打开与本地应用
- Scope: macOS 应用包、Markdown 文件关联、系统打开事件及单文件授权。
- Paths: `src-tauri/src/main.rs`, `src-tauri/tauri.macos.conf.json`, `src-tauri/Info.plist`, `src-tauri/capabilities/main.json`, `src/main.ts`, `package.json`
- Keywords: Finder, Markdown, Opened, PendingOpen, 默认打开, macOS, 应用包
- Authority: `src-tauri/src/main.rs`, `src/main.ts`, `src-tauri/tauri.macos.conf.json`, `src-tauri/Info.plist`, `README.md`
- Recheck: 修改应用启动、系统文件打开、授权入口、macOS bundle 配置或发布渠道时复核。

### Structure
- macOS 的 Opened 可能早于 setup。Builder 预先管理 PendingOpen，只保存原生 URL；前端先订阅再领取，领取命令在 setup 后校验并授权单个 Markdown 文件，避免早期访问 Access 崩溃。
- 系统打开优先于会话恢复，前端串行领取并使用导航序号防止恢复覆盖明确打开的文档。
- 本地 build:mac 使用 Tauri 应用打包，声明 md/markdown 的 Viewer/Alternate 与导入的 Markdown UTI；关联声明不等于修改本机默认应用。
- 本地应用使用 ad-hoc 签名，不代表 Developer ID 签名或 Apple 公证；GitHub 源码发布与本机应用安装是不同操作。
