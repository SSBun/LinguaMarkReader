#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "macos")]
mod native_picker;

use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File},
    io::Read,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

const MAX_FILE_BYTES: u64 = 32 * 1024 * 1024;
const MAX_ENTRIES: usize = 10_000;
const MAX_DEPTH: usize = 32;

#[derive(Default, Deserialize, Serialize)]
struct Grants {
    files: Vec<PathBuf>,
    directories: Vec<PathBuf>,
}

struct Access {
    grants: Mutex<Grants>,
    store: PathBuf,
}

impl Access {
    fn authorize(&self, path: &Path) -> Result<PathBuf, String> {
        let canonical = path.canonicalize().map_err(|_| "文件不存在或不可访问")?;
        let grants = self.grants.lock().map_err(|_| "授权状态不可用")?;
        // Canonicalize the request, not the stored root: a replaced symlink cannot redirect a grant.
        if grants.files.contains(&canonical)
            || grants
                .directories
                .iter()
                .any(|root| canonical.starts_with(root))
        {
            Ok(canonical)
        } else {
            Err("此路径未授权，请通过“导入”重新选择文件或目录".into())
        }
    }

    fn grant(&self, path: &Path, directory: bool) -> Result<String, String> {
        let canonical = path.canonicalize().map_err(|_| "无法访问所选路径")?;
        if directory != canonical.is_dir() {
            return Err("所选路径类型不匹配".into());
        }
        let mut grants = self.grants.lock().map_err(|_| "授权状态不可用")?;
        let paths = if directory {
            &mut grants.directories
        } else {
            &mut grants.files
        };
        let added = !paths.contains(&canonical);
        if added {
            paths.push(canonical.clone());
        }
        let persist = (|| {
            let temporary = self.store.with_extension("tmp");
            let bytes = serde_json::to_vec(&*grants).map_err(|_| "无法编码授权记录")?;
            fs::write(&temporary, bytes).map_err(|_| "无法保存授权记录")?;
            fs::rename(temporary, &self.store).map_err(|_| "无法更新授权记录")
        })();
        if let Err(error) = persist {
            if added {
                let paths = if directory {
                    &mut grants.directories
                } else {
                    &mut grants.files
                };
                paths.retain(|item| item != &canonical);
            }
            return Err(error.into());
        }
        Ok(display_path(&canonical))
    }
}

fn display_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

#[derive(Serialize)]
struct SelectedEntry {
    kind: &'static str,
    path: String,
}

#[tauri::command]
async fn pick_entry(
    app: tauri::AppHandle,
    window: tauri::WebviewWindow,
) -> Result<Option<SelectedEntry>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        #[cfg(target_os = "macos")]
        let selected = native_picker::pick_entry(window)?;
        // Keep the existing file picker on other platforms; the directory shortcut remains available.
        #[cfg(not(target_os = "macos"))]
        let selected = {
            let _ = window;
            app.dialog()
                .file()
                .add_filter("Markdown / JSON / HTML / PDF", &["md", "MD", "json", "JSON", "html", "HTML", "htm", "HTM", "pdf", "PDF"])
                .blocking_pick_file()
                .map(|path| path.into_path().map_err(|_| "不支持此文件地址"))
                .transpose()?
        };
        selected
            .map(|path| {
                let canonical = path.canonicalize().map_err(|_| "无法访问所选路径")?;
                let directory = canonical.is_dir();
                if !directory
                    && (!canonical.is_file() || !matches!(file_kind(&canonical), "markdown" | "json" | "html" | "pdf"))
                {
                    return Err("请选择 Markdown、JSON、HTML、PDF 文件或目录".into());
                }
                let path = app.state::<Access>().grant(&canonical, directory)?;
                Ok(SelectedEntry {
                    kind: if directory { "directory" } else { "file" },
                    path,
                })
            })
            .transpose()
    })
    .await
    .map_err(|_| "导入选择器启动失败")?
}

#[tauri::command]
async fn pick_directory(app: tauri::AppHandle) -> Result<Option<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let selected = app.dialog().file().blocking_pick_folder();
        selected
            .map(|path| {
                let path = path.into_path().map_err(|_| "不支持此目录地址")?;
                app.state::<Access>().grant(&path, true)
            })
            .transpose()
    })
    .await
    .map_err(|_| "目录选择器启动失败")?
}

fn file_kind(path: &Path) -> &'static str {
    match path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("")
        .to_ascii_lowercase()
        .as_str()
    {
        "md" => "markdown",
        "json" => "json",
        "html" | "htm" => "html",
        "pdf" => "pdf",
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "avif" | "svg" => "image",
        _ => "other",
    }
}

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
enum Content {
    Markdown {
        path: String,
        text: String,
    },
    Json {
        path: String,
        text: String,
    },
    Html {
        path: String,
        text: String,
    },
    Pdf {
        path: String,
        base64: String,
    },
    Image {
        path: String,
        #[serde(rename = "dataUrl")]
        data_url: String,
    },
}

