# Webbriks Kanban

A full-stack Kanban board application with email/password auth, drag-and-drop cards, and board sharing with role-based access.

## Features

- **Authentication** — Sign up, log in, JWT access tokens with refresh-token rotation
- **Boards** — Create, rename, and delete boards from a dashboard
- **Kanban** — Columns and tasks with drag-and-drop reordering (`@dnd-kit`)
- **Sharing** — Invite users by email as **Editor** or **Viewer**
- **Permissions** — Owner / Editor / Viewer enforced on the API via `BoardRoleGuard`

## Tech stack

| Layer    | Stack |
|----------|-------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Query, Formik, Zod, NextAuth, Radix Dialog, `@dnd-kit` |
| Backend  | NestJS 11, TypeScript, Prisma 7, PostgreSQL, Passport (JWT + local) |

## Project structure

```
app/
├── backend/          # NestJS REST API (default :4000)
│   ├── prisma/       # Schema and migrations
│   └── src/
│       ├── auth/     # Login, refresh, logout, JWT strategy
│       ├── board/    # Boards, sharing, board-role guards
│       ├── column/   # List (column) CRUD
│       └── task/     # Card CRUD and move
└── frontend/         # Next.js app (default :3000)
    └── src/
        ├── app/      # Routes (login, signup, boards, board detail)
        ├── components/
        └── services/ # API client and React Query hooks
```

## Prerequisites

- **Node.js** 20+
- **Yarn** 1.x
- **PostgreSQL** 14+

## Getting started

### 1. Database

Create a PostgreSQL database, for example:

```sql
CREATE DATABASE "Kanban";
```

### 2. Backend

```bash
cd backend
yarn install
```

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/Kanban?schema=public"

JWT_SECRET="change-me-to-a-long-random-string"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

PORT=4000
FRONTEND_URL="http://localhost:3000"
```

Run migrations and start the API:

```bash
npx prisma migrate deploy
yarn start:dev
```

API base URL: **http://localhost:4000**

### 3. Frontend

```bash
cd frontend
yarn install
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-to-a-long-random-string"
```

Start the dev server:

```bash
yarn dev
```

Open **http://localhost:3000** in your browser.

> **Note:** Board pages live on the frontend (`http://localhost:3000/boards/:id`). Opening the API URL directly in a browser (`http://localhost:4000/boards/:id`) returns `401 Unauthorized` because the API requires a `Bearer` token.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `JWT_EXPIRES_IN` | Yes | Access token lifetime (e.g. `1h`) |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Refresh token lifetime (e.g. `7d`) |
| `PORT` | No | API port (default `4000`) |
| `FRONTEND_URL` | No | CORS origin (default `http://localhost:3000`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXTAUTH_URL` | Yes | Frontend URL for NextAuth |
| `NEXTAUTH_SECRET` | Yes | NextAuth session encryption secret |

## Authentication flow

1. User signs up via `POST /user` or logs in via the frontend login form.
2. Frontend calls `POST /auth/login` and stores access + refresh tokens in a NextAuth JWT session.
3. Axios attaches `Authorization: Bearer <accessToken>` to API requests.
4. On `401`, the client refreshes via `POST /auth/refresh` and retries once.

## Board permissions

Permissions are per board, not global:

| Role | Capabilities |
|------|----------------|
| **Owner** | Full control — edit board, share, remove members, delete board |
| **Editor** | Create/edit/delete columns and tasks, drag cards |
| **Viewer** | Read-only access to the board |

The board creator is stored as `Board.ownerId`. Shared users are `BoardMember` rows with `EDITOR` or `VIEWER`.

## API overview

All board/task/column routes (except signup) require `Authorization: Bearer <accessToken>`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/user` | Sign up |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/refresh` | Rotate refresh token |
| `POST` | `/auth/logout` | Revoke refresh token(s) |
| `GET` | `/auth/me` | Current user profile |

### Boards

| Method | Path | Min role |
|--------|------|----------|
| `GET` | `/boards` | Authenticated |
| `POST` | `/boards` | Authenticated |
| `GET` | `/boards/:id` | Viewer |
| `PATCH` | `/boards/:id` | Owner |
| `DELETE` | `/boards/:id` | Owner |
| `GET` | `/boards/:boardId/members` | Viewer |
| `POST` | `/boards/:boardId/share` | Owner |
| `DELETE` | `/boards/:boardId/members/:userId` | Owner |

### Columns & tasks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/boards/:boardId/columns` | Create column (Editor+) |
| `PATCH` | `/columns/:id` | Rename column (Editor+) |
| `DELETE` | `/columns/:id` | Delete column (Editor+) |
| `POST` | `/columns/:columnId/tasks` | Create task (Editor+) |
| `PATCH` | `/tasks/:id` | Update task (Editor+) |
| `DELETE` | `/tasks/:id` | Delete task (Editor+) |
| `PATCH` | `/tasks/:id/move` | Move/reorder task (Editor+) |

## Scripts

### Backend

```bash
yarn start:dev      # Dev server with watch
yarn build          # Compile
yarn start:prod     # Run compiled app
npx prisma migrate dev   # Apply migrations in development
npx prisma generate      # Regenerate Prisma client
```

### Frontend

```bash
yarn dev            # Dev server
yarn build          # Production build
yarn start          # Run production build
yarn lint           # ESLint
```

## Production build

```bash
# Backend
cd backend
yarn install
npx prisma migrate deploy
yarn build
yarn start:prod

# Frontend
cd frontend
yarn install
yarn build
yarn start
```

Set production env vars (`DATABASE_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, `FRONTEND_URL`) before deploying.
