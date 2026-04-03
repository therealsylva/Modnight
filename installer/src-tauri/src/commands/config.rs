use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolConfig {
    pub tool: ToolInfo,
    pub license: LicenseInfo,
    pub install: InstallInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInfo {
    pub name: String,
    pub version: String,
    pub author: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstallInfo {
    #[serde(default = "default_path")]
    pub default_path: String,
    #[serde(default = "default_true")]
    pub create_shortcut: bool,
    #[serde(default = "default_false")]
    pub add_to_path: bool,
}

fn default_path() -> String {
    r"C:\Program Files\ModNight".to_string()
}

fn default_true() -> bool {
    true
}

fn default_false() -> bool {
    false
}

#[tauri::command]
pub fn get_config() -> Result<ToolConfig, String> {
    // In production, this reads from the embedded config file
    // For now, return a sample config that simulates embedded data
    
    tracing::info!("Loading installer config...");
    
    // This would read from the bundled installer.conf in production
    let config = ToolConfig {
        tool: ToolInfo {
            name: "btc-rig".to_string(),
            version: "1.0.0".to_string(),
            author: "ModNight".to_string(),
        },
        license: LicenseInfo {
            text: r#"MIT License

Copyright (c) 2024 ModNight Software

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE."#.to_string(),
        },
        install: InstallInfo {
            default_path: r"C:\Program Files\ModNight".to_string(),
            create_shortcut: true,
            add_to_path: false,
        },
    };
    
    tracing::info!("Config loaded for tool: {}", config.tool.name);
    Ok(config)
}
