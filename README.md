# Sneezr

A serious scientific logging tool for nasal events. Expo (React Native) + TypeScript + Supabase.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with your Supabase URL and anon key:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Run

```bash
npx expo start
```

## Stack

- **Expo** ~55, **React Native**, **TypeScript**
- **React Navigation** (bottom tabs): Monitor, Event Log, Analysis, Subject
- **Zustand** (local state), **Supabase** (auth, DB, storage)
- Anonymous auth; events stored in `public.sneezes`; photos in bucket `sneeze-photos`

## Screens

- **Monitor** — Nasal activity readout, record event (photo optional), haptic + confirmation
- **Event Log** — List events (timestamp, thumbnail, evidence label), tap for fullscreen photo viewer
- **Analysis** — Stats (total, today, mean/day, peak hour, continuity index), activity-by-day table
- **Subject** — Subject ID, total events, export data, clear cache, sign out

See `docs/ARCHITECTURE.md` and `docs/SUPABASE.md` for structure and Supabase details.
