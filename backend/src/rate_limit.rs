use axum::{
    body::Body,
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use std::{
    collections::HashMap,
    sync::Arc,
    time::{Duration, Instant},
};
use tokio::sync::RwLock;
use std::sync::OnceLock;

static RATE_LIMITER: OnceLock<RateLimiter> = OnceLock::new();

pub fn get_rate_limiter() -> &'static RateLimiter {
    RATE_LIMITER.get_or_init(|| {
        RateLimiter::new(
            5000, // max requests
            60, // per 60 seconds
        )
    })
}

#[derive(Clone)]
pub struct RateLimiter {
    requests: Arc<RwLock<HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window_secs: u64) -> Self {
        Self {
            requests: Arc::new(RwLock::new(HashMap::new())),
            max_requests,
            window: Duration::from_secs(window_secs),
        }
    }

    pub async fn check(&self, ip: &str) -> Result<(), RateLimitExceeded> {
        let mut requests = self.requests.write().await;
        let now = Instant::now();

        let ip_requests = requests.entry(ip.to_string()).or_insert_with(Vec::new);

        ip_requests.retain(|t| now.duration_since(*t) < self.window);

        if ip_requests.len() >= self.max_requests {
            return Err(RateLimitExceeded {
                max_requests: self.max_requests,
                window_secs: self.window.as_secs() as u32,
            });
        }

        ip_requests.push(now);
        Ok(())
    }

    pub async fn cleanup(&self) {
        let mut requests = self.requests.write().await;
        let now = Instant::now();
        for ip_requests in requests.values_mut() {
            ip_requests.retain(|t| now.duration_since(*t) < self.window);
        }
        requests.retain(|_, v| !v.is_empty());
    }
}

#[derive(Debug, Clone)]
pub struct RateLimitExceeded {
    pub max_requests: usize,
    pub window_secs: u32,
}

impl axum::response::IntoResponse for RateLimitExceeded {
    fn into_response(self) -> Response<Body> {
        Response::builder()
            .status(StatusCode::TOO_MANY_REQUESTS)
            .header("X-RateLimit-Limit", self.max_requests)
            .header(
                "X-RateLimit-Remaining",
                0,
            )
            .header(
                "Retry-After",
                self.window_secs,
            )
            .body(Body::from(format!(
                "Rate limit exceeded. Try again in {} seconds.",
                self.window_secs
            )))
            .unwrap()
    }
}

pub async fn rate_limit_middleware(
    request: Request<Body>,
    next: Next,
) -> Response<Body> {
    let rate_limiter = get_rate_limiter();
    let ip = extract_ip(&request);

    if let Err(e) = rate_limiter.check(&ip).await {
        return e.into_response();
    }

    next.run(request).await
}

fn extract_ip(request: &Request<Body>) -> String {
    request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).to_string())
        .or_else(|| {
            request
                .headers()
                .get("x-real-ip")
                .and_then(|v| v.to_str().ok())
                .map(|s| s.to_string())
        })
        .unwrap_or_else(|| "unknown".to_string())
}
