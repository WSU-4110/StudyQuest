# React + Vite

## Gemini study tips (Supabase Edge Function)

The Quiz Results history page can generate tips for each saved attempt using the
`study-tips` Supabase Edge Function. Generation is on demand. Keep the Gemini
API key in Supabase Function secrets; do not add it to frontend environment
variables.

1. In Supabase Dashboard, open **Edge Functions** and create a function named
   `study-tips`. Paste in `supabase/functions/study-tips/index.ts` and deploy.
2. In **Edge Functions → Secrets**, add:
   - `GEMINI_API_KEY`: your Gemini API key
   - The function uses the stable `gemini-3.5-flash-lite` model; no model secret
     is needed.
3. If `game_attempts` already exists, run
   `Backend/migrations/20261112_add_missed_questions_to_game_attempts.sql` in
   the Supabase SQL Editor. Do not rerun the full schema file on a populated
   database because it drops existing tables.
4. Ensure JWT verification is enabled for the function. The Quiz Results page
   calls it through the authenticated Supabase client. New practice quiz and
   game attempts save missed-question details; old attempts lack that data.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
