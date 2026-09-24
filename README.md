# LinguaMark Reader · Tauri

独立的本地只读文档阅读器，支持 Markdown、JSON、HTML 和 PDF，基于 Tauri 2、TypeScript 和 Rust。项目包含自己的依赖锁、构建脚本、原生应用和静态资源，无需安装原 LinguaMark Chrome 扩展。

当前版本为 **0.4.1**。[GitHub Release](https://github.com/SSBun/LinguaMarkReader/releases/tag/v0.4.1) 提供 Apple Silicon（arm64）应用归档、更新签名和清单。首次安装请解压应用归档后将应用放入“应用程序”；旧版 v0.3.0 没有更新能力，需要先手动安装。应用采用 ad-hoc 签名，未经 Apple 公证，macOS 可能阻止首次打开；它不是 Developer ID 分发包。

## 运行

需要 Node.js 22+、npm、Rust stable，以及 Tauri 对应平台的系统工具链。macOS 需要 Xcode Command Line Tools。本机验证平台为 macOS；Windows/Linux 尚未验证。

在本目录执行：

```sh
npm ci
npm run check
npm run dev
```

开发启动前自动生成静态前端；修改前端后重新启动开发命令即可，不提供热更新服务器。

```sh
# 仅生成前端
npm run build

# 构建本地可执行程序，不生成安装包、不签名或发布
npm run build:desktop

# macOS 本地应用包（ad-hoc 签名，不公证、不安装）
npm run build:mac

# 原生静态检查（先构建前端）
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

macOS 应用包生成在 `src-tauri/target/release/bundle/macos/LinguaMark Reader.app`。可复制到“应用程序”后使用；它声明支持 `.md` / `.markdown`，支持 Finder“打开方式”或设为默认应用后的双击打开。应用冷启动和已运行时均接收文件，优先显示系统明确打开的文档；一次打开多个文档时，单窗口显示最后一个。此本地包仅作 ad-hoc 签名，未获 Apple 公证，不属于 Developer ID 分发安装包。

## 阅读能力

- 打开 UTF-8 Markdown、JSON、HTML（`.html` / `.htm`）与 PDF，或选择整个阅读目录。
- HTML 以静态阅读模式渲染正文、标题目录和表格；不执行脚本、不加载外部样式表，目录授权后的相对图片及文档链接可用。不会完整复现依赖 JavaScript 的网页。
- PDF 使用随应用打包的 PDF.js 离线渲染。工具栏固定在阅读区顶部，页面在独立区域滚动；支持左右箭头翻页、输入页码、缩放和阅读模式切换。
- PDF 默认纵向连续滚动，页码随滚动更新，仅保留可见范围附近的页面画布。横向模式每次只显示一页，点击左/右箭头切页；自动缩放在纵向模式适合宽度、横向模式适合整页，不旋转原文。两种模式切换保留当前页，放大后可在单页内部滚动。
- 展开 PDF“当前页文本”可复制、搜索可提取的文本；扫描页仍显示页面，但不提供 OCR。需要密码的 PDF 请先解锁。重新打开或重启后从第一页、纵向默认模式开始，不持久保存 PDF 页码、模式或缩放。
- JSON 只读格式化、语法高亮、对象和数组折叠展开；保留原始数值及重复键，无效 JSON 显示提示和原文。
- `⌘F`（Windows/Linux 为 `Ctrl+F`）搜索当前 Markdown、JSON、HTML 正文或 PDF 当前页提取文本：忽略大小写、高亮匹配、显示位置；`Enter` / `Shift+Enter` 或箭头按钮切换匹配，`Esc` 关闭。JSON 折叠内容也参与搜索，定位时展开，关闭时还原搜索展开的节点；切换文档会关闭搜索。图片、SVG 图表及数学公式不参与文本匹配。
- Lightmind 风格正文、标题目录、可调整侧栏、固定/整屏阅读宽度、字词计数。
- 文件树、当前文件定位、目录展开/折叠、文件右键菜单。
- 代码高亮、任务列表、脚注、Alerts、KaTeX、Mermaid 与 ZenUML。
- 目录内相对 Markdown / HTML / JSON / PDF 链接、锚点、图片及独立图片预览。
- 文件/目录收藏、最近五项、应用重启后恢复上次文档和目录。
- macOS：工具栏只有一个“导入”按钮；点击或按 `⌘O`，可在同一个系统窗口选择 Markdown、JSON、HTML、PDF 文件或目录，随后自动打开正文或文件树。取消不会替换当前阅读内容。`⌘⇧O` 仍可直接选择目录。
- Windows/Linux 暂保留原文件选择器（导入按钮或 `Ctrl+O`），目录使用 `Ctrl+Shift+O`；这些平台尚未提供同窗混合选择，亦未实机验证。
- 侧栏显隐与内容模式使用独立图标入口；点击内容模式按钮直接在文件树和文章目录之间切换，不弹出菜单；只有一种内容可用时禁用切换按钮。按 `⌘R` 重新读取当前打开文件的最新内容，不刷新整个应用窗口。
- 固定 58 px 高度的工具栏：左侧为侧栏与文件入口，中间为文档名，右侧为阅读宽度、收藏、收藏列表与设置。按钮使用统一的定宽图标，不随窗口宽度换行；长文档名省略展示，悬停可查看完整路径。
- 窗口外层不参与滚动或回弹，正文使用工具栏下方的独立滚动区域，侧栏也保持独立。阅读位置保存/恢复和目录跳转基于正文区域；聚焦正文或工具栏时可用 PageUp/PageDown、Home/End 阅读，设置和收藏模态窗口打开时锁住正文滚动。

单文件模式只授权该文件，不能读取相邻图片或文档。需要相对资源时，请在“导入”中选择所在目录，或使用目录快捷键明确授权其目录。收藏或路径失效时，请重新选择对应文件或目录。

## 设置

通过工具栏“设置”或 `⌘,`（其他平台为 `Ctrl+,`）打开应用内设置页：

- **Basic（基础）**：主题默认/系统无衬线/衬线字体、14–28 px 正文字号、1.40–2.40 倍正文行距、默认阅读宽度、启动时恢复上次阅读、重载动画。
- **About（关于）**：应用名称、版本与简介；名称和版本由构建时读取的 Tauri 配置提供。可手动检查更新，查看版本说明并确认下载、安装与重启。检查、下载或安装失败可重试；安装成功但重启失败时只重试重启，不会重复安装。

显示偏好即时生效且在重启后保留，字号和行距不改变工具栏；公式和图表保留自身的专用字体与排版规则。宽度与工具栏开关双向同步；动画开关仅保留在 Basic 设置中。设置自动保存，写入失败时保留之前的配置并显示错误。

启动恢复开关下次启动生效，关闭后显示空白阅读器，但不会删除收藏、最近浏览或已有文件授权。开启时恢复上次文档、目录和阅读滚动位置；重载动画控制恢复时是否平滑滚动，系统“减少动态效果”优先。恢复期间主动操作会取消待执行的自动滚动，避免抢夺阅读位置。

设置标签支持左右方向键、Home/End 切换，Escape 关闭。字体仅使用本机安装字体及系统回退，不下载字体。

## 应用内更新与发布

应用已接入官方 Tauri Updater，不在启动时自动联网检查。更新说明只按纯文本展示，网络请求由原生插件完成，不放宽正文的 CSP 或文件授权范围。关闭设置页不取消已经确认的下载和安装；再次打开关于页可查看进度。

**已配置真实更新公钥和 GitHub Releases 更新清单地址**。检查失败会显示错误，不会误报“已是最新版本”。客户端要求归档签名及其签名版本与清单一致，不接受缺少版本信息的旧格式签名。当前发布产物只支持 Apple Silicon（arm64）。

### 密钥维护

1. 本机更新私钥已在仓库外生成，位于 ["/Users/caishilin/.config/LinguaMarkReader/updater.key"](file:///Users/caishilin/.config/LinguaMarkReader/updater.key)。目录权限为 `700`、私钥权限为 `600`；当前密钥未设置额外密码，依赖本机文件权限保护。请将它备份到受保护的位置，不要提交、上传或在日志中输出私钥。
2. 真实公钥已写入 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/tauri.conf.json"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/tauri.conf.json) 的 `plugins.updater.pubkey`。公钥可提交；更换构建机器时恢复原私钥，**不要重新生成密钥覆盖已有更新身份**。私钥丢失后，不能简单换公钥继续向旧客户端推送更新。
3. 构建命令默认从当前用户主目录下的约定位置加载私钥；也可通过 `TAURI_SIGNING_PRIVATE_KEY` 指定密钥内容或文件路径。加密密钥须另设 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`，未设置时按无密码处理，不请求交互输入。不要把私钥或密码写入仓库或命令行参数。
4. 面向普通 macOS 用户分发前，另行配置 Developer ID 签名和 Apple 公证。当前 macOS 配置仍为 ad-hoc 签名；Updater 的签名只验证更新包来源，不能替代 Apple 签名或公证。

### 构建与上传

普通 `npm run build:mac` 保持本地构建行为，不要求更新私钥。需要签名更新产物时执行：

```sh
npm run build:mac:update
```

此命令只在 Mac 上构建当前 Node.js 进程架构对应的稳定版（Apple Silicon 或 Intel），不会上传、发布或安装。它拒绝空公钥或缺少私钥的配置，显式启用 `createUpdaterArtifacts`；生成归档后使用与 Updater 相同的 `minisign-verify` 库验证公钥、归档签名及签名版本，全部通过后才生成包含 CHANGELOG 发布说明的 `latest.json`。请使用锁文件中的 Tauri CLI 2.11.5 或更新的兼容版本，旧 CLI 2.11.4 生成的签名不含版本字段。在 Rosetta 下使用 x64 Node.js 会构建 Intel 版本；发布前确认期望架构及相应 Rust target 已安装。

构建脚本位于 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/scripts/build-update.mjs"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/scripts/build-update.mjs)。产物输出目录在命令完成时显示，位于 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/target"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/target) 下的目标架构目录。每次构建的清单只包含该架构，不会自动合并其他架构。

