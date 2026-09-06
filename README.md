# Webbriks — Mini Kanban Board

Full-stack submission for the **Webbriks Technical Assessment**: a collaborative Kanban application where users create boards, manage workflow columns, and move tasks with drag-and-drop.

**Repository layout:** single repo with `frontend/` and `backend/` directories.

## Assessment requirements

| Requirement | Implementation |
|-------------|----------------|
| User registration & token-based login | `POST /user`, `POST /auth/login` — JWT access + refresh tokens |
| Board owner & sharing with registered users | `Board.ownerId` + `POST /boards/:boardId/share` by email |
| Access control on boards, columns, tasks | `BoardRoleGuard` — Owner / Editor / Viewer; blocks cross-board access |
| Boards, columns, tasks CRUD | REST API under `/boards`, `/columns`, `/tasks` |
| Task move API (reorder + cross-column) | `PATCH /tasks/:id/move` with `columnId` + `position` |
| Stable task ordering | Position indexes updated in a Prisma transaction on move |
| Interactive drag-and-drop UI | `@dnd-kit` Kanban board in Next.js |

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Query, Formik, Zod, NextAuth, Radix Dialog, `@dnd-kit` |
| Backend | NestJS 11, TypeScript, Prisma 7, PostgreSQL, Passport (JWT + local) |

## Project structure

```
app/
├── docker-compose.yml   # Full stack (postgres + api + web)
├── backend/             # NestJS REST API (default :4000)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── docker-entrypoint.sh
│   ├── prisma/          # Schema and migrations
│   └── src/
│       ├── auth/
│       ├── board/
│       ├── column/
│       └── task/
└── frontend/            # Next.js app (default :3000)
    ├── Dockerfile
    ├── .dockerignore
    └── src/
        ├── app/         # login, signup, boards, board detail
        ├── components/
        └── services/
```

## Prerequisites

- **Docker Desktop** (recommended — runs the full stack with one command)
- **Node.js** 22+ (required by Prisma 7.9; only needed for local dev without Docker)
- **Yarn** 1.x
- **PostgreSQL** 14+ (only if running the API locally without Docker)

---

## Docker (recommended)

Run the **full stack** (Postgres + API + frontend) from the **repository root**.

### 1. Environment files

Copy the examples and set secrets:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

You need **both** files:

| File | Used by |
|------|---------|
| `backend/.env` | Compose variable substitution, `postgres` container, `api` container |
| `frontend/.env` | `web` container (NextAuth) |

**Why does the command only mention `backend/.env`?**

```bash
docker compose --env-file backend/.env up --build
```

The `--env-file` flag supplies variables for **Compose itself** (e.g. `${POSTGRES_PASSWORD}`, `${POSTGRES_PORT}`, `${PORT}`). The frontend env is loaded automatically via `env_file: ./frontend/.env` on the `web` service in `docker-compose.yml`.

### 2. Start everything

```bash
docker compose --env-file backend/.env up --build
```

| Service | Role | URL |
|---------|------|-----|
| `web` | Next.js frontend | http://localhost:3000 |
| `api` | NestJS backend | http://localhost:4000 |
| `postgres` | PostgreSQL 16 | `localhost:5433` on the host (default) |

- **Migrations** run automatically when the `api` container starts (`docker-entrypoint.sh` → `prisma migrate deploy`).
- **Data** persists in the `postgres_data` Docker volume.
- **Node 22** is used in both Dockerfiles (required by Prisma 7.9).

Open http://localhost:3000 → sign up → create a board.

> Run the command **without** a service name to start frontend + backend + database.  
> `docker compose ... up --build api` starts only the API (and Postgres), not the frontend.

### 3. Useful commands

Run from the repo root:

```bash
# Detached (background)
docker compose --env-file backend/.env up --build -d

# Rebuild one service after code changes
docker compose --env-file backend/.env up --build web    # frontend
docker compose --env-file backend/.env up --build api    # backend

# Logs
docker compose --env-file backend/.env logs -f web
docker compose --env-file backend/.env logs -f api
docker compose --env-file backend/.env logs -f postgres

# Stop
docker compose --env-file backend/.env down

# Stop and delete database volume (fresh DB)
docker compose --env-file backend/.env down -v
```

### 4. How environment variables work in Docker

Compose **overrides** several values at runtime:

| Variable | In container | Purpose |
|----------|----------------|---------|
| `DATABASE_URL` | `api` → `@postgres:5432` | API talks to Postgres on the Docker network |
| `API_URL` | `web` → `http://api:4000` | Next.js **server** (NextAuth login, SSR) → API |
| `NEXT_PUBLIC_API_URL` | `web` → `http://localhost:4000` | **Browser** → API via published port |
| `NEXTAUTH_URL` | `web` → `http://localhost:3000` | NextAuth callback URL |

The browser always calls `http://localhost:4000`. Inside the `web` container, the server must use `http://api:4000` (the Compose service name), not `localhost`.

`POSTGRES_PORT=5433` in `backend/.env` maps Postgres to host port **5433** by default so it does not clash with a local Postgres on **5432**.

### 5. Connect to the Docker database (optional)

From the host (psql, Prisma Studio, pgAdmin):

```
postgresql://postgres:YOUR_PASSWORD@localhost:5433/Kanban?schema=public
```

Use the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `backend/.env`.

### 6. Troubleshooting

**Frontend not loading (`localhost:3000` connection refused)**  
You likely started only the API. Run the full stack (no service name) or `up --build web`.

**Login fails after signup (401 on `/api/auth/callback/credentials`)**  
Rebuild the `web` container so server-side auth picks up code and env changes:

