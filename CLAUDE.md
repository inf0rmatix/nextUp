# Presentation Queue System

A real-time web app for managing live presentation sessions where audience members queue up to present projects and connect via a "wave" system.

## Core Concept

1. Host creates a room on laptop → displays QR code
2. Attendees scan QR → enter name → can wave at presenters or submit to present
3. Host advances through presenters with keyboard/admin controller
4. Timer counts down, shows overtime, waves animate on screen
5. Mutual waves create connections for networking

## Architecture

```text
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │◀──┐ ┌──▶│     Backend     │
│   (Vue 3 SPA)   │   │ │   │   (Express +    │
│                 │   │ │   │   SQLite + WS)  │
└─────────────────┘   │ │   └─────────────────┘
          │           │ │            │
          │     ┌─────┴─┴─────┐      │
          └────▶│   Shared    │◀─────┘
                │ (Zod/Types) │
                └─────────────┘
```

- **Frontend**: Vue 3, Vite, Tailwind CSS, DaisyUI, VueUse
- **Backend**: Express, better-sqlite3, ws (WebSocket)
- **Shared**: Zod schemas and TypeScript types used by both frontend and backend
- **Real-time**: WebSocket for all live updates (timer, waves, queue changes)

## Key Entities

| Entity | Purpose |
|--------|---------|
| Room | Session with unique 3-word ID (e.g., "blue-tiger-sunset"), has admin_key |
| Profile | User identity (name required), has passphrase for rejoining |
| Participant | Profile's submission to a room's queue |
| Wave | Connection request from one profile to a participant |

## User Roles & Views

| Role | View | Access |
|------|------|--------|
| Host | Presenter Display | Creates room, keyboard controls |
| Admin | Admin Controller | QR from dropdown, controls via phone |
| Speaker | Timer Display | QR from dropdown, sees countdown |
| Attendee | Participant App | QR code scan, name required to join |

## Authentication

- **Rooms**: Public ID, private `admin_key` for controls
- **Users**: 3-word passphrase (e.g., "apple-mountain-river") — no passwords
- **Admin Controller**: URL includes `?key={admin_key}`

## Real-time Events (WebSocket)

Key events broadcasted:

- `presenter_changed` — next/prev navigation
- `timer_start/tick/end/overtime` — countdown state
- `wave_animation` — trigger floating 👋 on screen
- `participant_joined/updated/withdrawn` — queue changes
- `you_are_next` — notification to specific user

## File Structure

```text
├── backend/
│   ├── src/
│   │   ├── index.js          # Express + WS setup
│   │   ├── db.js             # SQLite queries
│   │   ├── routes/           # REST endpoints
│   │   └── websocket/        # WS handlers
│   └── data/queue.db
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── presenter/    # Host display
│   │   │   ├── admin/        # Mobile remote
│   │   │   ├── timer/        # Speaker timer
│   │   │   └── participant/  # Attendee app
│   │   ├── components/       # Shared UI
│   │   └── composables/      # Vue hooks
│   └── vite.config.js
│
├── packages/
│   └── shared/               # SHARED PACKAGE
│       ├── src/
│       │   └── index.ts      # Zod schemas & types
│       └── package.json
```

## API Patterns

- `POST /api/rooms` → create room (returns admin_key)
- `POST /api/profiles` → join with name (returns passphrase)
- `POST /api/rooms/:id/participants` → submit to queue
- `POST /api/rooms/:id/next?admin_key=...` → advance presenter
- `POST /api/rooms/:id/waves` → send wave

## Key Behaviors

1. **Name required to join** — so presenters see who waved
2. **Passphrase for persistence** — rejoin, edit submission, reuse profile
3. **Timer overtime** — counts up past zero with red pulsing
4. **Wave animations** — float up screen when waving at current presenter
5. **"Current need" reveal** — fades in during final 1/3 of timer

## Shared Package (@nextup/shared)

- **Single Source of Truth**: All TypeScript types used by both frontend and backend MUST be defined in `packages/shared`.
- **Zod Schemas**: Use Zod for runtime validation and type inference.
- **Workflow**:
  1. Modify `packages/shared/src/index.ts`.
  2. Run `npm run build -w packages/shared` from root.
  3. Types will be available in both apps via `@nextup/shared`.

## Development Commands

```bash
# Root (Workspaces)
npm install              # Install all dependencies and link
npm run build -w packages/shared  # Rebuild shared types
npm run lint             # Lint both apps

# Backend
cd backend && npm run dev
npm run build            # Build backend
npm run typecheck        # Run tsc --noEmit

# Frontend
cd frontend && npm run dev
npm run build            # Build frontend (Vite)
```

## Code Style & Standards

After modifying any files, STRICTLY follow this execution order in the relevant directory:

1. **Format**: `npm run format`
2. **Lint**: `npm run lint`

Always resolve all linting errors before considering a task complete.

## Environment Variables

```env
PORT=3000
WS_PORT=3001
DATABASE_PATH=./data/queue.db
UPLOAD_PATH=./tmp/uploads
FRONTEND_URL=http://localhost:5173
```

## See Also

- `projectIdea.md` — Full specification with wireframes, DB schema, API details
