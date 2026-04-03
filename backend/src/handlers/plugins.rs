use axum::{
    extract::{Path, Query, State},
    http::{StatusCode, HeaderMap, header::CONTENT_DISPOSITION},
    Json,
};
use sqlx::SqlitePool;
use std::path::PathBuf;
use uuid::Uuid;

use crate::models::{
    ApiResponse, PaginatedResponse, Plugin, PluginDependency, PluginFilters, PluginJson,
    PluginStats, BatchDownloadRequest, BatchDownloadItem, PluginImage,
};

pub async fn list_plugins(
    State(db): State<SqlitePool>,
    Query(filters): Query<PluginFilters>,
) -> Result<Json<PaginatedResponse<PluginJson>>, StatusCode> {
    let page = filters.page.unwrap_or(1).max(1);
    let per_page = filters.per_page.unwrap_or(20).min(100);
    let offset = (page - 1) * per_page;

    let category = filters.category.filter(|c| c != "all");
    let search = filters.search.as_ref().map(|s| format!("%{}%", s));

    let sort_by = filters.sort_by.as_deref().unwrap_or("downloads");
    let sort_column = match sort_by {
        "likes" => "likes",
        "updated" => "updated_at",
        "name" => "title",
        _ => "downloads",
    };
    let sort_order = if filters.sort_order.as_deref() == Some("asc") {
        "ASC"
    } else {
        "DESC"
    };
    let sort_clause = format!("ORDER BY {} {}", sort_column, sort_order);

    let category_clause = if category.is_some() { "AND category = ?" } else { "" };
    let search_clause = if search.is_some() { "AND (title LIKE ? OR description LIKE ?)" } else { "" };

    let query = format!(
        "SELECT * FROM plugins WHERE 1=1 {} {} {} LIMIT ? OFFSET ?",
        category_clause,
        search_clause,
        sort_clause,
    );

    let count_query = format!(
        "SELECT COUNT(*) FROM plugins WHERE 1=1 {} {}",
        category_clause,
        search_clause,
    );

    let mut sql_query = sqlx::query_as::<_, Plugin>(&query);
    let mut count_sql_query = sqlx::query_as::<_, (i64,)>(&count_query);

    if let Some(ref cat) = category {
        sql_query = sql_query.bind(cat);
        count_sql_query = count_sql_query.bind(cat);
    }

    if let Some(ref search_pattern) = search {
        sql_query = sql_query.bind(search_pattern).bind(search_pattern);
        count_sql_query = count_sql_query.bind(search_pattern).bind(search_pattern);
    }

    sql_query = sql_query.bind(per_page).bind(offset);

    let plugins = sql_query
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total: (i64,) = count_sql_query
        .fetch_one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let plugin_ids: Vec<String> = plugins.iter().map(|p| p.id.clone()).collect();
    
    let dependencies = if !plugin_ids.is_empty() {
        let placeholders = plugin_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let query_str = format!("SELECT * FROM plugin_dependencies WHERE plugin_id IN ({})", placeholders);
        let mut query = sqlx::query_as::<_, PluginDependency>(&query_str);
        for id in &plugin_ids {
            query = query.bind(id);
        }
        query.fetch_all(&db).await.unwrap_or_default()
    } else {
        vec![]
    };

    let images = if !plugin_ids.is_empty() {
        let placeholders = plugin_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
        let query_str = format!("SELECT * FROM plugin_images WHERE plugin_id IN ({}) ORDER BY sort_order", placeholders);
        let mut query = sqlx::query_as::<_, PluginImage>(&query_str);
        for id in &plugin_ids {
            query = query.bind(id);
        }
        query.fetch_all(&db).await.unwrap_or_default()
    } else {
        vec![]
    };

    let plugins_json: Vec<PluginJson> = plugins
        .into_iter()
        .map(|p| {
            let deps: Vec<PluginDependency> = dependencies
                .iter()
                .filter(|d| d.plugin_id == p.id)
                .cloned()
                .collect();
            let plugin_images: Vec<String> = images
                .iter()
                .filter(|i| i.plugin_id == p.id)
                .map(|i| i.image_path.clone())
                .collect();
            let mut json = PluginJson::from(p);
            json.dependencies = deps;
            json.images = plugin_images;
            json
        })
        .collect();

    Ok(Json(PaginatedResponse {
        data: plugins_json,
        total: total.0,
        page,
        per_page,
        total_pages: ((total.0 as f64) / (per_page as f64)).ceil() as i32,
    }))
}

