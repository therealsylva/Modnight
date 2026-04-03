use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallProgress {
    pub percent: f32,
    pub current_file: String,
    pub speed_mbps: f32,
    pub files_copied: u32,
    pub total_files: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallResult {
    pub success: bool,
    pub message: String,
    pub install_path: String,
}

#[tauri::command]
pub fn get_default_path(tool_name: String) -> String {
    let default = format!(r"C:\Program Files\ModNight\{}", tool_name);
    tracing::info!("Default path: {}", default);
    default
}

#[tauri::command]
pub async fn select_install_path(app: AppHandle) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    
    let folder = app.dialog()
        .file()
        .set_title("Select Installation Folder")
        .blocking_pick_folder();
    
    match folder {
        Some(path) => {
            let path_str = path.to_string();
            tracing::info!("Selected path: {}", path_str);
            Ok(path_str)
        }
        None => Err("No folder selected".to_string()),
    }
}

#[tauri::command]
pub async fn start_install(
    app: AppHandle,
    install_path: String,
    _tool_name: String,
) -> Result<InstallResult, String> {
    tracing::info!("Starting installation to: {}", install_path);
    
    let install_dir = PathBuf::from(&install_path);
    
    // Create installation directory
    if !install_dir.exists() {
        std::fs::create_dir_all(&install_dir)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Simulate installation with progress
    let total_files: u32 = 10;
    
    for i in 1..=total_files {
        let percent = (i as f32 / total_files as f32) * 100.0;
        
        let progress = InstallProgress {
            percent,
            current_file: format!("file_{}.bin", i),
            speed_mbps: 45.0 + (i as f32 * 2.5),
            files_copied: i,
            total_files,
        };
        
        // Emit progress event to frontend
        let _ = app.emit("install-progress", &progress);
        
        // Small delay to simulate file copy
        tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
    }
    
    // Emit completion
    let result = InstallResult {
        success: true,
        message: "Installation completed successfully!".to_string(),
        install_path: install_path.clone(),
    };
    
    let _ = app.emit("install-complete", &result);
    
    tracing::info!("Installation complete to: {}", install_path);
    Ok(result)
}