#[tauri::command]
async fn read_file(path: String, app: tauri::AppHandle) -> Result<Content, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let canonical = app.state::<Access>().authorize(Path::new(&path))?;
        let kind = file_kind(&canonical);
        if kind == "other" {
            return Err("不支持此文件类型".into());
        }
        let file = File::open(&canonical).map_err(|_| "无法读取文件")?;
        let metadata = file.metadata().map_err(|_| "无法检查文件")?;
        if !metadata.is_file() || metadata.len() > MAX_FILE_BYTES {
            return Err("仅支持不超过 32 MiB 的普通文件".into());
        }
        let mut bytes = Vec::new();
        file.take(MAX_FILE_BYTES + 1)
            .read_to_end(&mut bytes)
            .map_err(|_| "读取文件失败")?;
        if bytes.len() as u64 > MAX_FILE_BYTES {
            return Err("文件超过 32 MiB".into());
        }
        if kind == "pdf" {
            Ok(Content::Pdf { path, base64: STANDARD.encode(bytes) })
        } else if matches!(kind, "markdown" | "json" | "html") {
            let text = String::from_utf8(bytes).map_err(|_| "文本文件必须使用 UTF-8 编码")?;
            if kind == "html" {
                Ok(Content::Html { path, text })
            } else if kind == "json" {
                Ok(Content::Json { path, text })
            } else {
                Ok(Content::Markdown { path, text })
            }
        } else {
            let extension = canonical
                .extension()
                .and_then(|v| v.to_str())
                .unwrap_or("")
                .to_ascii_lowercase();
            let mime = match extension.as_str() {
                "svg" => "image/svg+xml",
                "jpg" | "jpeg" => "image/jpeg",
                "gif" => "image/gif",
                "webp" => "image/webp",
                "avif" => "image/avif",
                _ => "image/png",
            };
            Ok(Content::Image {
                path,
                data_url: format!("data:{mime};base64,{}", STANDARD.encode(bytes)),
            })
        }
    })
    .await
    .map_err(|_| "文件读取任务失败")?
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Entry {
    name: String,
    path: String,
    #[serde(rename = "type")]
    kind: &'static str,
    file_kind: Option<&'static str>,
    children: Option<Vec<Entry>>,
}

fn walk(
    root: &Path,
    directory: &Path,
    depth: usize,
    count: &mut usize,
) -> Result<Vec<Entry>, String> {
    if depth > MAX_DEPTH {
        return Err("目录层级超过 32 层，请选择更小的目录".into());
    }
    let mut entries = Vec::new();
    for entry in fs::read_dir(directory).map_err(|_| "无法读取目录，请检查权限")? {
        let entry = entry.map_err(|_| "无法读取目录条目")?;
        let file_type = entry.file_type().map_err(|_| "无法检查目录条目")?;
        // Do not follow links, special devices or sockets while traversing user directories.
        if file_type.is_symlink() || (!file_type.is_file() && !file_type.is_dir()) {
            continue;
        }
        *count += 1;
        if *count > MAX_ENTRIES {
            return Err("目录超过 10000 个条目，请选择更小的目录".into());
        }
        let path = entry.path();
        let canonical = path.canonicalize().map_err(|_| "目录条目已不可访问")?;
        if !canonical.starts_with(root) {
            return Err("拒绝读取目录外的条目".into());
        }
        let directory = file_type.is_dir();
        entries.push(Entry {
            name: entry.file_name().to_string_lossy().into_owned(),
            path: display_path(path.strip_prefix(root).map_err(|_| "目录路径无效")?),
            kind: if directory { "directory" } else { "file" },
            file_kind: if directory {
                None
            } else {
                Some(file_kind(&path))
            },
            children: if directory {
                Some(walk(root, &canonical, depth + 1, count)?)
            } else {
                None
            },
        });
    }
    entries.sort_by(|a, b| {
        (a.kind != "directory")
            .cmp(&(b.kind != "directory"))
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    Ok(entries)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Directory {
    status: &'static str,
    root_name: String,
    entries: Vec<Entry>,
}

#[tauri::command]
async fn read_directory(path: String, app: tauri::AppHandle) -> Result<Directory, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let root = app.state::<Access>().authorize(Path::new(&path))?;
        if !root.is_dir() {
            return Err("此路径不是目录".into());
        }
        Ok(Directory {
            status: "granted",
            root_name: display_path(&root),
            entries: walk(&root, &root, 0, &mut 0)?,
        })
    })
    .await
    .map_err(|_| "目录读取任务失败")?
}

#[tauri::command]
fn open_external(url: String, app: tauri::AppHandle) -> Result<(), String> {
    let parsed = tauri::Url::parse(&url).map_err(|_| "链接无效")?;
    if !matches!(parsed.scheme(), "http" | "https") || parsed.host_str().is_none() {
        return Err("仅允许在浏览器打开 HTTP/HTTPS 链接".into());
    }
    app.opener()
        .open_url(parsed.to_string(), None::<&str>)
        .map_err(|_| "无法打开外部链接".into())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_opener::Builder::new()
                .open_js_links_on_click(false)
                .build(),
        )
        .setup(|app| {
            let data = app.path().app_data_dir()?;
            fs::create_dir_all(&data)?;
            let store = data.join("grants.json");
            let grants = if store.exists() {
                serde_json::from_slice(&fs::read(&store)?)?
            } else {
                Grants::default()
            };
            app.manage(Access {
                grants: Mutex::new(grants),
                store,
            });
            let dev_url = if cfg!(not(feature = "custom-protocol")) {
                app.config().build.dev_url.clone()
            } else {
                None
            };
            tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("LinguaMark Reader")
            .inner_size(1200.0, 820.0)
            .min_inner_size(640.0, 480.0)
            .on_new_window(|_, _| tauri::webview::NewWindowResponse::Deny)
            .on_navigation(move |url| {
                let local_origin = (url.scheme() == "tauri" && url.host_str() == Some("localhost"))
                    || (matches!(url.scheme(), "http" | "https")
                        && url.host_str() == Some("tauri.localhost"));
                let dev_origin = dev_url.as_ref().is_some_and(|dev| {
                    matches!(dev.scheme(), "http" | "https") && url.origin() == dev.origin()
                });
                ((local_origin && url.port().is_none()) || dev_origin)
                    && matches!(url.path(), "" | "/" | "/index.html")
            })
            .build()?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            pick_entry,
            pick_directory,
            read_file,
            read_directory,
            open_external
        ])
        .run(tauri::generate_context!())
        .expect("failed to run LinguaMark Reader");
}
