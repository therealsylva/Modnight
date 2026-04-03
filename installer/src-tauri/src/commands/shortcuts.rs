#[tauri::command]
pub fn create_shortcut(
    tool_name: String,
    install_path: String,
) -> Result<String, String> {
    tracing::info!("Creating shortcut for: {} at: {}", tool_name, install_path);
    
    let shortcut_path = dirs::desktop_dir()
        .ok_or("Failed to get desktop directory")?
        .join(format!("{}.lnk", tool_name));
    
    tracing::info!("Shortcut path: {:?}", shortcut_path);
    
    // In production, this would use windows-rs to create actual shortcut
    // For now, we just return the path that would be created
    Ok(shortcut_path.to_string_lossy().to_string())
}
