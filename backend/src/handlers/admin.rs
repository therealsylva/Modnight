use axum::{
    extract::{State, Multipart},
    http::StatusCode,
    Json,
};
use sqlx::SqlitePool;
use uuid::Uuid;
use std::path::PathBuf;
use tokio::fs;
use tokio::io::AsyncWriteExt;

use crate::models::{ApiResponse, Plugin, PluginJson, PluginDependency, CreateDependencyRequest, PluginImage};

fn generate_slug(title: &str) -> String {
    title.to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() {
                c
            } else {
                '-'
            }
        })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

fn format_file_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.1} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.1} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.1} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

const ALLOWED_PLUGIN_EXTENSIONS: [&str; 3] = ["zip", "rar", "7z"];
const ALLOWED_IMAGE_EXTENSIONS: [&str; 5] = ["png", "jpg", "jpeg", "webp", "gif"];
const MAX_FILE_SIZE: u64 = 100 * 1024 * 1024; // 100MB

fn validate_plugin_extension(filename: &str) -> Result<String, StatusCode> {
    tracing::info!("Validating extension for: {}", filename);
    
    let ext = std::path::Path::new(filename)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());
    
    tracing::info!("Extracted extension: {:?}", ext);
    
    match ext {
        Some(ext) if ALLOWED_PLUGIN_EXTENSIONS.contains(&ext.as_str()) => {
            tracing::info!("Extension {} is allowed", ext);
            Ok(ext)
        }
        Some(ext) => {
            tracing::warn!("Rejected file with disallowed extension: {}", ext);
            Err(StatusCode::BAD_REQUEST)
        }
        None => {
            tracing::warn!("Rejected file with no extension");
            Err(StatusCode::BAD_REQUEST)
        }
    }
}

fn validate_image_extension(filename: &str) -> Result<String, StatusCode> {
    let ext = std::path::Path::new(filename)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());
    
    match ext {
        Some(ext) if ALLOWED_IMAGE_EXTENSIONS.contains(&ext.as_str()) => Ok(ext),
        Some(ext) => {
            tracing::warn!("Rejected image with disallowed extension: {}", ext);
            Err(StatusCode::BAD_REQUEST)
        }
        None => {
            tracing::warn!("Rejected image with no extension");
            Err(StatusCode::BAD_REQUEST)
        }
    }
}

