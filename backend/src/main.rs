use axum::{
    routing::{get, post, put, delete},
    Router,
    middleware as axum_middleware,
};
use axum::extract::DefaultBodyLimit;
use tower::ServiceBuilder;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod handlers;
mod middleware;
mod models;
mod rate_limit;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "stubbedseek_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    if std::env::var("ADMIN_API_KEY").is_err() || std::env::var("ADMIN_API_KEY").unwrap_or_default().is_empty() {
        tracing::error!("FATAL: ADMIN_API_KEY environment variable is not set!");
        tracing::error!("Please set ADMIN_API_KEY before starting the server.");
        std::process::exit(1);
    }

    let db = db::init_db().await?;

    let admin_routes = Router::new()
        .route("/plugins", post(handlers::admin::create_plugin))
        .route("/plugins/:id", put(handlers::admin::update_plugin))
        .route("/plugins/:id", delete(handlers::admin::delete_plugin))
        .route("/plugins/:id/freeze", post(handlers::admin::freeze_plugin))
        .route("/reports", get(handlers::admin::list_reports))
        .route("/creators", get(handlers::admin::list_applications))
        .route("/creators/:id", post(handlers::admin::update_application))
        .route("/settings", post(handlers::admin::update_setting))
        .route_layer(axum_middleware::from_fn(middleware::admin_auth_middleware));

    let app = Router::new()
        .route("/api/plugins", get(handlers::plugins::list_plugins))
        .route("/api/plugins/stats", get(handlers::plugins::get_stats))
        .route("/api/plugins/search", get(handlers::plugins::search_plugins))
        .route("/api/plugins/slug/:slug", get(handlers::plugins::get_plugin_by_slug))
        .route("/api/plugins/:id", get(handlers::plugins::get_plugin))
        .route("/api/plugins/:id/download", get(handlers::plugins::download_plugin))
        .route("/api/plugins/:id/like", post(handlers::plugins::like_plugin))
        .route("/api/plugins/:id/likes", get(handlers::plugins::get_likes))
        .route("/api/plugins/batch-download", post(handlers::plugins::batch_download))
        .route("/api/plugins/:id/report", post(handlers::plugins::report_plugin))
        .route("/api/creators/apply", post(handlers::creators::apply_creator))
        .route("/api/feed/live", get(handlers::feed::get_live_feed))
        .route("/api/categories", get(handlers::categories::get_categories))
        .route("/api/settings/donate", get(handlers::settings::get_donate_settings))
        .route("/api/announcements", get(handlers::settings::get_announcement))
        .nest("/api/admin", admin_routes)
        .nest_service("/uploads", ServeDir::new("uploads"))
        .layer(DefaultBodyLimit::max(50 * 1024 * 1024)) // 50MB limit
        .layer(axum_middleware::from_fn(rate_limit::rate_limit_middleware))
        .layer(CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any))
        .layer(axum_middleware::from_fn(middleware::cache_control_middleware))
        .with_state(db);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    tracing::info!("Server running on http://0.0.0.0:8080");

    axum::serve(listener, app).await?;

    Ok(())
}