```bash
docker compose --env-file backend/.env up --build web
```

**“Invalid email or password” with credentials that worked before**  
Docker Postgres is a **separate database** from local dev. Sign out, clear cookies for `localhost:3000`, and sign up again against the Docker stack. Do not reuse accounts created only in local Postgres or Prisma Studio on port `5432`.

**API unhealthy / migrations fail**  
Ensure `POSTGRES_PASSWORD` is set in `backend/.env`. Check logs: `docker compose --env-file backend/.env logs -f api`.

---

## Local setup (without Docker)

### Step 1 — Database

Create a PostgreSQL database:

```sql
CREATE DATABASE "Kanban";
```

Set `DATABASE_URL` in `backend/.env` to match your local credentials.

### Step 2 — Backend

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

> For Docker, use `backend/.env.example` instead — it includes `POSTGRES_*` vars. Compose overrides `DATABASE_URL` for the `api` container.

Apply migrations and start the API:

```bash
npx prisma migrate deploy
yarn start:dev
```

API: **http://localhost:4000**

### Step 3 — Frontend

Open a new terminal:

```bash
cd frontend
yarn install
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
API_URL="http://localhost:4000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-to-a-long-random-string"
```

> In Docker, Compose sets `API_URL=http://api:4000` on the `web` container at runtime.

Start the app:

```bash
yarn dev
```

Open **http://localhost:3000** → sign up → create a board → drag cards.

> Board pages are on the **frontend** (`/boards/:id`). The API URL alone returns `401` without a Bearer token.

---

## Sample environment variables

### Backend (`backend/.env`)

| Variable | Required | Example / default | Docker notes |
|----------|----------|-------------------|--------------|
| `POSTGRES_USER` | Docker | `postgres` | Used by `postgres` service |
| `POSTGRES_PASSWORD` | Docker | Strong secret | Required by Compose (`:?` validation) |
| `POSTGRES_DB` | Docker | `Kanban` | Database name |
| `POSTGRES_PORT` | Docker | `5433` | Host port mapped to container `5432` |
| `DATABASE_URL` | Local dev | `postgresql://USER:PASSWORD@localhost:5432/Kanban?schema=public` | Overridden in `api` container to `@postgres:5432` |
| `JWT_SECRET` | Yes | Long random string | |
| `JWT_EXPIRES_IN` | Yes | `1h` | |
| `JWT_REFRESH_EXPIRES_IN` | Yes | `7d` | |
| `PORT` | No | `4000` | API port (host and container) |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS / redirects |

### Frontend (`frontend/.env`)

| Variable | Required | Example | Docker notes |
|----------|----------|---------|--------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000` | Browser + baked into client bundle at build |
| `API_URL` | Yes | `http://localhost:4000` | Overridden to `http://api:4000` on `web` service |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` | Overridden in Compose |
| `NEXTAUTH_SECRET` | Yes | Long random string | Must match across restarts |

---

## Architecture notes

### Authentication

1. Sign up via `POST /user` or log in through the UI.
2. `POST /auth/login` returns access + refresh tokens; NextAuth stores them in the session.
3. Axios sends `Authorization: Bearer <accessToken>` on API calls.
4. On `401`, the client calls `POST /auth/refresh` and retries once.

### Collaboration & access control

- **Owner** — board creator (`Board.ownerId`); can share, rename, delete board.
- **Editor** — shared member; can manage columns/tasks and drag cards.
- **Viewer** — read-only board access.

Shared users are `BoardMember` rows. Every board/column/task route checks membership via `BoardRoleGuard` so users cannot access boards they were not invited to.

### Task movement

`PATCH /tasks/:id/move` accepts:

```json
{
  "columnId": "target-column-id",
  "position": 0
}
```

- Same column → reorders tasks at the given index.
- Different column → moves the task and shifts positions in both columns.
- Updates run inside a **database transaction** to keep ordering consistent.

### Frontend drag-and-drop

The Kanban UI previews moves locally during drag; the server cache updates only on drop via the move endpoint.

---

## API reference

Public: `POST /user`. All other routes below require `Authorization: Bearer <accessToken>` unless noted.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/user` | Register |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/refresh` | Refresh tokens |
| `POST` | `/auth/logout` | Log out |
| `GET` | `/auth/me` | Current user |

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
| `PATCH` | `/columns/:id` | Update column (Editor+) |
| `DELETE` | `/columns/:id` | Delete column (Editor+) |
| `POST` | `/columns/:columnId/tasks` | Create task (Editor+) |
| `PATCH` | `/tasks/:id` | Update task (Editor+) |
| `DELETE` | `/tasks/:id` | Delete task (Editor+) |
| `PATCH` | `/tasks/:id/move` | Reorder or move task (Editor+) |

---

## Scripts

### Backend

```bash
yarn start:dev              # Dev server (watch mode)
yarn build && yarn start:prod
npx prisma migrate dev      # Dev migrations
npx prisma migrate deploy   # Production migrations
npx prisma generate
```

### Frontend

```bash
yarn dev
yarn build && yarn start
yarn lint
```

---

## Production build

**Docker (recommended):**

```bash
docker compose --env-file backend/.env up --build -d
```

**Manual (without Docker):**

```bash
# Backend
cd backend && yarn install && npx prisma migrate deploy && yarn build && yarn start:prod

# Frontend
cd frontend && yarn install && yarn build && yarn start
```

Set all production env vars before deploy.

---

## Deployment

Live deployment: _optional — add URL here if hosted._

---

## License

Private — Webbriks technical assessment submission.
