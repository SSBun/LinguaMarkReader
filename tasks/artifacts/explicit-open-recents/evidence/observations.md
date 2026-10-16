# 最近打开来源核对

## 检查方式

实际前端构建在独立 Chrome headless 加载，通过 CDP 点击真实 DOM；模拟 Tauri invoke、事件回调和虚构 demo 路径。未运行单元或项目测试套件，未操作用户应用数据，未验证真实 macOS WebKit、系统事件和磁盘授权。

`npm run check`、`npm run build`、`git diff --check` 均通过。源码版本与任务差异由 snapshot.json 固定；只修改 src/main.ts，未改原生代码、存储格式、收藏逻辑或清除旧记录。

## 观察结果

1. 初始化：预置旧记录和收藏，加载后保持原样。
2. 首页导入目录：调用 pick_directory/read_directory 后最近项为 `[MyWiki目录, 旧记录]`。
3. 侧栏打开内部文章、正文链接跳到另一篇、后退、前进：实际 read_file/resolve_link_target 参数逐项观察，最近项仍为 `[MyWiki目录, 旧记录]`。
4. 快捷打开选择旧记录、选择收藏：均打开对应文章，最近项和顺序仍不变。
5. 工具栏导入文件：新增 `主动导入.md` 为首项，之后是目录、旧记录。
6. 模拟 native-file-opened 系统事件：take_opened_file 返回 `Finder打开.md`，成功读入后新增为首项；收藏保持不变。
7. 导入文件读取失败：最近数据字符串与操作前完全一致。
8. 取消选择器（null）：最近数据字符串与操作前完全一致。
9. 外部系统打开 slow.md 延迟期间内部打开收藏，随后释放慢读取：慢打开被导航序列淘汰，最近数据字符串仍与操作前完全一致。
10. 开启恢复会话后重新加载：实际 read_file 恢复收藏文章，最近数据字符串保持不变。
11. 派发 Cmd+R 刷新当前文章：最近数据字符串保持不变。

最终最近项为 `[Finder打开.md, 主动导入.md, MyWiki目录, 旧记录]`，未包含任何内部文章、收藏跳转、失败或过期的路径。

## 静态边界核对

recordViewerRecent 仅由 openExternalViewerItem 在获得成功返回项且库初始化完成后调用。外部入口只有 initializeFileOpening 与 chooseNative。侧栏、正文链接、历史、恢复、刷新和首页／快捷打开列表仍使用不记录最近项的原有打开函数。首页与快捷打开仍由同一 viewerRecents 渲染，不存在第二份最近数据。
