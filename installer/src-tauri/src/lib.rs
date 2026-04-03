mod commands;

use tauri::Manager;

pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter("modnight_installer=info,tauri=info")
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::config::get_config,
            commands::install::get_default_path,
            commands::install::select_install_path,
            commands::install::start_install,
            commands::shortcuts::create_shortcut,
        ])
        .setup(|app| {
            tracing::info!("ModNight Installer starting...");

            if let Some(app_data) = app.path().app_data_dir().ok() {
                tracing::info!("App data dir: {:?}", app_data);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
