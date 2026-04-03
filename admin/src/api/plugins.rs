use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use reqwest::multipart;
use serde::Deserialize;
use std::path::Path;

use super::ApiClient;

#[derive(Debug, Clone, Deserialize)]
pub struct Plugin {
    pub id: String,
    pub title: String,
    pub author: String,
    pub version: String,
    pub thumbnail: String,
    pub images: Vec<String>,
    pub preview_video: Option<String>,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub dependencies: Vec<Dependency>,
    pub compatibility: String,
    pub file_size: String,
    pub changelog: Option<String>,
    pub installation_instructions: Option<String>,
    pub likes: i32,
    pub downloads: i32,
    pub last_updated: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Dependency {
    pub name: String,
    pub version: String,
    pub required: bool,
}

#[derive(Debug, Deserialize)]
pub struct ApiResponse<T> {
    pub data: T,
    #[serde(default)]
    pub success: bool,
    #[serde(default)]
    pub message: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: i32,
    pub page: i32,
    pub per_page: i32,
    pub total_pages: i32,
}

#[derive(Debug, Deserialize)]
pub struct PluginStats {
    pub total_plugins: i32,
    pub total_downloads: i32,
    #[serde(default)]
    pub total_likes: i32,
    #[serde(default)]
    pub categories: std::collections::HashMap<String, i32>,
}

#[derive(Debug, Default)]
pub struct UploadOptions {
    pub title: String,
    pub author: String,
    pub version: String,
    pub description: String,
    pub category: String,
    pub tags: Option<String>,
    pub compatibility: String,
    pub preview_video: Option<String>,
    pub changelog: Option<String>,
    pub installation_instructions: Option<String>,
    pub file_path: String,
    pub thumbnail_path: Option<String>,
    pub images_paths: Vec<String>,
}

#[derive(Debug, Default)]
pub struct UpdateOptions {
    pub id: String,
    pub title: Option<String>,
    pub author: Option<String>,
    pub version: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub compatibility: Option<String>,
    pub file_path: Option<String>,
    pub thumbnail_path: Option<String>,
    pub changelog: Option<String>,
    pub installation: Option<String>,
    pub images: Option<Vec<String>>,
}

impl ApiClient {
    pub async fn list_plugins(&self, category: Option<&str>) -> Result<Vec<Plugin>> {
        let mut path = "/api/plugins?limit=100".to_string();
        if let Some(cat) = category {
            path.push_str(&format!("&category={}", urlencoding::encode(cat)));
        }
        
        let response: PaginatedResponse<Plugin> = self.get(&path).await?;
        Ok(response.data)
    }

    pub async fn get_plugin(&self, id: &str) -> Result<Plugin> {
        let path = format!("/api/plugins/{}", id);
        let response: ApiResponse<Plugin> = self.get(&path).await?;
        Ok(response.data)
    }

    pub async fn get_stats(&self) -> Result<PluginStats> {
        let response: ApiResponse<PluginStats> = self.get("/api/plugins/stats").await?;
        Ok(response.data)
    }

    pub async fn delete_plugin(&self, id: &str) -> Result<()> {
        let path = format!("/api/admin/plugins/{}", id);
        self.delete(&path).await
    }

    pub async fn upload_plugin(&self, options: &UploadOptions) -> Result<Plugin> {
        let mut form = multipart::Form::new();

        form = form.text("title", options.title.clone());
        form = form.text("author", options.author.clone());
        form = form.text("version", options.version.clone());
        form = form.text("description", options.description.clone());
        form = form.text("category", options.category.clone());
        form = form.text("compatibility", options.compatibility.clone());

        if let Some(ref tags) = options.tags {
            form = form.text("tags", tags.clone());
        }
        if let Some(ref video) = options.preview_video {
            form = form.text("preview_video", video.clone());
        }
        if let Some(ref changelog) = options.changelog {
            form = form.text("changelog", changelog.clone());
        }
        if let Some(ref instructions) = options.installation_instructions {
            form = form.text("installation_instructions", instructions.clone());
        }

        let file_path = Path::new(&options.file_path);
        let file_name = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("plugin.zip")
            .to_string();
        let file_bytes = std::fs::read(file_path)
            .with_context(|| format!("Failed to read plugin file: {}", options.file_path))?;
        let file_part = multipart::Part::bytes(file_bytes)
            .file_name(file_name)
            .mime_str("application/zip")?;
        form = form.part("file", file_part);

        if let Some(ref thumb_path) = options.thumbnail_path {
            let path = Path::new(thumb_path);
            let file_name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("thumbnail.png")
                .to_string();
            if let Ok(bytes) = std::fs::read(path) {
                let mime = if thumb_path.ends_with(".jpg") || thumb_path.ends_with(".jpeg") {
                    "image/jpeg"
                } else if thumb_path.ends_with(".webp") {
                    "image/webp"
                } else if thumb_path.ends_with(".gif") {
                    "image/gif"
                } else {
                    "image/png"
                };
                let part = multipart::Part::bytes(bytes)
                    .file_name(file_name)
                    .mime_str(mime)?;
                form = form.part("thumbnail", part);
            }
        }

        for img_path in &options.images_paths {
            let path = Path::new(img_path);
            let file_name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("image.png")
                .to_string();
            if let Ok(bytes) = std::fs::read(path) {
                let mime = if img_path.ends_with(".jpg") || img_path.ends_with(".jpeg") {
                    "image/jpeg"
                } else if img_path.ends_with(".webp") {
                    "image/webp"
                } else if img_path.ends_with(".gif") {
                    "image/gif"
                } else {
                    "image/png"
                };
                let part = multipart::Part::bytes(bytes)
                    .file_name(file_name)
                    .mime_str(mime)?;
                form = form.part("images", part);
            }
        }

        let response: ApiResponse<Plugin> = self.post_multipart("/api/admin/plugins", form).await?;
        Ok(response.data)
    }

