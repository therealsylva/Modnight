# Deployment Reminders

## Frontend Environment Variables

Before deploying to production, add to `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=https://modnight.com
```

This ensures thumbnail URLs work correctly in production (instead of pointing to localhost).
