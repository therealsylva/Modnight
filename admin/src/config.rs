use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Config {
    pub api_url: String,
    pub admin_key: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            api_url: "http://localhost:8080".to_string(),
            admin_key: String::new(),
        }
    }
}

impl Config {
    pub fn load() -> Result<Self> {
        let mut config = Self::from_env()?;
        
        if let Some(path) = Self::config_path() {
            if path.exists() {
                let file_config = Self::from_file(&path)?;
                if config.api_url.is_empty() || config.api_url == "http://localhost:8080" {
                    config.api_url = file_config.api_url;
                }
                if config.admin_key.is_empty() {
                    config.admin_key = file_config.admin_key;
                }
            }
        }
        
        Ok(config)
    }

    fn config_path() -> Option<PathBuf> {
        dirs::home_dir().map(|h| h.join(".stubbed").join("config.toml"))
    }

    fn from_env() -> Result<Self> {
        Ok(Self {
            api_url: std::env::var("STUBBED_API_URL")
                .unwrap_or_else(|_| "http://localhost:8080".to_string()),
            admin_key: std::env::var("STUBBED_ADMIN_KEY").unwrap_or_default(),
        })
    }

    fn from_file(path: &PathBuf) -> Result<Self> {
        let contents = fs::read_to_string(path)
            .context("Failed to read config file")?;
        toml::from_str(&contents)
            .context("Failed to parse config file")
    }

    pub fn save(&self) -> Result<()> {
        let path = Self::config_path()
            .context("Could not determine config path")?;
        
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .context("Failed to create config directory")?;
        }
        
        let toml_string = toml::to_string_pretty(self)
            .context("Failed to serialize config")?;
        
        fs::write(&path, toml_string)
            .context("Failed to write config file")?;
        
        Ok(())
    }
}
