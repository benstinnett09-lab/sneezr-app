# Sneezr

Nasal event telemetry app — Expo (React Native) with web support.

## Development

- `npm start` — start Expo dev server
- `npm run web` — run in browser
- `npm run ios` / `npm run android` — run on device/simulator

## Web static build (Vercel)

The app is configured for static web export and deployment on Vercel.

- **Build output directory:** `dist/`  
  Running the web export produces a static site in `dist/`. Do not change this without updating `vercel.json` and the build command.

- **Build command:**  
  `npm run build:web` (runs `expo export --platform web`)

- **Config:**  
  - `app.config.js` sets `expo.web.output` to `"single"` (SPA: one `index.html`); use `"static"` only if you use Expo Router with static routes.  
  - `vercel.json` sets `outputDirectory` to `"dist"` and rewrites all routes to `/index.html` for SPA routing.

### Deploying to Vercel

1. Set env vars in the Vercel project (e.g. `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
2. Connect the repo; Vercel will use `vercel.json` (build command and output directory).
3. Deploy. The static site is served from `dist/`.

### Local static preview

After building:

```bash
npm run build:web
npx serve dist
```

Then open the URL shown (e.g. http://localhost:3000).
