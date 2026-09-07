# prelegal
Platform that crafts common legal agreements

## Running it

Docker is the only prerequisite. The whole product — API, database, and frontend — runs
as a single container on http://localhost:8000.

```bash
scripts/start-mac.sh      # or start-linux.sh
scripts/stop-mac.sh       # or stop-linux.sh
```

```powershell
scripts\start-windows.ps1
scripts\stop-windows.ps1
```

Copy `.env.example` to `.env` before starting; the start scripts pass it into the container.

The SQLite database is created from scratch every time the app starts, so **stopping the
container discards every draft**. That is deliberate for now.

## Layout

- [`backend/`](backend/) — FastAPI app: the JSON API under `/api`, and it serves the built frontend.
- [`frontend/`](frontend/) — Next.js agreement drafter, exported to static files at build time.
- [`templates/`](templates/) — the underlying Common Paper legal agreement templates.
- [`catalog.json`](catalog.json) — the agreement types the product offers, served by `/api/catalog`.

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Liveness, used by the start scripts. |
| `GET /api/catalog` | The available agreement types. |
| `GET|POST /api/documents` | List or create document drafts. |
| `GET|PUT|DELETE /api/documents/{id}` | Read, replace, or delete one draft. |

There are no user accounts yet, so every draft is visible to everyone using the instance.

## Developing

Run the two halves separately for live reload:

```bash
cd backend && uv run uvicorn app.main:app --reload      # http://localhost:8000
cd frontend && NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev   # http://localhost:3000
```

Backend tests:

```bash
cd backend && uv run pytest
```
