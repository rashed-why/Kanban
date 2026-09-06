# Kanban Board

Collaborative Kanban app — boards, columns, tasks, drag-and-drop, and board sharing.

Monorepo: `frontend/` (Next.js) + `backend/` (NestJS).

## Tech stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Query, Formik, Zod, NextAuth, Radix Dialog, `@dnd-kit` |
| **Backend** | NestJS 11, TypeScript, Prisma 7, PostgreSQL, Passport (JWT) |
| **DevOps** | Docker Compose, PostgreSQL 16, Node 22 |

## Project structure

```
app/
├── docker-compose.yml      # Postgres + API + frontend
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── prisma/             # Schema & migrations
│   └── src/
│       ├── auth/
│       ├── board/
│       ├── column/
│       └── task/
└── frontend/
    ├── Dockerfile
    └── src/
        ├── app/            # Pages (login, signup, boards)
        ├── components/
        └── services/
```

## Install & run

**Requires:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone

```bash
git clone <repository-url>
cd app
```

### 2. Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Set secrets in both files:

- **`backend/.env`** — `POSTGRES_PASSWORD`, `JWT_SECRET`
- **`frontend/.env`** — `NEXTAUTH_SECRET`

See `.env.example` in each folder for all variables.

### 3. Start

From the **repo root**:

```bash
docker compose --env-file backend/.env up --build
```

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| API | http://localhost:4000 |

Migrations run automatically on startup. Open http://localhost:3000 → **Sign up** → create a board.

### 4. Stop

```bash
docker compose --env-file backend/.env down        # stop containers
docker compose --env-file backend/.env down -v     # stop + wipe database
```

### Other commands

```bash
docker compose --env-file backend/.env up --build -d              # background
docker compose --env-file backend/.env logs -f web                # frontend logs
docker compose --env-file backend/.env up --build web             # rebuild frontend
```

> Use the full `up --build` command (no service name) so frontend, API, and Postgres all start.  
> `frontend/.env` is loaded automatically by Compose — only `backend/.env` is passed on the CLI.

### Troubleshooting

**`P1000: Authentication failed` / `password authentication failed for user "postgres"`**

PostgreSQL stores the password on **first startup** in the Docker volume. If you change `POSTGRES_PASSWORD` in `backend/.env` later, the old password is still in the volume.

Fix — reset the database volume, then start again:

```bash
docker compose --env-file backend/.env down -v
docker compose --env-file backend/.env up --build
```

Also check:

- `POSTGRES_PASSWORD` is set in `backend/.env` (not empty)
- Use a simple password without `@`, `#`, or `:` (these can break the connection URL)
- Do not rely on `DATABASE_URL` in `backend/.env` for Docker — Compose builds it automatically for the `api` service

---

## Local development (without Docker)

Requires **Node.js 22+**, **Yarn**, and **PostgreSQL**.

```bash
# Backend (terminal 1)
cd backend && yarn install && cp .env.example .env
# Set DATABASE_URL in .env, then:
npx prisma migrate deploy && yarn start:dev

# Frontend (terminal 2)
cd frontend && yarn install && cp .env.example .env && yarn dev
```

Open http://localhost:3000
