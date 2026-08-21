# Ads on Autopilot

A small, observable MVP for reviewing paid-campaign performance and proposing budget/bid actions with LangGraph agents.

## Why this MVP

The product keeps the human in the loop: agents inspect campaign metadata and metrics, produce explainable decisions, and expose every run for review. This makes the system easier to operate and extend toward Atlan-style data discoverability and governance: clear ownership, traceable runs, and explicit decision context.

## Architecture

- **Frontend:** React + Vite dashboard for campaigns, keywords, and agent runs.
- **Backend:** Express API with Zod validation, PostgreSQL for campaign/run data, Redis for run status, and LangGraph for orchestration.
- **Flow:** Analyst → bid optimizer/budget manager → reporter, coordinated by a supervisor graph.

## Run locally

Prerequisites: Node 20+, PostgreSQL, and Redis.

```bash
cp backend/.env.example backend/.env
# set DATABASE_URL and (optionally) OPENROUTER_API_KEY
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run dev
npm --prefix frontend run dev
```

The UI runs at `http://localhost:5173`; the API runs at `http://localhost:3001`.

Initialize the database with `backend/src/db/schema.sql` and seed data with:

```bash
npm --prefix backend run seed
```

## API

- `GET /health` — dependency health
- `GET /campaigns` and `GET /campaigns/:id`
- `PATCH /campaigns/:id` and `PATCH /keywords/:id`
- `GET /agent-runs` and `GET /agent-runs/:id`
- `POST /optimize` and `GET /optimize/status`

## Quality checks

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

This is an MVP, not an autonomous ad-buying system. Integrations with ad platforms, authentication, durable queues, and approval workflows are intentionally left for the next iteration.
