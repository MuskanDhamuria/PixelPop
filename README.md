# PixelPop

PixelPop is a React + Vite web app for gamers to connect, compete, and explore community content.

## Features
- Authentication flow with login/signup
- Dashboard experience for signed-in users
- Leaderboard view
- Community section
- Friends page with chat features
- Chatbot page
- Profile page
- Supabase-backed auth and Edge Function API integration

## Tech Stack
- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Supabase (Auth + Edge Functions)

## Project Structure
- `src/app/components` UI screens and reusable components
- `src/app/context` React context providers
- `src/app/utils` frontend auth and API utilities
- `utils/supabase/info.tsx` Supabase project metadata used by the app
- `supabase/functions/make-server-9f7f41c6` Supabase Edge Function source
- `.github/workflows/deploy-pages.yml` GitHub Pages deployment workflow

## Prerequisites
- Node.js 20+
- npm 10+

## Local Development
1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```
3. Open the local URL shown by Vite (typically `http://localhost:5173`).

## Build
```bash
npm run build
```

## Environment Variables
Create or update `.env` in the project root:
```env
VITE_GEMINI_API_KEY=your_key_here
VITE_GEMINI_MODEL=gemini-3-flash-preview
```

## Supabase Setup Notes
This repo is currently wired to a Supabase project via `utils/supabase/info.tsx`.

If you need to relink or redeploy functions:
1. Install Supabase CLI
2. Login: `supabase login`
3. Link project: `supabase link --project-ref <your_project_ref>`
4. Deploy function:
```bash
supabase functions deploy make-server-9f7f41c6
```

## Deploy to GitHub Pages
This repo uses a GitHub Actions workflow that builds from `main` and publishes `dist` to the `gh-pages` branch.

### One-time GitHub settings
1. Go to `Settings -> Pages`
2. Set `Source` to `Deploy from a branch`
3. Select branch `gh-pages` and folder `/ (root)`

### Deploy
Push to `main`:
```bash
git push origin main
```
The workflow at `.github/workflows/deploy-pages.yml` will run automatically.

Live URL format:
- `https://<your-github-username>.github.io/PixelPop/`

## Troubleshooting
- If GitHub Actions fails due to branch/environment restrictions, confirm Pages source is `gh-pages` branch.
- If local PowerShell blocks npm scripts, run `npm.cmd <script>` (for example: `npm.cmd run build`).
- If API calls fail, verify Supabase function deployment and keys in `utils/supabase/info.tsx`.
