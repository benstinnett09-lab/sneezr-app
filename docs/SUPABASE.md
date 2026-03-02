# Supabase integration plan (Sneezr)

## Overview

- **Table:** `public.sneezes` — `id`, `user_id`, `timestamp`, `photo_url`, `created_at`, plus optional assessment fields: `severity`, `trigger`, `environment`, `symptoms`, `intervention`, `assessment_completed_at`, `updated_at`. See `docs/migrations/` for SQL.
- **Bucket:** `sneeze-photos`
- **Auth:** Anonymous sign-in on app start; session persisted with AsyncStorage.

**Enable anonymous sign-in:** In Supabase Dashboard → **Authentication** → **Providers** → find **Anonymous** → turn it **On**. Otherwise you’ll see “Anonymous sign-ins are disabled”.

**Create the storage bucket:** In Supabase Dashboard → **Storage** → **New bucket**. Name it **`sneeze-photos`** (must match exactly). Choose **Public bucket** if you want public photo URLs, or **Private** and use signed URLs later. Click **Create bucket**. Then open the bucket → **Policies** → add a policy that allows authenticated (and optionally anon) users to **INSERT** and **SELECT** (e.g. “Allow uploads for authenticated users” and “Allow public read” if the bucket is public).

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

---

## Storage troubleshooting (photos not loading)

If uploads succeed but photos don’t show in the app (Event tab or modal), work through this.

### 1. Bucket exists and name is exact

- **Storage** → **Buckets**.
- You must have a bucket named **`sneeze-photos`** (lowercase, hyphen). If you created `Sneeze-Photos` or `sneeze_photos`, create a new bucket with the exact name `sneeze-photos` and use it.

### 2. Make the bucket public (simplest for photos)

- Open the **sneeze-photos** bucket.
- Click the **⋮** (or **Settings**) next to the bucket name.
- Ensure **Public bucket** is **On**.  
  If it’s off, the “public” URL we store won’t serve files; the app falls back to signed URLs, which still require a **read** policy below.

### 3. Add Storage policies (required for upload + read)

Storage uses **Policies** (RLS). You need at least **INSERT** (upload) and **SELECT** (read).

**In the dashboard:**

1. Go to **Storage** → open **sneeze-photos** → **Policies** (or **New policy**).
2. If you see **“New policy”** / **“Create policy”**:
   - Create **two** policies (one for upload, one for read).

**Policy 1 – Allow uploads (INSERT)**

- **Policy name:** `Allow uploads to sneeze-photos`
- **Allowed operation:** **INSERT** only.
- **Target roles:** check **authenticated** and **anon** (anonymous users need to upload).
- **WITH CHECK expression:**  
  `(bucket_id = 'sneeze-photos')`  
  or, if the UI only has a simple toggle, use “Allow insert for authenticated users” and include **anon** if possible.

**Policy 2 – Allow reads (SELECT)**

- **Policy name:** `Allow read sneeze-photos`
- **Allowed operation:** **SELECT** only.
- **Target roles:** **authenticated** and **anon**.
- **USING expression:**  
  `(bucket_id = 'sneeze-photos')`  
  or “Allow read for all users” / “Public read” for this bucket.

Without **SELECT**, signed URLs and public URLs will both return 403 and images won’t load.

### 4. Apply same policies via SQL (if the UI is unclear)

In **SQL Editor** → **New query**, run:

```sql
-- Allow uploads (anon + authenticated)
create policy "Allow uploads to sneeze-photos"
on storage.objects for insert
to public
with check (bucket_id = 'sneeze-photos');

-- Allow reads (anon + authenticated) – required for images to load
create policy "Allow read sneeze-photos"
on storage.objects for select
to public
using (bucket_id = 'sneeze-photos');
```

If you get “policy already exists”, delete the existing policies for this bucket in **Storage** → **Policies** and run again, or adjust the names.

### 5. Quick test

1. In the app, record one event **with** evidence (take or choose a photo).
2. In Supabase go to **Storage** → **sneeze-photos** and confirm a folder/file appeared.
3. Open the **Table Editor** → **sneezes** and copy the `photo_url` of that row (e.g. `https://….supabase.co/storage/v1/object/public/sneeze-photos/…`).
4. Paste that URL in a browser tab:
   - If the image loads, the bucket and read policy are fine; the issue is likely in the app (e.g. cache, or wrong URL in the list).
   - If you get **403 Forbidden**, the read policy or “Public bucket” setting is still wrong (re-check step 2 and 3).
   - If you get **404**, the object path or bucket name is wrong (re-check step 1 and the stored URL).

### 6. Checklist

- [ ] Bucket name is exactly **sneeze-photos**.
- [ ] **Public bucket** is **On** (or you have a SELECT policy and use signed URLs).
- [ ] Policy allows **INSERT** for `sneeze-photos` (anon + authenticated).
- [ ] Policy allows **SELECT** for `sneeze-photos` (anon + authenticated).
- [ ] Test: open stored `photo_url` in browser → image loads (or 200, not 403).
