use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Plugin {
    pub id: String,
    pub slug: Option<String>,
    pub title: String,
    pub author: String,
    pub downloads: i64,
    pub likes: i64,
    pub version: String,
    pub thumbnail: String,
    pub preview_video: Option<String>,
    pub description: String,
    pub category: String,
    pub tags: String,
    pub compatibility: String,
    pub file_size: String,
    pub file_path: Option<String>,
    pub changelog: Option<String>,
    pub installation_instructions: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PluginImage {
    pub id: String,
    pub plugin_id: String,
    pub image_path: String,
    pub sort_order: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginJson {
    pub id: String,
    pub slug: Option<String>,
    pub title: String,
    pub author: String,
    pub downloads: i64,
    pub likes: i64,
    pub version: String,
    pub thumbnail: String,
    pub images: Vec<String>,
    pub preview_video: Option<String>,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub dependencies: Vec<PluginDependency>,
    pub compatibility: String,
    pub file_size: String,
    pub changelog: String,
    pub installation_instructions: String,
    pub last_updated: String,
    pub created_at: String,
    pub updated_at: String,
}

impl From<Plugin> for PluginJson {
    fn from(plugin: Plugin) -> Self {
        Self {
            id: plugin.id,
            slug: plugin.slug,
            title: plugin.title,
            author: plugin.author,
            downloads: plugin.downloads,
            likes: plugin.likes,
            version: plugin.version,
            thumbnail: plugin.thumbnail,
            images: vec![],
            preview_video: plugin.preview_video,
            description: plugin.description,
            category: plugin.category,
            tags: plugin.tags.split(',').map(|s| s.trim().to_string()).collect(),
            dependencies: vec![],
            compatibility: plugin.compatibility,
            file_size: plugin.file_size,
            changelog: plugin.changelog.unwrap_or_default(),
            installation_instructions: plugin.installation_instructions.unwrap_or_default(),
            last_updated: format_ago(&plugin.updated_at),
            created_at: plugin.created_at.to_rfc3339(),
            updated_at: plugin.updated_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PluginDependency {
    pub id: String,
    pub plugin_id: String,
    pub name: String,
    pub version: String,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePluginRequest {
    pub title: String,
    pub author: String,
    pub version: String,
    pub thumbnail: String,
    pub preview_video: Option<String>,
    pub description: String,
    pub category: String,
    pub tags: Vec<String>,
    pub dependencies: Vec<CreateDependencyRequest>,
    pub compatibility: String,
    pub file_size: String,
    pub file_path: Option<String>,
    pub changelog: Option<String>,
    pub installation_instructions: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateDependencyRequest {
    pub name: String,
    pub version: String,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct LiveFeedItem {
    pub id: String,
    pub plugin_id: String,
    pub plugin_name: String,
    pub r#type: String,
    pub user: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiveFeedItemJson {
    pub id: String,
    pub r#type: String,
    pub plugin_name: String,
    pub user: Option<String>,
    pub timestamp: String,
}

impl From<LiveFeedItem> for LiveFeedItemJson {
    fn from(item: LiveFeedItem) -> Self {
        Self {
            id: item.id,
            r#type: item.r#type,
            plugin_name: item.plugin_name,
            user: item.user,
            timestamp: format_ago(&item.created_at),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub data: T,
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i32,
    pub per_page: i32,
    pub total_pages: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginStats {
    pub total_plugins: i64,
    pub total_downloads: i64,
    pub categories: std::collections::HashMap<String, i64>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PluginFilters {
    pub category: Option<String>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<i32>,
    pub per_page: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Setting {
    pub key: String,
    pub value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DonateSettings {
    pub btc: Option<String>,
    pub eth: Option<String>,
    pub sol: Option<String>,
    pub ltc: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnnouncementSettings {
    pub active: bool,
    pub title: String,
    pub body: String,
    pub link: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct BatchDownloadRequest {
    pub plugin_ids: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct BatchDownloadItem {
    pub id: String,
    pub title: String,
    pub download_url: String,
}

fn format_ago(dt: &DateTime<Utc>) -> String {
    let now = Utc::now();
    let diff = now.signed_duration_since(*dt);
    
    if diff.num_seconds() < 60 {
        "Just now".to_string()
    } else if diff.num_minutes() < 60 {
        format!("{}m ago", diff.num_minutes())
    } else if diff.num_hours() < 24 {
        format!("{}h ago", diff.num_hours())
    } else if diff.num_days() < 7 {
        format!("{} days ago", diff.num_days())
    } else if diff.num_weeks() < 4 {
        format!("{} weeks ago", diff.num_weeks())
    } else {
        format!("{} months ago", diff.num_days() / 30)
    }
}
