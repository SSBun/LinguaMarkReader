use objc2::MainThreadMarker;
use objc2_app_kit::{NSModalResponseCancel, NSModalResponseOK, NSOpenPanel};
use objc2_foundation::{NSArray, NSString};
use std::{path::PathBuf, sync::mpsc};

// The blocking caller runs on Tauri's worker pool; all AppKit objects stay on the main thread.
// Return only an owned path. Classification, validation and grants remain in the application layer.
pub fn pick_entry(window: tauri::WebviewWindow) -> Result<Option<PathBuf>, String> {
    let (sender, receiver) = mpsc::channel();
    window
        .run_on_main_thread(move || {
            let result = select_entry();
            let _ = sender.send(result);
        })
        .map_err(|_| "无法启动系统选择器")?;
    receiver.recv().map_err(|_| "系统选择器已关闭")?
}

fn select_entry() -> Result<Option<PathBuf>, String> {
    let main_thread = MainThreadMarker::new().ok_or("系统选择器需要主线程")?;
    let panel = NSOpenPanel::openPanel(main_thread);
    panel.setTitle(Some(&NSString::from_str("导入 Markdown、JSON、HTML、PDF 文件或目录")));
    panel.setPrompt(Some(&NSString::from_str("导入")));
    panel.setMessage(Some(&NSString::from_str("选择一个 Markdown、JSON、HTML、PDF 文件或文件夹")));
    panel.setCanChooseFiles(true);
    panel.setCanChooseDirectories(true);
    panel.setAllowsMultipleSelection(false);
    panel.setCanCreateDirectories(false);
    panel.setAllowsOtherFileTypes(false);
    panel.setResolvesAliases(true);
    let extensions = NSArray::from_retained_slice(&[
        NSString::from_str("md"),
        NSString::from_str("MD"),
        NSString::from_str("markdown"),
        NSString::from_str("MARKDOWN"),
        NSString::from_str("json"),
        NSString::from_str("JSON"),
        NSString::from_str("html"),
        NSString::from_str("HTML"),
        NSString::from_str("htm"),
        NSString::from_str("HTM"),
        NSString::from_str("pdf"),
        NSString::from_str("PDF"),
    ]);
    // Match rfd's existing filter API: this app still targets macOS 10.13, before UTType-based panels.
    #[allow(deprecated)]
    panel.setAllowedFileTypes(Some(&extensions));

    match panel.runModal() {
        response if response == NSModalResponseOK => {
            let url = panel.URL().ok_or("系统选择器未返回路径")?;
            if !url.isFileURL() {
                return Err("请选择本地文件或目录".into());
            }
            let path = url.path().ok_or("无法获取所选路径")?;
            Ok(Some(PathBuf::from(path.to_string())))
        }
        response if response == NSModalResponseCancel => Ok(None),
        _ => Err("系统选择器未能完成选择".into()),
    }
}
