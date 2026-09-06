# Webbriks Kanban — Frontend

Next.js 16 app. See the [root README](../README.md) for full project setup.

## Local development (without Docker)

```bash
yarn install
cp .env.example .env
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Requires the API at `http://localhost:4000`.

## Docker

Docker orchestration lives at the **repository root** — this folder only contains the app image:

| File | Purpose |
|------|---------|
| `Dockerfile` | Production Next.js standalone image |
| `.dockerignore` | Excludes secrets and build artifacts |

From the repo root:

```bash
docker compose --env-file backend/.env up --build
```

## Environment variables

See `.env.example`. In Docker, `API_URL` is set to `http://api:4000` by root `docker-compose.yml`.

## Scripts

```bash
yarn dev
yarn build
yarn start
yarn lint
```
