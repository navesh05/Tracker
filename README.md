# Tracker 4.1

Tracker 4.1 is a local-first React + TypeScript PWA for the fitness plan. It is a visual and persistence-system rebuild of the 4.0 foundation.

## 4.1 changes

- Premium, calm dark-first visual system with restrained green accent.
- Flat, spacious Gym/Run calendars instead of boxed calendar cells.
- Contribution-style Home activity heatmap for Gym + Run only.
- Cleaner mobile drawer and responsive viewport-conscious layouts.
- Local writes are validated by Zod and committed to IndexedDB before being considered saved.
- Sync queue is coalesced per entity, retries with exponential backoff, and records failure metadata.
- Firebase writes use a transaction and will not overwrite a newer cloud record.
- Optional cloud pull merges newer remote records into the local store.
- Theme preference is persisted locally.
- Vite HMR is explicitly configured for `localhost:5173` to avoid the WebSocket 400 issue seen in some Windows/VS Code setups.

## Architecture

```text
Feature UI
  -> Zustand application state
  -> TrackerRepository
  -> Zod validation
  -> Dexie / IndexedDB (source of truth)
  -> coalesced sync queue
  -> optional Firebase adapter
       -> conflict-safe transaction push
       -> remote snapshot pull
```

The UI never calls Firestore directly. Historical logs are independent from plan data.

## Run

Use Node 22 (`.nvmrc`). The frontend does not need a Python virtual environment. The included `scripts/setup-venv.sh` is reserved for future Excel/import tooling.

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

Quality gates:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

If a previous Tracker version installed a service worker, unregister it from DevTools → Application → Service Workers and clear site data once before testing 4.1.

## Firebase

Copy `.env.example` to `.env.local` and add Firebase web-app credentials when cloud persistence is ready. Anonymous Authentication must be enabled for the current adapter.

Recommended Firestore shape:

```text
users/{uid}/gym/{yyyy-mm-dd}
users/{uid}/run/{yyyy-mm-dd}
users/{uid}/daily/{yyyy-mm-dd}
users/{uid}/profile/profile
```

Add Firestore security rules so each authenticated user can only read/write their own `users/{uid}` subtree. Never put service-account credentials in the PWA.

## Firestore security

A starter `firebase/firestore.rules` file is included. It restricts the entire user subtree to the authenticated owner. Tighten field-level validation before production if additional clients or roles are introduced.

Deploy with the Firebase CLI after selecting your project:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

## 4.2 changes

Tracker 4.2 treats weight as a weekly measurement rather than a daily habit. Gym and Run logs cannot be created for future dates. The Suggestions & Plan module exposes the structured workbook tables for training, running, nutrition, phase targets, and weekly weight targets.
