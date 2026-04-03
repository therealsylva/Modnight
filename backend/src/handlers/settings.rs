use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use sqlx::SqlitePool;

use crate::models::{ApiResponse, DonateSettings, AnnouncementSettings, Setting};

pub async fn get_donate_settings(
    State(db): State<SqlitePool>,
) -> Result<Json<ApiResponse<DonateSettings>>, StatusCode> {
    let settings: Vec<Setting> = sqlx::query_as("SELECT key, value FROM settings")
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut donate = DonateSettings {
        btc: None,
        eth: None,
        sol: None,
        ltc: None,
    };

    for setting in settings {
        let value = if setting.value.as_ref().map(|v| v.is_empty()).unwrap_or(true) {
            None
        } else {
            setting.value
        };

        match setting.key.as_str() {
            "btc_address" => donate.btc = value,
            "eth_address" => donate.eth = value,
            "sol_address" => donate.sol = value,
            "ltc_address" => donate.ltc = value,
            _ => {}
        }
    }

    Ok(Json(ApiResponse {
        data: donate,
        success: true,
        message: None,
    }))
}

pub async fn get_announcement(
    State(db): State<SqlitePool>,
) -> Result<Json<ApiResponse<AnnouncementSettings>>, StatusCode> {
    let settings: Vec<Setting> = sqlx::query_as(
        "SELECT key, value FROM settings WHERE key LIKE 'announcement_%'"
    )
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut announcement = AnnouncementSettings {
        active: false,
        title: String::new(),
        body: String::new(),
        link: None,
    };

    for setting in settings {
        let value = setting.value.unwrap_or_default();

        match setting.key.as_str() {
            "announcement_active" => announcement.active = value == "true",
            "announcement_title" => announcement.title = value,
            "announcement_body" => announcement.body = value,
            "announcement_link" => {
                announcement.link = if value.is_empty() { None } else { Some(value) }
            }
            _ => {}
        }
    }

    Ok(Json(ApiResponse {
        data: announcement,
        success: true,
        message: None,
    }))
}
