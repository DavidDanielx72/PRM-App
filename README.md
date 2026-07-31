# Community Store App (PRM App)

This workspace contains two packages:

- `app/` — Expo React Native (TypeScript) frontend
- `backend/` — Node.js + TypeScript Express API with SQLite (better-sqlite3)

Quick start

1. Open the workspace directory in a terminal.

2. Install backend dependencies and run the server:

```bash
cd backend
npm install
npm run dev
```

3. Install app dependencies and start Expo (in a separate terminal):

```bash
cd app
npm install
npm run start
```

Notes

- The frontend is scaffolded for Expo TypeScript. You may run `npx create-expo-app . -t expo-template-blank-typescript` inside `app/` to finish a full Expo scaffold, or run `npm install` to install the dependencies listed in `app/package.json`.
- The backend uses SQLite and seeds demo users for `student`, `seller`, and `admin`. JWT-based auth is implemented for demo purposes only.

Seeding demo users

Run the seed script (after `npm install`) to create demo accounts:

```bash
cd backend
npm run seed
```

Emulator note: Android emulators usually map host `localhost` to `10.0.2.2`. The app's API client uses `10.0.2.2:4000` by default — change `app/src/api.ts` to `http://localhost:4000` if you run on a platform that accesses localhost directly.

Next steps

- Implement UI screens from the provided Figma design and wire them to the backend.
- Add polished animations and asset exports from Figma.
