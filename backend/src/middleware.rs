use axum::{
    body::Body,
    http::{header, Request, StatusCode},
    response::{IntoResponse, Response},
};
use std::env;

pub struct AdminAuth;

impl AdminAuth {
    pub fn get_api_key() -> Option<String> {
        env::var("ADMIN_API_KEY").ok()
    }
}

pub async fn admin_auth_middleware(
    request: Request<Body>,
    next: axum::middleware::Next,
) -> Result<Response, StatusCode> {
    let expected_key = match AdminAuth::get_api_key() {
        Some(key) if !key.is_empty() => key,
        _ => {
            tracing::error!("ADMIN_API_KEY not configured - rejecting admin request");
            return Err(StatusCode::INTERNAL_SERVER_ERROR);
        }
    };
    
    let provided_key = request
        .headers()
        .get("X-Admin-Key")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    
    if provided_key == expected_key {
        Ok(next.run(request).await)
    } else {
        tracing::warn!("Unauthorized admin access attempt");
        Err(StatusCode::UNAUTHORIZED)
    }
}

pub async fn cache_control_middleware(
    request: Request<Body>,
    next: axum::middleware::Next,
) -> Response {
    let mut response = next.run(request).await;
    response.headers_mut().insert(
        header::CACHE_CONTROL,
        header::HeaderValue::from_static("no-store, no-cache, must-revalidate"),
    );
    response
}
