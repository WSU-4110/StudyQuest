# Installation

How to set up StudyQuest on your own computer, build it, and deploy it.

The live site is at <https://study-quest-phi.vercel.app/>.

## System requirements

| Requirement | Version / notes |
| --- | --- |
| Operating system | Windows, macOS, or Linux |
| [Node.js](https://nodejs.org/) | 20.19 or newer, or 22.12 or newer (required by Vite 8). The latest LTS release is recommended. |
| npm | Comes with Node.js |
| [Git](https://git-scm.com/) | Any recent version |
| Web browser | A current version of Chrome, Edge, Firefox, or Safari |
| [Supabase](https://supabase.com/) project | Needed for accounts, study sets, results, and rewards. A free project works. |
| Gemini API key | Optional. Only needed for study tips on the Quiz Results page. Get one from [Google AI Studio](https://aistudio.google.com/). |

Check your versions:

```bash
node --version
npm --version
git --version
```

### What the project uses

- **Frontend:** React 19, Vite 8, React Router 7, Tailwind CSS 4
- **Backend:** Supabase (Postgres database, authentication, and Edge Functions)
- **AI:** Google Gemini, called from the `study-tips` Supabase Edge Function
- **Hosting:** Vercel

## 1. Get the code

```bash
git clone https://github.com/WSU-4110/StudyQuest.git
cd StudyQuest
```

The React app lives in `Frontend/`. The database schema is in `Backend/`, and the Edge Function is in `supabase/`.

## 2. Install dependencies

```bash
cd Frontend
npm install
```

## 3. Connect to Supabase

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows Command Prompt, use `copy .env.example .env` instead.

2. In the Supabase Dashboard, open **Project Settings → API** and copy the project URL and the `anon` public key into `Frontend/.env`:

   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

`.env` is not committed to Git, so every teammate needs to create their own. If these values are missing, the app shows "Supabase is not configured."

## 4. Set up the database

Pick the case that fits your Supabase project.

**New, empty project:** open the **SQL Editor** in the Supabase Dashboard, paste in all of `Backend/schema.sql`, and run it. It creates the tables, row-level security policies, and functions the app uses (study sets, quiz and game attempts, XP, and currency).

> **Warning:** `schema.sql` starts by dropping existing tables. Never run it on a project that already has data you want to keep.

**Existing project that already has the tables:** only run the migrations in `Backend/migrations/` that haven't been applied yet. For example, `20261112_add_missed_questions_to_game_attempts.sql` adds the `missed_questions` column to `game_attempts`. Migrations use `if not exists`, so running one twice is safe.

## 5. Set up study tips (optional)

The Quiz Results page can generate study tips with Gemini for each saved attempt, on demand. The Gemini API key stays in Supabase and is never added to the frontend `.env`.

1. In the Supabase Dashboard, open **Edge Functions** and create a function named `study-tips`. Paste in `supabase/functions/study-tips/index.ts` and deploy it.
2. In **Edge Functions → Secrets**, add `GEMINI_API_KEY` with your Gemini API key. The function uses the `gemini-3.5-flash-lite` model, so no model secret is needed.
3. Make sure JWT verification is turned on for the function. The Quiz Results page calls it through the signed-in Supabase client.

Tips use the missed questions saved with each practice quiz and game attempt. Attempts saved before the `missed_questions` column was added don't have that data.

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli) instead, from the repository root:

```bash
supabase link --project-ref your-project-ref
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase functions deploy study-tips
```

The rest of the app works without this step; only the study tips feature needs it.

## 6. Run the app locally

From `Frontend/`:

```bash
npm run dev
```

Open <http://localhost:5173>. Vite reloads the page as you edit files.

## 7. Build for production

From `Frontend/`:

```bash
npm run build
```

The built site is written to `Frontend/dist/`. To check the production build locally:

```bash
npm run preview
```

Then open <http://localhost:4173>.

A warning that some chunks are larger than 500 kB is expected and does not stop the build.

## 8. Deploy to Vercel

1. Import the GitHub repository in [Vercel](https://vercel.com/).
2. Set **Root Directory** to `Frontend`. Vercel detects Vite, so the defaults (`npm run build`, output folder `dist`) are correct.
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as your `.env`.
4. Deploy.

`Frontend/vercel.json` sends every route to `index.html`, so links like `/studysets/...` work when the page is refreshed.

## Available scripts

Run these from `Frontend/`:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server at <http://localhost:5173> |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the built site at <http://localhost:4173> |
| `npm run lint` | Runs Oxlint. Oxlint is not in `package.json` yet, so install it first with `npm install --save-dev oxlint`. |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Supabase is not configured" | `Frontend/.env` is missing or has empty values. Check step 3, then restart `npm run dev`. |
| Changes to `.env` aren't picked up | Vite only reads `.env` when it starts. Stop the dev server and run `npm run dev` again. |
| Results screen says "Could not save game result" | The `game_attempts` table or its `missed_questions` column is missing. See step 4. |
| Study tips don't load | The `study-tips` Edge Function isn't deployed or `GEMINI_API_KEY` isn't set. See step 5. |
| `npm install` or `npm run dev` fails with a Node.js version error | Update Node.js to 20.19+ or 22.12+. |
| A page shows 404 after refreshing on Vercel | Make sure `vercel.json` is in `Frontend/` and the Vercel root directory is `Frontend`. |