发布时须完成以下步骤：

1. 按项目版本管理约定同步应用版本，使用新的 `v<version>` Release 标签。不要覆盖已有版本的更新包；客户端只接受比当前版本更高的版本。
2. 上传脚本生成的 `LinguaMark-Reader_<version>_<arch>.app.tar.gz` 和同名 `.sig`。更新使用此归档，不是 DMG 或源码归档。重命名复制不会改变签名，但修改或重新压缩归档后必须重新签名。
3. 审阅生成的 `latest.json`：版本、下载 URL、架构及签名必须对应上传产物；`signature` 是 `.sig` 的内容，不是文件 URL。可把 `notes` 改为本次更新说明。
4. 若同时支持 Apple Silicon 和 Intel，构建两个架构并将同一版本的 `darwin-aarch64`、`darwin-x86_64` 条目合并到一份清单，不要让后上传的单架构清单覆盖另一架构。没有对应条目的客户端会报告检查失败，不会误装其他架构。
5. 先把所有产物及清单上传到草稿 Release，核对完成后再公开发布为最新稳定版。不要把仅含源码的版本设为最新稳定版，否则当前更新地址会找不到清单。
6. 首个支持更新且包含真实公钥的版本必须手动安装；现有不含 Updater 的安装版无法自行获得更新能力。保留应用标识 `com.linguamark.reader` 和数据位置。

