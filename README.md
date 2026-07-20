# Terra Soccer Admin WebApp

Staff Admin SPA for SpherEarth platforms (`website`, `soccer-academy`, …).

Talks to [Terra.Software.Admin.API](https://github.com/SpherEarth-Inc/Terra.Software.Admin.API).

## Features

- Staff JWT login + refresh
- Accept invite at `/accept-invite`
- Top navbar **platform switcher** (next to profile) after login
- News CMS (TipTap), media library, staff invites

## Setup

```bash
cd C:\SpherEarthCanada\Terra.Soccer.Admin.WebApp
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (required — no localhost fallback). Example:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.spherearth.ca
```

Admin.API CORS should allow this app’s origin, e.g.:

```text
FRONTEND_URL=http://localhost:3000
INVITE_ACCEPT_BASE_URL=http://localhost:3000/accept-invite
```

## Env

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | **Required.** Admin API origin (no trailing slash), e.g. `https://api.spherearth.ca` |

## Notes

- Not a static DreamHost export — keep tokens in the browser against the API.
- Platform selection is persisted in `localStorage` and scopes news/media/invites.
