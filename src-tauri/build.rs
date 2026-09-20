fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "pick_entry",
            "pick_directory",
            "read_file",
            "read_directory",
            "open_external",
            "take_opened_file",
        ]),
    ))
    .expect("failed to build Tauri application");
}
