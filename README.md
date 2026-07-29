# Balon Admin WebApp

Staff admin UI for Balon (news, media, invites, employees).

API: [Balon.Admin.API](https://github.com/SpherEarth-Inc/Balon.Admin.API) — production  
`https://balon-admin-api.spherearth.ca`

Production site: **https://balon-admin.spherearth.ca** (static export on DreamHost).

## Features

- Staff JWT login + refresh
- Accept invite at `/accept-invite/`
- News CMS (TipTap), media library, staff invites, employees/roles

## Setup

```bash
cd C:\SpherEarthCanada\Balon.Admin.WebApp
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```text
NEXT_PUBLIC_API_BASE_URL=https://balon-admin-api.spherearth.ca
```

Admin.API CORS / invite links should allow this app’s origin:

```text
FRONTEND_URL=https://balon-admin.spherearth.ca
FRONTEND_URLS=http://localhost:3000
INVITE_ACCEPT_BASE_URL=https://balon-admin.spherearth.ca/accept-invite
```

## Env

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | **Required.** Admin API origin (no trailing slash) |

## Deploy (DreamHost)

Pushes to `main` run [`.github/workflows/deploy-dreamhost.yml`](.github/workflows/deploy-dreamhost.yml): build static `out/` and SFTP-sync to `/home/<username>/<folder>/`.

GitHub **Secrets** (Actions):

| Secret | Value |
|--------|--------|
| `DREAMHOST_SFTP_SERVER` | hostname only (no `sftp://`) |
| `DREAMHOST_SFTP_USERNAME` | SFTP user |
| `DREAMHOST_SFTP_PASSWORD` | SFTP password |
| `DREAMHOST_SFTP_FOLDER_NAME` | domain folder only, e.g. `balon-admin.spherearth.ca` |

Optional **Variable**: `NEXT_PUBLIC_API_BASE_URL` (defaults to `https://balon-admin-api.spherearth.ca`).

Manual run: Actions → **Deploy to DreamHost** → Run workflow.
