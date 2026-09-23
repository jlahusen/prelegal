# Prelegal

Prelegal turns a conversation into a finished legal agreement.

Pick one of eleven [Common Paper](https://commonpaper.com/) agreement types — or just describe
your situation and let the assistant pick for you — then answer questions in plain language.
Every answer lands in the right blank in the real contract prose, which you watch fill in
beside the chat, and you leave with a PDF.

The agreement text is never written by the model. It is parsed from the templates in
[`templates/`](templates/), and the model is only allowed to supply the values that go into
its blanks.

> Prelegal produces drafts, not legal advice.

## Features

**Two ways to fill in a draft, on the same document.** A *chat* tab and a *form* tab sit side
by side; both write to one shared draft, so you can talk through the tricky fields and type the
obvious ones. Switching tabs keeps the conversation.

**AI chat in two modes.** Before an agreement is chosen the assistant is doing *intake*: it
reads [`catalog.json`](catalog.json) and works out which agreement you need. Ask for something
that isn't on the menu and it names the closest fit and explains the difference rather than
refusing — the response schema gives it no way to name anything else. Once an agreement is
settled it switches to *drafting* in the same turn: it asks about that document's fields a
couple at a time, reports back the values it recorded, and keeps asking until every field is
filled. Ask it for a different agreement mid-draft and it warns that your progress will be lost,
switching only once you confirm.

**Structured outputs, not free text.** Every OpenRouter call is a `json_schema` request in
strict mode. In drafting mode the schema's `enum` is the list of field paths the current
agreement actually has, so the model cannot invent a field, and a reply is filtered against
that list again on arrival. Replies are merged into whatever the form holds *now*, so a slow
answer never overwrites something you typed in the meantime.

**A live preview of the real contract.** The clause text, numbering and defined terms come
from the template; your values are substituted into each span where they appear, in the right
grammatical form (possessive, plural, article-absorbing). A wax seal stamps shut once every
required field is filled.

**PDF download.** Letter-format PDF, named after the agreement and its parties —
`mutual-non-disclosure-agreement-acme-initech.pdf`.

**Saved drafts and document switching.** Saving puts a draft id in the URL, so the link
reopens it. Switching agreement types starts the new one from a blank draft. If anything has
been filled in, by hand or through the chat, you are asked to confirm first, in a modal or in
the chat.

## The agreements

Mutual NDA · Cloud Service Agreement · Design Partner Agreement · SLA · Professional Services
Agreement · DPA · Software License Agreement · Partnership Agreement · BAA · Pilot Agreement ·
AI Addendum

All eleven are [Common Paper](https://commonpaper.com/) standards, used under CC BY 4.0.
[`catalog.json`](catalog.json) is the menu the product and the intake chat both read.

## Stack

| | |
| --- | --- |
| Backend | Python 3.13, FastAPI, Pydantic, [uv](https://docs.astral.sh/uv/) |
| Frontend | Next.js 16 (static export), React 19, TypeScript, Tailwind CSS 4 |
| Database | SQLite, recreated on every start |
| AI | OpenRouter with structured outputs, via the `@preset/prelegal` preset |
| PDF | `html2pdf.js`, in the browser |
| Packaging | One Docker image: the frontend is built to static files and served by FastAPI |

## Getting started

Docker is the only prerequisite, and an OpenRouter API key if you want the chat to work.

```bash
cp .env.example .env        # then put your OPENROUTER_API_KEY in it

scripts/start-mac.sh        # or start-linux.sh
scripts/stop-mac.sh         # or stop-linux.sh
```

```powershell
Copy-Item .env.example .env
scripts\start-windows.ps1
scripts\stop-windows.ps1
```

The start script builds the image, runs it, waits for `/api/health`, and prints the URL:
**http://localhost:8000**. Without a key everything works except the chat tab; use the form
tab instead.

The SQLite database is created from scratch every time the app starts, so **stopping the
container discards every draft**. That is deliberate for now.

## Layout

- [`backend/`](backend/) — FastAPI app: the JSON API under `/api`, and it serves the built frontend.
  - `documents/` — one spec module per agreement, plus the template parser.
  - `intake_chat.py` / `document_chat.py` — the two chat modes and their response schemas.
  - `openrouter.py` — the only place that talks to the model.
- [`frontend/`](frontend/) — Next.js agreement drafter, exported to static files at build time.
- [`templates/`](templates/) — the underlying Common Paper legal agreement templates.
- [`catalog.json`](catalog.json) — the agreement types the product offers, served by `/api/catalog`.

Templates and the catalog are read and parsed once at startup. A template that no longer fits
its spec stops the app rather than reaching someone's contract.

## API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Liveness, used by the start scripts. |
| `GET /api/catalog` | The available agreement types. |
| `GET /api/document-types/{doc_type}` | One agreement's fields and parsed clauses. |
| `POST /api/chat` | One chat turn. Without `doc_type` it is intake; with one it is drafting, and the reply carries the fields it settled. |
| `GET\|POST /api/documents` | List or create document drafts. |
| `GET\|PUT\|DELETE /api/documents/{id}` | Read, replace, or delete one draft. |

Interactive docs at http://localhost:8000/docs.

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

### Adding an agreement

1. Add the template to [`templates/`](templates/) and an entry to [`catalog.json`](catalog.json).
2. Write a spec module in `backend/app/documents/` — its fields, and the exact spans of template
   prose each one replaces. The spec is the only hand-written part; the prose is never copied.
3. List the module in `backend/app/documents/registry.py`.

Both chat modes pick it up from there: intake reads the catalog, drafting reads the spec.
