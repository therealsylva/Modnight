# ModNight Backend

Rust backend API server for the ModNight plugin marketplace.

## Tech Stack

- **Axum** - Web framework
- **SQLx** - Database (SQLite)
- **Tokio** - Async runtime
- **Serde** - JSON serialization

## Getting Started

```bash
# Copy environment file
cp .env.example .env

# Run the server
cargo run
```

Server runs on `http://localhost:8080`

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plugins` | List all plugins (with filters) |
| GET | `/api/plugins/:id` | Get single plugin |
| GET | `/api/plugins/stats` | Get plugin statistics |
| GET | `/api/plugins/search?q=query` | Search plugins |
| GET | `/api/feed/live` | Get live activity feed |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/plugins` | Create new plugin |

## Query Parameters

### GET /api/plugins

- `category` - Filter by category (gaming, productivity, new-releases, automation)
- `search` - Search term
- `sort_by` - Sort field (downloads, updated, name)
- `sort_order` - Sort direction (asc, desc)
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20)

## Project Structure

```
src/
├── main.rs          # Entry point
├── db/              # Database initialization
├── handlers/        # Route handlers
│   ├── plugins.rs   # Plugin endpoints
│   ├── feed.rs      # Live feed endpoint
│   └── admin.rs     # Admin endpoints
├── models/          # Data models
└── routes/          # Route definitions
```