    pub async fn update_plugin(&self, options: &UpdateOptions) -> Result<Plugin> {
        let mut form = multipart::Form::new();

        form = form.text("id", options.id.clone());

        if let Some(ref title) = options.title {
            form = form.text("title", title.clone());
        }
        if let Some(ref author) = options.author {
            form = form.text("author", author.clone());
        }
        if let Some(ref version) = options.version {
            form = form.text("version", version.clone());
        }
        if let Some(ref description) = options.description {
            form = form.text("description", description.clone());
        }
        if let Some(ref category) = options.category {
            form = form.text("category", category.clone());
        }
        if let Some(ref compatibility) = options.compatibility {
            form = form.text("compatibility", compatibility.clone());
        }

        if let Some(ref changelog) = options.changelog {
            form = form.text("changelog", changelog.clone());
        }
        if let Some(ref installation) = options.installation {
            form = form.text("installation_instructions", installation.clone());
        }

        if let Some(ref thumbnail_path) = options.thumbnail_path {
            let path = Path::new(thumbnail_path);
            let file_name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("thumbnail.png")
                .to_string();
            let file_bytes = std::fs::read(path)
                .with_context(|| format!("Failed to read thumbnail: {}", thumbnail_path))?;
            let mime = if file_name.ends_with(".png") {
                "image/png"
            } else if file_name.ends_with(".jpg") || file_name.ends_with(".jpeg") {
                "image/jpeg"
            } else if file_name.ends_with(".gif") {
                "image/gif"
            } else {
                "image/png"
            };
            let file_part = multipart::Part::bytes(file_bytes)
                .file_name(file_name)
                .mime_str(mime)?;
            form = form.part("thumbnail", file_part);
        }

        if let Some(ref file_path) = options.file_path {
            let path = Path::new(file_path);
            let file_name = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("plugin.zip")
                .to_string();
            let file_bytes = std::fs::read(path)
                .with_context(|| format!("Failed to read plugin file: {}", file_path))?;
            let file_part = multipart::Part::bytes(file_bytes)
                .file_name(file_name)
                .mime_str("application/zip")?;
            form = form.part("file", file_part);
        }

        if let Some(ref images) = options.images {
            for image_path in images {
                let path = Path::new(image_path);
                if !path.exists() {
                    continue;
                }
                let file_name = path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("image.png")
                    .to_string();
                let file_bytes = match std::fs::read(path) {
                    Ok(bytes) => bytes,
                    Err(e) => {
                        eprintln!("Warning: Failed to read image {}: {}", image_path, e);
                        continue;
                    }
                };
                let mime = if file_name.ends_with(".png") {
                    "image/png"
                } else if file_name.ends_with(".jpg") || file_name.ends_with(".jpeg") {
                    "image/jpeg"
                } else if file_name.ends_with(".gif") {
                    "image/gif"
                } else {
                    "image/png"
                };
                let file_part = multipart::Part::bytes(file_bytes)
                    .file_name(file_name)
                    .mime_str(mime)?;
                form = form.part("images", file_part);
            }
        }

        let response: ApiResponse<Plugin> = self.put_multipart(&format!("/api/admin/plugins/{}", options.id), form).await?;
        Ok(response.data)
    }
}
