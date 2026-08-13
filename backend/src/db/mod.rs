use anyhow::Result;
use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};

pub type Db = SqlitePool;

pub async fn init_db() -> Result<Db> {
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./data/modnight.db".to_string());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    run_migrations(&pool).await?;

    Ok(pool)
}

async fn run_migrations(pool: &Db) -> Result<()> {
    // Add slug column if it doesn't exist (for existing databases)
    let add_slug = sqlx::query("ALTER TABLE plugins ADD COLUMN slug TEXT")
        .execute(pool)
        .await;
    
    if add_slug.is_ok() {
        tracing::info!("Added slug column to plugins table");
    }

    // Add is_frozen column if it doesn't exist
    let add_frozen = sqlx::query("ALTER TABLE plugins ADD COLUMN is_frozen BOOLEAN NOT NULL DEFAULT 0")
        .execute(pool)
        .await;

    if add_frozen.is_ok() {
        tracing::info!("Added is_frozen column to plugins table");
    }

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS plugins (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            downloads INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            version TEXT NOT NULL,
            thumbnail TEXT NOT NULL,
            preview_video TEXT,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT NOT NULL,
            compatibility TEXT NOT NULL,
            file_size TEXT NOT NULL,
            file_path TEXT,
            changelog TEXT DEFAULT '',
            installation_instructions TEXT DEFAULT '',
            is_frozen BOOLEAN NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_plugins_slug ON plugins(slug);
        CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category);

        CREATE TABLE IF NOT EXISTS plugin_reports (
            id TEXT PRIMARY KEY,
            plugin_id TEXT NOT NULL,
            reason TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS creator_applications (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            github TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        "#,
    )
    .execute(pool)
    .await?;

    // Generate slugs for existing plugins that don't have them
    let result = sqlx::query(
        r#"
        UPDATE plugins 
        SET slug = LOWER(REPLACE(REPLACE(REPLACE(title, ' ', '-'), '_', '-'), '--', '-')) || '-' || SUBSTR(id, 1, 8)
        WHERE slug IS NULL OR slug = '';
        "#
    )
    .execute(pool)
    .await;

    if result.is_ok() {
        tracing::info!("Generated slugs for existing plugins");
    }

    Ok(())
}
