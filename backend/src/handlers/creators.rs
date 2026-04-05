use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::SqlitePool;
use uuid::Uuid;

use crate::models::{ApiResponse, CreatorApplicationRequest};

pub async fn apply_creator(
    State(db): State<SqlitePool>,
    Json(payload): Json<CreatorApplicationRequest>,
) -> Result<Json<ApiResponse<()>>, StatusCode> {
    if payload.email.is_empty() || !payload.email.contains('@') {
        return Err(StatusCode::BAD_REQUEST);
    }
    if payload.github.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let id = Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO creator_applications (id, email, github, status, created_at) VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)",
    )
    .bind(&id)
    .bind(&payload.email)
    .bind(&payload.github)
    .execute(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse {
        data: (),
        success: true,
        message: Some("Application submitted successfully".to_string()),
    }))
}
