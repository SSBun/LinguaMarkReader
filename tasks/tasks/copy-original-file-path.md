# 复制链接改为复制原始文件路径

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-24 15:51) |
| Kind | Task |

## Scope

仅调整文章目录链接的右键复制行为，不改变目录点击跳转或正文链接行为。

## Target
- [x] T1: 点击文章目录右键菜单的 Copy Link 后，剪贴板内容为当前文档原始文件的绝对本地路径，而非应用地址或锚点链接。
- [x] T2: 文章目录点击后仍跳转到对应标题。

## Plan

1. 复用现有右键菜单交互，为文章目录复制提供当前原始文件路径。
2. 执行类型检查、构建与代码路径核对，不运行测试套件；记录验证边界。

## Result

- T1: src/main.ts 源码路径核对：文章目录 contextmenu 阻止默认菜单；Copy Link 捕获 currentItem.path 并原样传给 navigator.clipboard.writeText；openNativeFile 在独立文件与目录内文件两条分支均记录原始绝对 path，不使用渲染相对路径。npm run check 与 npm run build 通过；未进行原生剪贴板实机操作。
- T2: git diff 与直接调用方核对：createTableOfContents 的 #heading.id 链接及点击处理完全未改；新增监听仅处理 contextmenu。共享菜单提取保留文件树动作、键盘导航、关闭与焦点恢复逻辑。git diff --check 通过。
- Review gate: Skipped — R1 四项依据齐备；源码路径、原行为对比、类型检查及构建已核对，无独立审查要求。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 局部目录复制行为调整，复用已有菜单和剪贴板调用。
- Snapshot: src/main.ts sha256:00ad1959473dde35e113bf91e2d87d5f360a47eb9e4b6244da315e868d35c26a（工作区未暂存内容；任务外改动不在范围内）
- Evidence: T1/T2 源码与调用方核对；npm run check、npm run build、git diff --check 均通过。
- Result clarity: 已确认复制当前原始绝对路径且保持标题跳转。
- Bounded impact: 仅文章目录的 contextmenu 新行为；共享菜单搬移保留文件树动作及交互。
- Low risk: 只在用户点击复制时写入剪贴板，不写文档、不扩展文件授权、不调用外部服务；失败沿用提示。
- Sufficient verification: 直接核对绝对路径来源、菜单动作到剪贴板调用和未变的锚点点击代码；类型检查与前端构建通过。未运行测试或原生 GUI 实测。
- Task fingerprint: 34e8757fcca4289a5666eda0c1300e7aa3dcad02c39bd03c0870b2167620cbdc

## Verification

- Passed: 最终 npm run check 与 git diff --check 通过，src/main.ts SHA-256 与评估快照一致；前端构建通过，源码确认复制原始路径且锚点点击未变。未运行测试、未执行原生 GUI 实测或安装。
