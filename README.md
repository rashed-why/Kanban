# Webbriks — Mini Kanban Board

Full-stack submission for the **Webbriks Technical Assessment**: a collaborative Kanban application where users create boards, manage workflow columns, and move tasks with drag-and-drop.

**Repository layout:** single repo with `frontend/` and `backend/` directories.

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

## Getting started

Clone the repository and open the project folder:

```bash
git clone <repository-url>
cd app
```

Then follow **[Install & run with Docker](#install--run-with-docker)** (recommended) or [Local setup](#local-setup-without-docker) below.

---

## Install & run with Docker

Runs **PostgreSQL**, the **NestJS API**, and the **Next.js frontend** together. No local Node or Postgres install required.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd app
```

All Docker commands below must be run from this **repository root** (where `docker-compose.yml` lives).

### Step 2 — Create environment files

Copy the example env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit **`backend/.env`** — at minimum set:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=Kanban
POSTGRES_PORT=5433

JWT_SECRET=your-long-random-jwt-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=4000
FRONTEND_URL=http://localhost:3000
```

Edit **`frontend/.env`** — set a random secret:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-long-random-nextauth-secret
```

| File | Purpose |
|------|---------|
| `backend/.env` | Postgres credentials, JWT, API port — also passed to Compose via `--env-file` |
| `frontend/.env` | NextAuth config — loaded automatically by the `web` service |

> Do **not** commit `.env` files. They are listed in `.gitignore`.

### Step 3 — Build and start all services

```bash
docker compose --env-file backend/.env up --build
```

First run downloads images, builds the API and frontend, starts Postgres, runs migrations, then starts the app. Wait until logs show the API and web containers are healthy.

**What starts:**

| Compose service | Description | URL |
|-----------------|-------------|-----|
| `postgres` | PostgreSQL 16 database | `localhost:5433` (host; optional, for psql/Prisma Studio) |
| `api` | NestJS backend | http://localhost:4000 |
| `web` | Next.js frontend | http://localhost:3000 |

- Database migrations run automatically in the `api` container on startup.
- Data is stored in the Docker volume `postgres_data`.

### Step 4 — Use the app

1. Open **http://localhost:3000**
2. Click **Sign up** and create an account
3. Create a board and add columns/tasks

> Run the command **without** a service name (`api` or `web`) so all three services start.  
> `docker compose ... up --build api` starts only the backend — the frontend will not be available on port 3000.

### Step 5 — Stop the stack

Press **`Ctrl+C`** in the terminal, then optionally remove containers:

```bash
docker compose --env-file backend/.env down
```

To stop **and delete all database data** (fresh start):

```bash
docker compose --env-file backend/.env down -v
```

### Useful Docker commands

Run from the repository root:

```bash
# Run in background (detached)
docker compose --env-file backend/.env up --build -d

# View logs
docker compose --env-file backend/.env logs -f
docker compose --env-file backend/.env logs -f web
docker compose --env-file backend/.env logs -f api

# Rebuild after code changes
docker compose --env-file backend/.env up --build web    # frontend only
docker compose --env-file backend/.env up --build api     # backend only
docker compose --env-file backend/.env up --build        # everything

# Check running containers
docker compose --env-file backend/.env ps
```

### Why `--env-file backend/.env`?

The flag supplies variables for **Docker Compose itself** (e.g. `${POSTGRES_PASSWORD}`, `${POSTGRES_PORT}`, `${PORT}`).

The **frontend** env is not missing — `docker-compose.yml` loads `frontend/.env` into the `web` container via `env_file`. One command still starts frontend + backend + database.

### Connect to the Docker database (optional)

From your machine (psql, Prisma Studio, pgAdmin):

```
postgresql://postgres:YOUR_PASSWORD@localhost:5433/Kanban?schema=public
```

Use the same `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `backend/.env`.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `localhost:3000` connection refused | Start the **full** stack, not `up api` only |
| Login fails after signup | Rebuild frontend: `docker compose --env-file backend/.env up --build web` |
| Wrong password / user not found | Docker DB is separate from local Postgres — sign up again at http://localhost:3000 |
| `POSTGRES_PASSWORD` error on start | Set `POSTGRES_PASSWORD` in `backend/.env` |
| Port already in use | Change `POSTGRES_PORT` or `PORT` in `backend/.env`, or stop the conflicting service |

---

## Local setup (without Docker)

**Requirements:** Node.js 22+, Yarn, PostgreSQL 14+

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
