# ModNight

Plugin marketplace for games and tools.

## Project Structure

```
modnight/
├── frontend/          # Next.js frontend
├── backend/           # Rust API backend
├── admin/            # Rust admin CLI
└── installer/        # Tauri installer
```

## Quick Start

### Backend (Rust)

```bash
cd backend
cp .env.example .env
cargo run
```

Runs on `http://localhost:8080`

### Frontend (Next.js)

```bash
cd frontend
bun install
bun run dev
```

Runs on `http://localhost:3000`

## Architecture

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Rust + Axum + SQLx (SQLite)
- **API**: RESTful JSON API
- **Installer**: Tauri (desktop app)

## API

See [backend/README.md](./backend/README.md) for full API documentation.
