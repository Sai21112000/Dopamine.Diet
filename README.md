# Dopamine Diet

A personal deep-work dashboard for planning weekly focus, running daily work blocks, logging shipped wins, and tracking consistency.

## Features

- Daily deep-work checklist with two focus blocks, reward tracking, and daily grades.
- Weekly planning view with flagship projects, parking lot, learning sprint, and archive.
- Local-first storage using `localStorage`.
- Optional Supabase sync when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.
- GitHub Pages deployment workflow included.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Supabase Sync

The app works without Supabase and keeps data in the browser. To enable remote sync:

1. Create a Supabase project.
2. Run the migration in `supabase/migrations`.
3. Copy `.env.example` to `.env`.
4. Fill in:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For GitHub Pages, add the same values as repository secrets if you want cloud sync in the hosted app. Leave them unset for local-only storage.

## GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`. After pushing to GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` to deploy.
