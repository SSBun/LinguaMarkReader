# 将 LinguaMark Reader 加入作品集并更新网站

| Field | Value |
| --- | --- |
| Status | Completed (2026-09-20 17:15) |
| Artifacts | [Artifacts](../artifacts/register-linguamark-works/) |
| Kind | Task |

## Scope

- 本任务在当前工作区保留规范记录，交付修改位于用户指定的 `/Users/caishilin/Desktop/personal/csl-works`。
- 只登记 LinguaMarkReader，不改其他项目、站点样式或 GitHub 仓库描述；保留 csl-works 中既有未提交任务文件。
- 项目简介使用现有非空 GitHub description，版本和发布说明使用公开 Releases，不复制版本快照或宣称存在公开安装包。

## Plan

1. 依据 csl-works 白名单约定登记 LinguaMarkReader，保持既有选中项目不变。
2. 执行 Astro 类型、源码契约与静态构建检查；核对生成白名单、公开仓库及最新 Release，不运行测试套件。
3. 创建仅含白名单改动的本地提交，列明确切推送及自动部署目标，等待单独远端确认。
4. 推送 main 触发既有 Cloudflare Pages 生产部署，检查 ssbun.com 的实际项目条目、详情、链接及部署验证，再完成记录。

## Target
- [x] T1: LinguaMark Reader 已按 csl-works 的现有约定登记，项目介绍与链接准确。
- [x] T2: 作品集网站已更新，线上可看到并访问 LinguaMark Reader 条目。

## Result

- T1: 已在csl-works按既有格式新增唯一勾选项LinguaMarkReader并提交5fbe9c85003bf38c85f361156cc62e2227344adb，仅一行变更；原22项完整保留，生成白名单23项。npm run verify零错误/警告，源码/构建契约与diff检查通过，线上GitHub代理返回公开v0.2.0 Release；原有4个无关任务文件哈希未变。T2待用户批准推送部署。
- T2: 5fbe9c8已推送csl-works/main，Cloudflare Pages check completed/success，npm run verify:deployed对https://ssbun.com生产检查通过。真实WKWebView首页渲染23卡，LinguaMarkReader简介非空、版本v0.2.0、GitHub链接正确；点击详情进入/project/LinguaMarkReader/并显示v0.2.0发布正文与准确Release链接。所有项目简介非空，GHFS未显示，Glass blur40px。见deployment.json、deployed.log、browser.log。
- Review gate: Skipped — R1四项均有直接证据，无显式或继承的独立审查义务；一行新增已在真实生产页面完成观察。
## Review Assessment

- Schema: task-review-assessment/v1
- Level: R1
- State: Current
- Reason: 交付仅一行白名单增加公开项目，复用现有渲染、代理和部署逻辑，不改变安全边界或代码。
- Snapshot: csl-works git:5fbe9c85003bf38c85f361156cc62e2227344adb; projects-whitelist.md sha256:6d1834512d07c9aebacafadfdde81317a1df4b691c4bb322a6f8651959a321a7
- Evidence: T1/T2 Result；local-verification.json、build.log、deployment.json、deployed.log、browser.log；既有无关文件哈希保持。
- Result clarity: 唯一新增LinguaMarkReader，条目、公开仓库、最新Release与浏览器呈现均明确。
- Bounded impact: 一行数据配置；原22项完整保留，不改渲染、代理、权限、域名、样式或其他文件。
- Low risk: 只展示已公开仓库的现有信息，无凭据或非公开内容上传，无破坏性操作，部署可回滚到前一提交。
- Sufficient verification: Astro零诊断、源码/构建契约通过，Cloudflare部署成功，线上路由/API/安全头与真实浏览器卡片、详情链接均通过。
- Task fingerprint: 1a7c1c2441aaaa21c967600d2afd05429a331bc6f83a0ce3d64de5509a032971

## Verification

- Passed: 终验远端main和本地HEAD均5fbe9c8、白名单SHA256与已部署快照一致，WKWebView实际首页和项目日志正常；原有4个无关工作文件哈希未变，Context校验成功，未运行测试套件。