正式启用前需要用两个不同版本验证真实升级、签名错误拒绝、断网重试、安装重启，以及设置、收藏和文件授权保留。静态检查不能替代这些验收。实际发布和本机应用替换需单独确认；当前未办理 Apple 公证。

参考：[Tauri Updater](https://v2.tauri.app/plugin/updater/)。

## 安全与限制

- 只读应用，不提供文件写入、删除或任意 shell 执行接口。
- Rust 仅接受用户通过原生选择器授权的文件/目录，或 macOS 系统文件打开事件明确选择的 Markdown 文件；后者只授予该文件，不授予父目录。规范化后的读取路径必须仍在授权范围内。目录树不遍历符号链接、设备和 socket。
- 授权记录由原生层保存，收藏和最近浏览通过应用 WebView 的本地存储保存。不会导入或读取 Chrome profile、API Key 或浏览器文件句柄。
- 不自动加载远程图片或远程字体；HTTP/HTTPS 链接经用户点击后交给系统浏览器。iframe、脚本、嵌入对象和表单提交被禁用。
- 原始 HTML 经 DOMPurify 净化。自定义 CSS 仅在 WebView 支持 `@scope` 时启用并限制在正文；不支持时忽略，不退回无作用域样式。
- 单文件上限 32 MiB，目录上限 10000 个条目及 32 层；超限会提示选择更小的文件或目录。
- 单窗口版本；不含 AI、编辑、云同步或 Chrome 历史迁移。更新必须由用户手动检查并确认安装，不启动后台自动检查。文件关联仅声明 Markdown，不抢占其他类型；设置默认打开应用是单独的本机操作。
- 当前以非 App Sandbox 的本地运行方式开发，持久路径授权不等于 macOS security-scoped bookmark。若将来改成沙盒发行，应另外实现系统授权恢复。
- Tauri 使用系统 WebView；公式图表及 CSS 对旧系统的兼容性需要实际验证，不承诺与所有 Chrome 版本逐像素一致。

## 代码边界

- `src/main.ts`：由现有扩展阅读器独立迁移的 UI 与渲染逻辑，不含 Chrome API 或 AI 初始化。
- `src/pdf.ts`：PDF 固定工具栏、纵向按需渲染与横向单页模式、当前页文本、缩放与加载任务释放。
- `src/platform.ts`：窄 IPC、目录/内容契约、阅读记录存储。
- `src-tauri/src/main.rs`：选择结果类型校验、持久只读授权、有限文件读取、目录枚举与外链。
- `src-tauri/src/native_picker.rs`：macOS 主线程的 NSOpenPanel 混合选择适配，只返回路径或取消，不持有业务状态。
- `public/`：随应用打包的现有阅读主题、KaTeX 样式与字体。

原主题和渲染逻辑来自同仓 LinguaMark；第三方库按各自许可证使用。本版本刻意保留独立副本，避免为了桌面实现改动现有扩展。