pub async fn get_plugin(
    State(db): State<SqlitePool>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<PluginJson>>, StatusCode> {
    let plugin: Option<Plugin> = sqlx::query_as("SELECT * FROM plugins WHERE id = ?")
        .bind(&id)
        .fetch_optional(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match plugin {
        Some(p) => {
            let dependencies: Vec<PluginDependency> =
                sqlx::query_as("SELECT * FROM plugin_dependencies WHERE plugin_id = ?")
                    .bind(&p.id)
                    .fetch_all(&db)
                    .await
                    .unwrap_or_default();

            let images: Vec<PluginImage> =
                sqlx::query_as("SELECT * FROM plugin_images WHERE plugin_id = ? ORDER BY sort_order")
                    .bind(&p.id)
                    .fetch_all(&db)
                    .await
                    .unwrap_or_default();

            let mut json = PluginJson::from(p);
            json.dependencies = dependencies;
            json.images = images.iter().map(|i| i.image_path.clone()).collect();

            Ok(Json(ApiResponse {
                data: json,
                success: true,
                message: None,
            }))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn get_plugin_by_slug(
    State(db): State<SqlitePool>,
    Path(slug): Path<String>,
) -> Result<Json<ApiResponse<PluginJson>>, StatusCode> {
    let plugin: Option<Plugin> = sqlx::query_as("SELECT * FROM plugins WHERE slug = ?")
        .bind(&slug)
        .fetch_optional(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match plugin {
        Some(p) => {
            let dependencies: Vec<PluginDependency> =
                sqlx::query_as("SELECT * FROM plugin_dependencies WHERE plugin_id = ?")
                    .bind(&p.id)
                    .fetch_all(&db)
                    .await
                    .unwrap_or_default();

            let images: Vec<PluginImage> =
                sqlx::query_as("SELECT * FROM plugin_images WHERE plugin_id = ? ORDER BY sort_order")
                    .bind(&p.id)
                    .fetch_all(&db)
                    .await
                    .unwrap_or_default();

            let mut json = PluginJson::from(p);
            json.dependencies = dependencies;
            json.images = images.iter().map(|i| i.image_path.clone()).collect();

            Ok(Json(ApiResponse {
                data: json,
                success: true,
                message: None,
            }))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct SearchParams {
    pub q: String,
}

pub async fn search_plugins(
    State(db): State<SqlitePool>,
    Query(params): Query<SearchParams>,
) -> Result<Json<PaginatedResponse<PluginJson>>, StatusCode> {
    let filters = PluginFilters {
        category: None,
        search: Some(params.q),
        sort_by: None,
        sort_order: None,
        page: None,
        per_page: None,
    };
    list_plugins(State(db), Query(filters)).await
}

pub async fn get_stats(
    State(db): State<SqlitePool>,
) -> Result<Json<ApiResponse<PluginStats>>, StatusCode> {
    let total_plugins: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM plugins")
        .fetch_one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_downloads: (i64,) = sqlx::query_as("SELECT COALESCE(SUM(downloads), 0) FROM plugins")
        .fetch_one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let categories: Vec<(String, i64)> = sqlx::query_as(
        "SELECT category, COUNT(*) as count FROM plugins GROUP BY category",
    )
    .fetch_all(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut categories_map = std::collections::HashMap::new();
    for (cat, count) in categories {
        categories_map.insert(cat, count);
    }

    Ok(Json(ApiResponse {
        data: PluginStats {
            total_plugins: total_plugins.0,
            total_downloads: total_downloads.0,
            categories: categories_map,
        },
        success: true,
        message: None,
    }))
}

pub async fn download_plugin(
    State(db): State<SqlitePool>,
    Path(id): Path<String>,
) -> Result<(HeaderMap, Vec<u8>), StatusCode> {
    let plugin: Option<Plugin> = sqlx::query_as("SELECT * FROM plugins WHERE id = ?")
        .bind(&id)
        .fetch_optional(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match plugin {
        Some(p) => {
            sqlx::query("UPDATE plugins SET downloads = downloads + 1 WHERE id = ?")
                .bind(&id)
                .execute(&db)
                .await
                .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

            let feed_id = Uuid::new_v4().to_string();
            let _ = sqlx::query(
                "INSERT INTO live_feed (id, plugin_id, plugin_name, type, user) VALUES (?, ?, ?, 'download', NULL)",
            )
            .bind(&feed_id)
            .bind(&id)
            .bind(&p.title)
            .execute(&db)
            .await;

            let mut headers = HeaderMap::new();
            let filename = format!("{}.zip", p.title.replace(' ', "_"));
            headers.insert(
                CONTENT_DISPOSITION,
                format!("attachment; filename=\"{}\"", filename).parse().unwrap(),
            );

            let plugin_dir = PathBuf::from("./uploads/plugins");
            let file_path = plugin_dir.join(format!("{}.zip", id));

            if !file_path.starts_with(&plugin_dir) {
                tracing::error!("Path traversal attempt detected for plugin: {}", id);
                return Err(StatusCode::BAD_REQUEST);
            }

            let file_content = match std::fs::read(&file_path) {
                Ok(content) => content,
                Err(e) => {
                    tracing::error!("Failed to read plugin file: {}", e);
                    return Err(StatusCode::NOT_FOUND);
                }
            };

            Ok((headers, file_content))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn like_plugin(
    State(db): State<SqlitePool>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<i64>>, StatusCode> {
    let result = sqlx::query("UPDATE plugins SET likes = likes + 1 WHERE id = ?")
        .bind(&id)
        .execute(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if result.rows_affected() == 0 {
        return Err(StatusCode::NOT_FOUND);
    }

    let likes: (i64,) = sqlx::query_as("SELECT likes FROM plugins WHERE id = ?")
        .bind(&id)
        .fetch_one(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse {
        data: likes.0,
        success: true,
        message: Some("Like added".to_string()),
    }))
}

pub async fn get_likes(
    State(db): State<SqlitePool>,
    Path(id): Path<String>,
) -> Result<Json<ApiResponse<i64>>, StatusCode> {
    let likes: Option<(i64,)> = sqlx::query_as("SELECT likes FROM plugins WHERE id = ?")
        .bind(&id)
        .fetch_optional(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match likes {
        Some(l) => Ok(Json(ApiResponse {
            data: l.0,
            success: true,
            message: None,
        })),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn batch_download(
    State(db): State<SqlitePool>,
    Json(payload): Json<BatchDownloadRequest>,
) -> Result<Json<ApiResponse<Vec<BatchDownloadItem>>>, StatusCode> {
    let mut items = Vec::new();

    for id in payload.plugin_ids {
        let plugin: Option<Plugin> = sqlx::query_as("SELECT * FROM plugins WHERE id = ?")
            .bind(&id)
            .fetch_optional(&db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        if let Some(p) = plugin {
            sqlx::query("UPDATE plugins SET downloads = downloads + 1 WHERE id = ?")
                .bind(&id)
                .execute(&db)
                .await
                .ok();

            items.push(BatchDownloadItem {
                id: p.id,
                title: p.title,
                download_url: format!("/api/plugins/{}/download", id),
            });
        }
    }

    let count = items.len();
    Ok(Json(ApiResponse {
        data: items,
        success: true,
        message: Some(format!("{} plugins ready for download", count)),
    }))
}
