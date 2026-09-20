# 发布新版并安装为 Markdown 默认阅读器

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 16:59) |
| Kind | Queue |

## Scope

- 用户在执行期间插入的独立修正 `selected-file-badge-contrast` 已完成；其结果必须随本次发布交付。原有三个阶段按既定顺序继续。

## Plan

1. `macos-markdown-file-opening`：补足系统打开 Markdown 与本地应用包能力，为安装和默认关联提供可用产物。
2. `commit-and-release`：提交包含上述能力的全部改动，按源码方式发布新版本；新的发布提交与此前批准的提交不同，远端动作前重新列明确切对象。
3. `install-markdown-default`：安装已发布提交对应应用，设置并验证此 Mac 的 Markdown 默认打开方式，不改变其他文件类型。
4. 核对远端版本、本地应用及默认打开行为的集成结果。

## Target
- [x] T1: 全部项目改动已提交并发布新版本，Mac 上安装的应用与发布版本一致。
- [x] T2: 此 Mac 的 Markdown 默认打开应用为 LinguaMark Reader，双击文件可在应用中实际打开正文。
- [x] T3: 发布版本中文件树选中状态的文件类型标签具有清晰的文字/背景对比度。

## Children

1. [实现 macOS Markdown 文件打开与应用打包](macos-markdown-file-opening.md)
2. [提交全部本地改动并发布新版本](commit-and-release.md)
3. [安装已发布应用并设置 Markdown 默认打开方式](install-markdown-default.md)

## Result

- T1: 发布v0.2.0对应6557da4，GitHub源码归档203文件与Git完全一致；/Applications安装应用版本/构建0.2.0，全部4个bundle文件与该源码的已验证构建一致，执行文件SHA25650807498cca20618f7651c454f9a1b612817737126e3980d8d381b62767fcda1。全部源码与新增功能已提交推送，生命周期收尾记录按授权在结束时统一提交。
- T2: 实时md/markdown默认处理器com.linguamark.reader且路径为/Applications/LinguaMark Reader.app；不指定应用执行open两个扩展名，真实安装进程AX分别找到冷/热正文标记。txt/html/pdf/json默认值与路径未变；原文件/目录授权全部保留。install-markdown-default已独立审查完成。
- T3: selected-file-badge-contrast已完成；六类标签selected/focus-visible为深绿实底与浅字，对比度7.38:1，正文不变。修正后的CSS哈希fc79b024...已纳入发布提交6557da4与原生应用构建快照，安装包身份与该构建一致。
- Review gate: Skipped — 父级R0只做集成证据核对，无额外独立审查义务；不重复替代各子任务已完成的审查。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R0
- State: Current
- Reason: 父队列仅聚合完成子任务并维护任务/上下文记录；没有父级运行代码或其他交付文件修改，原生功能、发布、安装均已完成各自独立审查。
- Snapshot: release:v0.2.0/git6557da4dc27237bfaf3f9bcaff889bf9485ca655; installed-exe-sha256:50807498cca20618f7651c454f9a1b612817737126e3980d8d381b62767fcda1; handlers:install-markdown-default/evidence/defaults-after.json
- Evidence: 三个子任务Completed且独立审查通过，独立标签修正已完成；父级T1/T2/T3串联远端归档、构建/安装身份与实际默认打开证据。
- Task fingerprint: ba996b8a64f66e372f104cc11957cb08a80e5d33949599ea5909e8c12510aebc

## Verification

- Passed: 最终集成实时复核：运行源码与v0.2.0无差异，安装可执行文件50807498...与构建一致，codesign有效，md/markdown解析/Applications安装副本且其他类型默认值不变，发布CSS哈希fc79b024...包含标签修正，Context验证通过；三子任务均Completed。
