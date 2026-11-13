alter table public.game_attempts
  add column if not exists missed_questions jsonb not null default '[]'::jsonb;
