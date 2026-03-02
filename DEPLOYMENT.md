# Deploying Sneezr to Vercel

Step-by-step guide to deploy the Expo web build to Vercel and connect a custom domain.

---

## 1. Vercel build settings

The repo is already configured via `vercel.json`. Vercel will use:

| Setting | Value |
|--------|--------|
| **Build command** | `npm run build:web` |
| **Output directory** | `dist` |

No need to change these in the dashboard unless you override with project settings.

---

## 2. Deploy from Git

1. Go to [vercel.com](https://vercel.com) and sign in.
2. **Add New** → **Project** and import your Git repository.
3. Leave **Framework Preset** as detected (or “Other”); build command and output are read from `vercel.json`.
4. Under **Environment Variables**, add:
   - `EXPO_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key
5. Click **Deploy**. The first deployment will run `npm run build:web` and serve the `dist` folder.

---

## 3. Add a custom domain

1. Open your project on Vercel → **Settings** → **Domains**.
2. Enter your domain (e.g. `sneezr.example.com` or `example.com`) and click **Add**.
3. Vercel shows which DNS records to create. Follow the instructions for your registrar.

---

## 4. DNS records (apex + www)

Typical setup:

**Apex (root) domain — e.g. `example.com`**

| Type | Name | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |

(Vercel may show a different A record; use the IP they give.)

**www subdomain — e.g. `www.example.com`**

| Type | Name | Value |
|------|------|--------|
| CNAME | `www` | `cname.vercel-dns.com` |

Again, use the exact **Name** and **Value** shown in the Vercel Domains panel for your project; they can vary.

**Optional:** In Vercel Domains you can add both `example.com` and `www.example.com`, then choose which one redirects to the other (e.g. redirect apex → www or www → apex).

---

## 5. Verify HTTPS

1. Wait for DNS to propagate (minutes to 48 hours). Vercel will issue a certificate automatically once it can verify the domain.
2. In the project **Domains** page, confirm the domain shows a green check and “Valid” or “Ready”.
3. In a browser:
   - Open `https://yourdomain.com` (and `https://www.yourdomain.com` if you use www).
   - Confirm the lock icon and that the certificate is valid (click the lock → certificate).
4. Use [https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/) and enter your domain to double-check TLS configuration.

If the certificate stays “Pending”, check that the A and CNAME records match exactly what Vercel shows and that no other records (e.g. conflicting CNAME on apex) override them.
