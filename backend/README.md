Backend API (Node + TypeScript + SQLite)

Commands

```bash
cd backend
npm install
npm run dev
```

Endpoints

- `POST /api/auth/register` { email, password, role, name }
- `POST /api/auth/login` { email, password }
- `GET /api/admin/pending-sellers`
- `POST /api/admin/approve` { id, approve }
- `POST /api/admin/ban` { id, ban }

The DB file is stored at `backend/data/app.db` and is created automatically on first run.
