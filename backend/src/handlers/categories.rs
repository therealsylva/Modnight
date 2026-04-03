use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::SqlitePool;

use crate::models::ApiResponse;

#[derive(Debug, Clone, serde::Serialize)]
pub struct Category {
    pub id: String,
    pub label: String,
    pub count: i64,
}

pub async fn get_categories(
    State(db): State<SqlitePool>,
) -> Result<Json<ApiResponse<Vec<Category>>>, StatusCode> {
    let categories: Vec<(String, i64)> = sqlx::query_as(
        "SELECT category, COUNT(*) as count FROM plugins GROUP BY category ORDER BY count DESC",
    )
    .fetch_all(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let categories: Vec<Category> = categories
        .into_iter()
        .map(|(id, count)| {
            let label = id
                .split('-')
                .map(|s| {
                    let mut chars = s.chars();
                    match chars.next() {
                        None => String::new(),
                        Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
                    }
                })
                .collect::<Vec<_>>()
                .join(" ");
            Category { id, label, count }
        })
        .collect();

    Ok(Json(ApiResponse {
        data: categories,
        success: true,
        message: None,
    }))
}
