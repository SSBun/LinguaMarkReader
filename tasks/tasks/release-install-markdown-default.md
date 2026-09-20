# 发布新版并安装为 Markdown 默认阅读器

| Field | Value |
| --- | --- |
| Status | In Progress (2026-09-20 14:57) |
| Kind | Queue |

## Scope

- 用户在执行期间插入的独立修正 `selected-file-badge-contrast` 已完成；其结果必须随本次发布交付。原有三个阶段按既定顺序继续。

## Plan

1. `macos-markdown-file-opening`：补足系统打开 Markdown 与本地应用包能力，为安装和默认关联提供可用产物。
2. `commit-and-release`：提交包含上述能力的全部改动，按源码方式发布新版本；新的发布提交与此前批准的提交不同，远端动作前重新列明确切对象。
3. `install-markdown-default`：安装已发布提交对应应用，设置并验证此 Mac 的 Markdown 默认打开方式，不改变其他文件类型。
4. 核对远端版本、本地应用及默认打开行为的集成结果。

## Target

- [ ] T1: 全部项目改动已提交并发布新版本，Mac 上安装的应用与发布版本一致。
- [ ] T2: 此 Mac 的 Markdown 默认打开应用为 LinguaMark Reader，双击文件可在应用中实际打开正文。
- [ ] T3: 发布版本中文件树选中状态的文件类型标签具有清晰的文字/背景对比度。

## Children

1. [实现 macOS Markdown 文件打开与应用打包](macos-markdown-file-opening.md)
2. [提交全部本地改动并发布新版本](commit-and-release.md)
3. [安装已发布应用并设置 Markdown 默认打开方式](install-markdown-default.md)
