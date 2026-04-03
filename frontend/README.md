# StubbedSeek Frontend

Next.js frontend for the StubbedSeek plugin marketplace.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching

## Getting Started

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Start dev server
bun dev
```

Runs on `http://localhost:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8080/api`) |

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── hooks/           # React Query hooks
├── lib/             # Utilities & API client
└── types/           # TypeScript interfaces
```

## API Integration

All data is fetched from the Rust backend via the API client in `src/lib/api.ts`. No hardcoded mock data.
