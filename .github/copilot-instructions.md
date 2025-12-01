## Purpose

This file tells AI coding agents how this repo is organized, how to run it locally, and the concrete patterns to follow when changing code.

**Big picture**
- **Frontend**: Vite + React + TypeScript (`src/`). UI uses Tailwind + MUI and animations via `framer-motion`.
- **Data**: Firebase v9 — Auth, Firestore, Storage, Functions. Initialization lives in `src/lib/firebase.ts`.
- **Service boundary**: UI components call `src/services/firestore.ts` for all Firestore/storage operations. Cloud Functions (if used) live in the `functions/` folder.

**Run / build**
- Install: `npm install`
- Dev: `npm run dev` (Vite, typically `http://localhost:5173`)
- Build: `npm run build`; Preview: `npm run preview`

**Firebase / env**
- Environment variables must start with `VITE_` and live in `.env.local` (e.g. `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.). If `.env.local.example` is missing, create `.env.local` manually.
- `src/lib/firebase.ts` contains commented emulator connection lines. Recommended emulator ports (as used in docs): Auth `9099`, Firestore `8080`, Functions `5001`.
- Vite proxies `/api/*` to the Functions emulator at `http://127.0.0.1:5001` (see `vite.config.ts`).

**Important code patterns & conventions**
- Single source of truth for time: entries store `date` as Unix ms in the `JournalEntry` type. Firestore documents convert to/from `Timestamp` in `src/services/firestore.ts` (`entryToDocument` / `documentToEntry`).
- The app uses a `dayKey` (MM-DD) to query "On This Day" entries — generated inside `src/services/firestore.ts` (`generateDayKey`). Keep this field in sync when changing date logic.
- All Firestore/storage interaction goes through `src/services/firestore.ts`. Example usage: `addEntry(...)` is called in `src/pages/Entry.tsx` and `uploadImage(file, userId)` stores files under `journal-images/` and returns a public URL.
- Auth state is provided by `src/context/AuthContext.tsx` via `useAuth()`; prefer using that hook to access `user` and `loading` instead of direct `auth` queries.
- Editor: `src/components/Editor/EditorSheet.tsx` uses TipTap with `Image` enabled (`allowBase64: true`). When editing content, call `onUpdate(editor.getHTML())`.
- Photo uploads: `src/components/Editor/PhotoUpload.tsx` calls the `onUpload` prop which usually maps to `uploadImage` in `src/services/firestore.ts`.

**Type & schema notes**
- `src/types.ts` contains `JournalEntry`. If you change the entry shape, update `src/types.ts`, `src/services/firestore.ts` conversions, and review `.cursorrules` for legacy constraints.
- Security: Firestore rules must continue to enforce `userId === request.auth.uid` for user-owned entries (SETUP.md includes recommended rules). When adding new private fields, update rules accordingly.

**When making changes** (concise checklist for agents)
- Update `src/types.ts` first for any data model changes.
- Update conversion helpers in `src/services/firestore.ts` (Timestamp conversion, `dayKey` generation).
- Update UI components that consume the model (search `JournalEntry` usages across `src/`).
- Run `npm run dev` and ensure no type errors (TypeScript) and no Firebase runtime errors.

**Concrete examples to reference**
- Create an entry: look at `src/pages/Entry.tsx` — calls `addEntry({...})` and then uses the returned `id`.
- Upload image: `uploadImage(file, userId)` stores at `journal-images/{userId}/{timestamp-filename}` and returns a download URL (see `src/services/firestore.ts`).
- Auth hook: use `useAuth()` from `src/context/AuthContext.tsx` to gate routes or show user-specific UI.

If something in these instructions is unclear or you want more detail in any section (emulator setup, security rules, or common PR patterns), tell me which part to expand.