pub async fn create_plugin(
    State(db): State<SqlitePool>,
    mut multipart: Multipart,
) -> Result<Json<ApiResponse<PluginJson>>, StatusCode> {
    tracing::info!("Admin plugin create endpoint called");
    let id = Uuid::new_v4().to_string();
    
    let mut title: Option<String> = None;
    let mut author: Option<String> = None;
    let mut version: Option<String> = None;
    let mut description: Option<String> = None;
    let mut category: Option<String> = None;
    let mut tags: Option<String> = None;
    let mut compatibility: Option<String> = None;
    let mut preview_video: Option<String> = None;
    let mut dependencies: Option<String> = None;
    let mut changelog: Option<String> = None;
    let mut installation_instructions: Option<String> = None;
    let mut file_size: Option<String> = None;
    let mut file_path: Option<String> = None;
    let mut thumbnail_path: Option<String> = None;
    let mut images: Vec<(String, i32)> = Vec::new();

    let upload_dir = PathBuf::from("uploads");
    let plugin_dir = upload_dir.join("plugins");
    let thumb_dir = upload_dir.join("thumbnails");
    let images_dir = upload_dir.join("images");
    
    fs::create_dir_all(&plugin_dir).await.map_err(|e| {
        tracing::error!("Failed to create plugin_dir: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    fs::create_dir_all(&thumb_dir).await.map_err(|e| {
        tracing::error!("Failed to create thumb_dir: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    fs::create_dir_all(&images_dir).await.map_err(|e| {
        tracing::error!("Failed to create images_dir: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("Upload directories ready: {:?}", upload_dir);

    let mut image_sort_order = 0;

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        tracing::error!("Multipart field error: {:?}", e);
        StatusCode::BAD_REQUEST
    })? {
        let field_name = field.name().unwrap_or("").to_string();
        tracing::debug!("Processing field: {}", field_name);

        match field_name.as_str() {
            "file" => {
                tracing::info!("Processing file field");
                
                let filename = match field.file_name() {
                    Some(name) => name.to_string(),
                    None => {
                        tracing::error!("No filename provided in file field");
                        return Err(StatusCode::BAD_REQUEST);
                    }
                };
                
                tracing::info!("File name from multipart: {}", filename);
                
                let extension = validate_plugin_extension(&filename)?;

                tracing::info!("Creating filename with id: {}", id);
                
                let filename = format!("{}.{}", id, extension);
                let filepath = plugin_dir.join(&filename);
                
                tracing::debug!("Reading file bytes from multipart");

                let data = field.bytes().await.map_err(|e| {
                    tracing::error!("Failed to read bytes: {:?}", e);
                    StatusCode::BAD_REQUEST
                })?;
                let size = data.len();
                
                tracing::debug!("Read {} bytes", size);

                if size > MAX_FILE_SIZE as usize {
                    tracing::warn!("File exceeds max size: {} > {}", size, MAX_FILE_SIZE);
                    return Err(StatusCode::BAD_REQUEST);
                }

                tracing::debug!("Writing file to: {:?}", filepath);
                
                let mut file = fs::File::create(&filepath).await.map_err(|e| {
                    tracing::error!("Failed to create file: {:?}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
                file.write_all(&data).await.map_err(|e| {
                    tracing::error!("Failed to write file: {:?}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
                
                tracing::debug!("File written successfully");

                file_size = Some(format_file_size(size as u64));
                file_path = Some(filepath.to_string_lossy().to_string());
            }
            "thumbnail" => {
                let filename = field.file_name()
                    .ok_or(StatusCode::BAD_REQUEST)?
                    .to_string();
                
                let extension = validate_image_extension(&filename)?;

                let filename = format!("{}.{}", id, extension);
                let filepath = thumb_dir.join(&filename);

                let data = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;

                let mut file = fs::File::create(&filepath).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                file.write_all(&data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                thumbnail_path = Some(format!("/uploads/thumbnails/{}", filename));
            }
            "images" => {
                let filename = field.file_name()
                    .ok_or(StatusCode::BAD_REQUEST)?
                    .to_string();
                
                let extension = validate_image_extension(&filename)?;

                let image_id = Uuid::new_v4().to_string();
                let filename = format!("{}.{}", image_id, extension);
                let filepath = images_dir.join(&filename);

                let data = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;

                let mut file = fs::File::create(&filepath).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                file.write_all(&data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                images.push((format!("/uploads/images/{}", filename), image_sort_order));
                image_sort_order += 1;
            }
            "title" => {
                title = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "author" => {
                author = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "version" => {
                version = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "description" => {
                description = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "category" => {
                category = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "tags" => {
                tags = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "compatibility" => {
                compatibility = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "preview_video" => {
                preview_video = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "dependencies" => {
                dependencies = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "changelog" => {
                changelog = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "installation_instructions" => {
                installation_instructions = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            _ => {}
        }
    }

    let title = title.ok_or_else(|| {
        tracing::error!("Missing title");
        StatusCode::BAD_REQUEST
    })?;
    let author = author.ok_or_else(|| {
        tracing::error!("Missing author");
        StatusCode::BAD_REQUEST
    })?;
    let version = version.ok_or_else(|| {
        tracing::error!("Missing version");
        StatusCode::BAD_REQUEST
    })?;
    let description = description.ok_or_else(|| {
        tracing::error!("Missing description");
        StatusCode::BAD_REQUEST
    })?;
    let category = category.ok_or_else(|| {
        tracing::error!("Missing category");
        StatusCode::BAD_REQUEST
    })?;
    let compatibility = compatibility.ok_or_else(|| {
        tracing::error!("Missing compatibility");
        StatusCode::BAD_REQUEST
    })?;
    let file_size = file_size.ok_or_else(|| {
        tracing::error!("Missing file");
        StatusCode::BAD_REQUEST
    })?;
    let file_path = file_path.ok_or_else(|| {
        tracing::error!("Missing file path");
        StatusCode::BAD_REQUEST
    })?;
    let thumbnail = thumbnail_path.unwrap_or_else(|| "/uploads/thumbnails/default.png".to_string());
    let tags = tags.unwrap_or_default();
    let changelog = changelog.unwrap_or_default();
    let installation_instructions = installation_instructions.unwrap_or_default();
    
    let base_slug = generate_slug(&title);
    let slug = format!("{}-{}", base_slug, &id[..8]);

    let result = sqlx::query(
        r#"
        INSERT INTO plugins (id, slug, title, author, version, thumbnail, preview_video, description, category, tags, compatibility, file_size, file_path, changelog, installation_instructions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&slug)
    .bind(&title)
    .bind(&author)
    .bind(&version)
    .bind(&thumbnail)
    .bind(&preview_video)
    .bind(&description)
    .bind(&category)
    .bind(&tags)
    .bind(&compatibility)
    .bind(&file_size)
    .bind(&file_path)
    .bind(&changelog)
    .bind(&installation_instructions)
    .execute(&db)
    .await;

    match result {
        Ok(_) => {
            if let Some(deps_json) = dependencies {
                if let Ok(deps) = serde_json::from_str::<Vec<CreateDependencyRequest>>(&deps_json) {
                    for dep in deps {
                        let dep_id = Uuid::new_v4().to_string();
                        let _ = sqlx::query(
                            "INSERT INTO plugin_dependencies (id, plugin_id, name, version, required) VALUES (?, ?, ?, ?, ?)",
                        )
                        .bind(&dep_id)
                        .bind(&id)
                        .bind(&dep.name)
                        .bind(&dep.version)
                        .bind(dep.required)
                        .execute(&db)
                        .await;
                    }
                }
            }

            for (image_path, sort_order) in images {
                let image_id = Uuid::new_v4().to_string();
                let _ = sqlx::query(
                    "INSERT INTO plugin_images (id, plugin_id, image_path, sort_order) VALUES (?, ?, ?, ?)",
                )
                .bind(&image_id)
                .bind(&id)
                .bind(&image_path)
                .bind(sort_order)
                .execute(&db)
                .await;
            }

            let feed_id = Uuid::new_v4().to_string();
            let _ = sqlx::query(
                "INSERT INTO live_feed (id, plugin_id, plugin_name, type, user) VALUES (?, ?, ?, 'upload', NULL)",
            )
            .bind(&feed_id)
            .bind(&id)
            .bind(&title)
            .execute(&db)
            .await;

            let plugin: Plugin = sqlx::query_as("SELECT * FROM plugins WHERE id = ?")
                .bind(&id)
                .fetch_one(&db)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let images: Vec<PluginImage> = sqlx::query_as("SELECT * FROM plugin_images WHERE plugin_id = ? ORDER BY sort_order")
                .bind(&id)
                .fetch_all(&db)
                .await
                .unwrap_or_default();

            let mut json = PluginJson::from(plugin);
            json.images = images.iter().map(|i| i.image_path.clone()).collect();

            Ok(Json(ApiResponse {
                data: json,
                success: true,
                message: Some("Plugin uploaded successfully".to_string()),
            }))
        }
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn update_plugin(
    State(db): State<SqlitePool>,
    mut multipart: Multipart,
) -> Result<Json<ApiResponse<PluginJson>>, StatusCode> {
    let mut id: Option<String> = None;
    let mut title: Option<String> = None;
    let mut author: Option<String> = None;
    let mut version: Option<String> = None;
    let mut description: Option<String> = None;
    let mut category: Option<String> = None;
    let mut tags: Option<String> = None;
    let mut compatibility: Option<String> = None;
    let mut preview_video: Option<String> = None;
    let mut changelog: Option<String> = None;
    let mut installation_instructions: Option<String> = None;
    let mut file_size: Option<String> = None;
    let mut file_path: Option<String> = None;
    let mut thumbnail_path: Option<String> = None;
    let mut new_images: Vec<(String, i32)> = Vec::new();

    let upload_dir = PathBuf::from("uploads");
    let plugin_dir = upload_dir.join("plugins");
    let thumb_dir = upload_dir.join("thumbnails");
    let images_dir = upload_dir.join("images");
    
    let _ = fs::create_dir_all(&plugin_dir).await;
    let _ = fs::create_dir_all(&thumb_dir).await;
    let _ = fs::create_dir_all(&images_dir).await;

    while let Some(field) = multipart.next_field().await.map_err(|_| StatusCode::BAD_REQUEST)? {
        let field_name = field.name().unwrap_or("").to_string();

        match field_name.as_str() {
            "id" => {
                id = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "file" => {
                let plugin_id = id.clone().ok_or(StatusCode::BAD_REQUEST)?;
                
                let filename = field.file_name()
                    .ok_or(StatusCode::BAD_REQUEST)?
                    .to_string();
                
                let extension = validate_plugin_extension(&filename)?;

                let filename = format!("{}.{}", plugin_id, extension);
                let filepath = plugin_dir.join(&filename);

                let data = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;
                let size = data.len();

                let mut file = fs::File::create(&filepath).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                file.write_all(&data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                file_size = Some(format_file_size(size as u64));
                file_path = Some(filepath.to_string_lossy().to_string());
            }
            "thumbnail" => {
                let plugin_id = id.clone().ok_or(StatusCode::BAD_REQUEST)?;
                
                let filename = field.file_name()
                    .ok_or(StatusCode::BAD_REQUEST)?
                    .to_string();
                
                let extension = validate_image_extension(&filename)?;

                let filename = format!("{}.{}", plugin_id, extension);
                let filepath = thumb_dir.join(&filename);

                let data = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;

                let mut file = fs::File::create(&filepath).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                file.write_all(&data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                thumbnail_path = Some(format!("/uploads/thumbnails/{}", filename));
            }
            "images" => {
                let filename = field.file_name()
                    .ok_or(StatusCode::BAD_REQUEST)?
                    .to_string();
                
                let extension = validate_image_extension(&filename)?;

                let image_id = Uuid::new_v4().to_string();
                let filename = format!("{}.{}", image_id, extension);
                let filepath = images_dir.join(&filename);

                let data = field.bytes().await.map_err(|_| StatusCode::BAD_REQUEST)?;

                let mut file = fs::File::create(&filepath).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                file.write_all(&data).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

                let existing_count: (i32,) = sqlx::query_as("SELECT COUNT(*) FROM plugin_images WHERE plugin_id = ?")
                    .bind(id.clone().unwrap_or_default())
                    .fetch_one(&db)
                    .await
                    .unwrap_or((0,));

                new_images.push((format!("/uploads/images/{}", filename), existing_count.0));
            }
            "title" => {
                title = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "author" => {
                author = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "version" => {
                version = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "description" => {
                description = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "category" => {
                category = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "tags" => {
                tags = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "compatibility" => {
                compatibility = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "preview_video" => {
                preview_video = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "changelog" => {
                changelog = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            "installation_instructions" => {
                installation_instructions = Some(field.text().await.map_err(|_| StatusCode::BAD_REQUEST)?);
            }
            _ => {}
        }
    }

    let id = id.ok_or(StatusCode::BAD_REQUEST)?;

    let mut updates = Vec::new();
    let mut binds: Vec<String> = Vec::new();

    if let Some(v) = title { updates.push("title = ?"); binds.push(v); }
    if let Some(v) = author { updates.push("author = ?"); binds.push(v); }
    if let Some(v) = version { updates.push("version = ?"); binds.push(v); }
    if let Some(v) = description { updates.push("description = ?"); binds.push(v); }
    if let Some(v) = category { updates.push("category = ?"); binds.push(v); }
    if let Some(v) = tags { updates.push("tags = ?"); binds.push(v); }
    if let Some(v) = compatibility { updates.push("compatibility = ?"); binds.push(v); }
    if let Some(v) = preview_video { updates.push("preview_video = ?"); binds.push(v); }
    if let Some(v) = changelog { updates.push("changelog = ?"); binds.push(v); }
    if let Some(v) = installation_instructions { updates.push("installation_instructions = ?"); binds.push(v); }
    if let Some(v) = file_size { updates.push("file_size = ?"); binds.push(v); }
    if let Some(v) = file_path { updates.push("file_path = ?"); binds.push(v); }
    if let Some(v) = thumbnail_path { updates.push("thumbnail = ?"); binds.push(v); }

    if !updates.is_empty() {
        updates.push("updated_at = CURRENT_TIMESTAMP");
        let sql = format!("UPDATE plugins SET {} WHERE id = ?", updates.join(", "));
        let mut query = sqlx::query(&sql);
        for bind in binds {
            query = query.bind(bind);
        }
        query = query.bind(&id);
        query.execute(&db).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    for (image_path, sort_order) in new_images {
        let image_id = Uuid::new_v4().to_string();
        let _ = sqlx::query(
            "INSERT INTO plugin_images (id, plugin_id, image_path, sort_order) VALUES (?, ?, ?, ?)",
        )
        .bind(&image_id)
        .bind(&id)
        .bind(&image_path)
        .bind(sort_order)
        .execute(&db)
        .await;
    }

    let plugin: Plugin = sqlx::query_as("SELECT * FROM plugins WHERE id = ?")
        .bind(&id)
        .fetch_one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let images: Vec<PluginImage> = sqlx::query_as("SELECT * FROM plugin_images WHERE plugin_id = ? ORDER BY sort_order")
        .bind(&id)
        .fetch_all(&db)
        .await
        .unwrap_or_default();

    let mut json = PluginJson::from(plugin);
    json.images = images.iter().map(|i| i.image_path.clone()).collect();

    Ok(Json(ApiResponse {
        data: json,
        success: true,
        message: Some("Plugin updated successfully".to_string()),
    }))
}

pub async fn delete_plugin(
    State(db): State<SqlitePool>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Result<StatusCode, StatusCode> {
    let plugin: Option<Plugin> = sqlx::query_as("SELECT * FROM plugins WHERE id = ?")
        .bind(&id)
        .fetch_optional(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if let Some(p) = plugin {
        if let Some(path) = p.file_path {
            let _ = fs::remove_file(&path).await;
        }
        
        let thumb_path = format!("uploads/thumbnails/{}.png", id);
        let _ = fs::remove_file(&thumb_path).await;

        let images: Vec<PluginImage> = sqlx::query_as("SELECT * FROM plugin_images WHERE plugin_id = ?")
            .bind(&id)
            .fetch_all(&db)
            .await
            .unwrap_or_default();

        for image in images {
            let _ = fs::remove_file(&image.image_path.trim_start_matches('/')).await;
        }

        sqlx::query("DELETE FROM plugins WHERE id = ?")
            .bind(&id)
            .execute(&db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

#[derive(serde::Deserialize)]
pub struct FreezeRequest {
    pub frozen: bool,
}

pub async fn freeze_plugin(
    State(db): State<SqlitePool>,
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(payload): Json<FreezeRequest>,
) -> Result<Json<crate::models::ApiResponse<()>>, StatusCode> {
    let result = sqlx::query("UPDATE plugins SET is_frozen = ? WHERE id = ?")
        .bind(payload.frozen)
        .bind(&id)
        .execute(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(Json(crate::models::ApiResponse {
        data: (),
        success: true,
        message: Some(if payload.frozen {
            "Plugin frozen".to_string()
        } else {
            "Plugin unfrozen".to_string()
        }),
    }))
}

#[derive(serde::Deserialize)]
pub struct SettingRequest {
    pub key: String,
    pub value: String,
}

pub async fn update_setting(
    State(db): State<SqlitePool>,
    Json(payload): Json<SettingRequest>,
) -> Result<Json<ApiResponse<String>>, StatusCode> {
    let allowed_keys = [
        "btc_address",
        "eth_address", 
        "ltc_address",
        "sol_address",
        "xmr_address",
        "announcement_active",
        "announcement_title",
        "announcement_body",
        "announcement_link",
    ];

    if !allowed_keys.contains(&payload.key.as_str()) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let result = sqlx::query(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
    )
    .bind(&payload.key)
    .bind(&payload.value)
    .execute(&db)
    .await;

    match result {
        Ok(_) => Ok(Json(ApiResponse {
            data: "Setting updated successfully".to_string(),
            success: true,
            message: None,
        })),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

#[derive(serde::Serialize, sqlx::FromRow)]
pub struct PluginReport {
    pub id: String,
    pub plugin_id: String,
    pub reason: String,
    pub created_at: String,
}

pub async fn list_reports(
    State(db): State<SqlitePool>,
) -> Result<Json<crate::models::ApiResponse<Vec<PluginReport>>>, StatusCode> {
    let reports: Vec<PluginReport> = sqlx::query_as(
        "SELECT id, plugin_id, reason, CAST(created_at AS TEXT) as created_at FROM plugin_reports ORDER BY created_at DESC"
    )
    .fetch_all(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(crate::models::ApiResponse {
        data: reports,
        success: true,
        message: None,
    }))
}

#[derive(serde::Serialize, sqlx::FromRow)]
pub struct CreatorApplication {
    pub id: String,
    pub email: String,
    pub github: String,
    pub status: String,
    pub created_at: String,
}

pub async fn list_applications(
    State(db): State<SqlitePool>,
) -> Result<Json<crate::models::ApiResponse<Vec<CreatorApplication>>>, StatusCode> {
    let apps: Vec<CreatorApplication> = sqlx::query_as(
        "SELECT id, email, github, status, CAST(created_at AS TEXT) as created_at FROM creator_applications ORDER BY created_at DESC"
    )
    .fetch_all(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(crate::models::ApiResponse {
        data: apps,
        success: true,
        message: None,
    }))
}

#[derive(serde::Deserialize)]
pub struct ApplicationStatusRequest {
    pub status: String,
}

pub async fn update_application(
    State(db): State<SqlitePool>,
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(payload): Json<ApplicationStatusRequest>,
) -> Result<Json<crate::models::ApiResponse<()>>, StatusCode> {
    let allowed = ["approved", "rejected", "pending"];
    if !allowed.contains(&payload.status.as_str()) {
        return Err(StatusCode::BAD_REQUEST);
    }

    let result = sqlx::query("UPDATE creator_applications SET status = ? WHERE id = ?")
        .bind(&payload.status)
        .bind(&id)
        .execute(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(Json(crate::models::ApiResponse {
        data: (),
        success: true,
        message: Some(format!("Application {}", payload.status)),
    }))
}
