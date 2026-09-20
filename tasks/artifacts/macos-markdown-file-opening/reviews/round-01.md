# 独立审查记录

- 任务：macos-markdown-file-opening
- 轮次：01
- 运行：4ce0258f-77e9-457a-aa11-3c61e0f446d1
- 快照：sha256:fac2822431938096cfd5c0d08e2c09f878047e442f1abf281bfd8ca04192a5de
- 主会话核验：源码与可执行文件哈希均匹配。

---

## 审查模式与范围

- 模式：独立、只读子代理审查。
- 范围：`macos-markdown-file-opening`（Plan node1）的 T1 应用包及 Markdown 声明、T2 冷／热启动系统打开与单文件授权。
- 快照：委托方提供的 `sha256:fac2822431938096cfd5c0d08e2c09f878047e442f1abf281bfd8ca04192a5de`。已读取快照清单；工具不支持计算哈希，未独立验证审查前后身份。
- 发布、安装及切换默认应用仍属于后续子任务，本次不判定其完成。

## Findings: none

No issues found.

### 已确认的正确行为

- 原生入口在早期仅缓存 URL；前端领取时才规范化路径、检查普通 Markdown 文件并授予单文件权限，未直接授权父目录。见 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/src/main.rs"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/src/main.rs):88–121、382–451。
- 前端先监听再领取待处理文件，并通过导航序号避免会话恢复覆盖已开始的显式打开。阅读操作继续使用既有授权检查。见 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/src/main.ts"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/src/main.ts):138–164、1077–1103、1142–1177。
- 已直接读取新增平台配置及实际应用包元数据：仅声明 `.md`／`.markdown`，角色为 `Viewer`、优先级为 `Alternate`，没有声明接管其他文档类型。实际产物见 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/target/release/bundle/macos/LinguaMark Reader.app/Contents/Info.plist"](<file:///Users/caishilin/Desktop/personal/LinguaMarkReader/src-tauri/target/release/bundle/macos/LinguaMark Reader.app/Contents/Info.plist>)。

## 未验证风险

- **快照身份复核待主代理完成**：本轮无法重新计算源文件、快照及可执行文件哈希。影响 T1／T2 证据与当前内容的绑定；在主代理确认前后哈希一致之前，阻止将本报告视为已验证的当前快照结论。不构成已确认代码缺陷。
- 本轮未重新执行原生打开、签名检查或并发导航实验。已有实际应用运行证据结合源码检查支持 T1／T2；未发现因此需要阻断目标验证的额外缺口。

## 实际检查与继承证据

**本轮实际执行**：读取完整作用域差异、关键源码及恢复／导航调用链、权限配置、新增配置、实际产物 plist；检查冷／热启动截图与探针实现。未执行命令、测试、编辑或系统设置修改。

**作者证据已审阅**：位于 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/macos-markdown-file-opening/evidence/"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/macos-markdown-file-opening/evidence/) 的构建日志、bundle 信息、冷／热／拒绝打开记录、授权摘要、截图、原生 AX 探针及首次启动失败记录：

- 构建日志记录实际应用包生成和 ad-hoc 签名。
- 冷／热启动记录为同一 PID 79726；截图正文分别显示对应验证标记。
- 拒绝记录显示非 Markdown 提示；授权摘要显示两个文档获授权、不支持文件及父目录未获授权。
- 签名完整性成功属于作者提供的记录，不是本轮重跑结果；不代表 Developer ID 分发或公证。

## 覆盖限制

未运行测试套件；未验证 Windows／Linux、默认关联切换或安装后的发布一致性。标签对比度仅核对其已纳入快照，不重新展开 UI 审查。本报告仅提供审查反馈，不授予批准或完成状态。