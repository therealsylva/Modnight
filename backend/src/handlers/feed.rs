use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::SqlitePool;

use crate::models::{ApiResponse, LiveFeedItem, LiveFeedItemJson};

pub async fn get_live_feed(
    State(db): State<SqlitePool>,
) -> Result<Json<ApiResponse<Vec<LiveFeedItemJson>>>, StatusCode> {
    let items: Vec<LiveFeedItem> = sqlx::query_as(
        "SELECT id, plugin_id, plugin_name, type, user, created_at FROM live_feed ORDER BY created_at DESC LIMIT 50",
    )
    .fetch_all(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let items_json: Vec<LiveFeedItemJson> = items.into_iter().map(LiveFeedItemJson::from).collect();

    Ok(Json(ApiResponse {
        data: items_json,
        success: true,
        message: None,
    }))
}
