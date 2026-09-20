# 安装结果独立审查

- 任务：install-markdown-default
- 轮次：01
- 运行：c078e7f1-76cc-48bc-add2-4419137d7192
- 快照：sha256:206a250a5f1c05eb67b56fb559d3b55f93b1c40aecd473328a34a34ed9fc255e
- 主会话核验：安装可执行文件/证据哈希、实时默认处理器及原授权保留状态均一致，签名复验成功。

---

## 审查模式与范围

Review mode: independent subagent。

本轮仅审查 install-markdown-default 的 T1（本机安装及数据保留）、T2（Markdown 默认打开及其他类型不变），不涉及远端发布、源码功能或父任务收尾。

审查快照：
- 发布提交：`6557da4dc27237bfaf3f9bcaff889bf9485ca655`。
- 作者提供的证据快照 SHA256：`206a250a5f1c05eb67b56fb559d3b55f93b1c40aecd473328a34a34ed9fc255e`。
- 已前后重读 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/install-markdown-default/evidence/snapshot.json"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/install-markdown-default/evidence/snapshot.json)，文本未见变化；未自行计算哈希。

## Findings: none

No issues found.

## 实际检查

- 直接读取并复读 ["/Applications/LinguaMark Reader.app/Contents/Info.plist"](<file:///Applications/LinguaMark Reader.app/Contents/Info.plist>)：版本及构建号均为 `0.2.0`，标识符正确，文档声明仅含 `md`、`markdown`，角色为 Viewer/Alternate。
- 对照源码配置，版本、标识符及导入的 Markdown UTI 一致。
- 检查默认应用设置脚本：先验证两个扩展名均映射至准确的 Markdown UTI，仅对该 UTI 调用默认应用设置接口，没有设置普通文本等类型。
- 逐项比较默认处理器前后记录：两个 Markdown 扩展名均由 Chrome 改为安装副本；`txt/html/pdf/json` 的处理器标识符、应用路径和 UTI 均未改变。
- 查看安装后截图：可见已渲染正文及 `NATIVE_WARM_OPEN_OK` 标记。

## 已阅读的作者证据

已检查 ["/Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/install-markdown-default/evidence/"](file:///Users/caishilin/Desktop/personal/LinguaMarkReader/tasks/artifacts/install-markdown-default/evidence/) 内安装、数据保留、默认处理器前后、冷/热打开记录及截图。

这些记录支持：四个应用包文件匹配、签名完整、原安装不存在无需备份、旧授权集合保留，以及同一 PID 的冷/热正文标记验证。上述操作结果属于作者证据，**不是本审查者重新执行的验证**。本地 ad-hoc、未公证符合已接受边界，不构成本轮问题。

## 未验证风险与覆盖限制

- **当前外部状态的新鲜度**：受只读工具及禁止命令限制，未独立重算应用包/证据哈希、查询实时默认处理器或验证签名。未观察到漂移；此限制本身不构成 T1/T2 的已证实阻断，但本轮不能替代主代理承诺的最终实时复核。若复核不匹配，应视为当前快照验证受阻。
- **数据保留证据粒度**：读取到的是保留结果布尔值，未读取私有授权基线，亦未逐项审计全部用户数据。不因此判定 T1 失败；结论依赖作者的基线比对及未替换数据目录记录。
- 未运行测试、命令、网络操作或系统修改；未授予批准或完成授权。