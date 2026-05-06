# Dopamine Diet

A personal deep-work dashboard for planning weekly focus, running daily work blocks, logging shipped wins, and tracking consistency.

Live app: https://sai21112000.github.io/Dopamine.Diet/

## Features

- Daily deep-work checklist with two focus blocks, reward tracking, and daily grades.
- Weekly planning view with flagship projects, parking lot, learning sprint, and archive.
- Local-first storage using `localStorage`.
- Markdown export for weekly and daily progress logs.
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

## GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`. After pushing to GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` to deploy.
