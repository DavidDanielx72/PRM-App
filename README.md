# Community Store

React + Supabase web application for the CPUT student marketplace.

## Frontend

```bash
cd frontend
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Supabase setup

Run these files in Supabase SQL Editor in order:

1. `backend/schema.sql`
2. `backend/policies.sql`
3. `backend/triggers.sql`
4. `backend/seed.sql`

Admins must be created by an existing admin. Never put a Supabase service-role key in the frontend.