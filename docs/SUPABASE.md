# Supabase integration plan (Sneezr)

## Overview

- **Table:** `public.sneezes` — `id`, `user_id`, `timestamp`, `photo_url`, `created_at`
- **Bucket:** `sneeze-photos`
- **Auth:** Anonymous sign-in on app start; session persisted with AsyncStorage.

---

## Env

Create `.env` (and add to `.gitignore`) or use EAS/Expo env:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Expo exposes only `EXPO_PUBLIC_*` to the client; use these for the anon key.

---

## Storage path convention

Use a single path pattern for all sneeze photos:

```
{userId}/{eventId}.jpg
```

- **userId** — from `auth.signInAnonymously()` (or logged-in user).
- **eventId** — `sneezes.id` from `insertSneeze()`.

Example: `a1b2c3d4-.../550e8400-e29b-41d4-a716-446655440000.jpg`

Rationale: one folder per user, one file per event; easy RLS and cleanup.

---

## Error handling (minimal pattern)

All service functions return a **result object** (no thrown errors from Supabase):

- **Success:** `{ data }` or `{ id }` or `{ publicUrl }` etc.
- **Failure:** `{ error: Error }`

Example:

```ts
const result = await signInAnonymously();
if ('error' in result) {
  // show result.error.message or fallback
  return;
}
const userId = result.userId;

const insertResult = await insertSneeze({ userId, timestamp: Date.now() });
if ('error' in insertResult) {
  // handle insertResult.error.message
  return;
}
const eventId = insertResult.id;
```

Use a small helper if you like:

```ts
function isOk<T>(r: { error?: Error }): r is T {
  return !('error' in r && r.error);
}
```

---

## File layout

| File | Role |
|------|------|
| `src/lib/supabase.ts` | createClient with AsyncStorage, auto-refresh on app focus |
| `src/services/auth.ts` | signInAnonymously(), getCurrentUserId() |
| `src/services/sneezes.ts` | insertSneeze(), fetchSneezes() |
| `src/services/storage.ts` | getSneezePhotoPath(), uploadSneezePhoto(), getSignedSneezePhotoUrl() |
| `src/services/index.ts` | Re-exports |

---

## Suggested app flow

1. **App start:** Call `signInAnonymously()` once (e.g. in root component or before first navigation). Ignore if already session (Supabase reuses it).
2. **Log event:** Get `userId` from `getCurrentUserId()`. Optionally upload photo first to get URL, or insert then upload and patch. Recommended: `insertSneeze({ userId, timestamp })` → get `id` → `uploadSneezePhoto({ userId, eventId: id, uri })` → update row `photo_url` if you want it in DB.
3. **Event list:** `fetchSneezes(userId)` and render; order is already `timestamp desc`.

---

## Public vs signed URLs

- **Public URL:** Returned by `uploadSneezePhoto()`. Use when the bucket is configured for public read; simplest.
- **Signed URL:** Use `getSignedSneezePhotoUrl({ path, expiresIn })` when the bucket is private; expires after `expiresIn` seconds (default 3600).

Ensure RLS on `sneeze-photos` allows the policies you need (e.g. insert/select by `auth.uid()`).
