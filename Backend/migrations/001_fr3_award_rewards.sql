-- Run this on an existing database instead of schema.sql, which drops every table.

alter table currencycosmetics
  add column if not exists xp integer not null default 0;

-- security definer so the client can't write currencycosmetics directly.
-- Caps must match Frontend/src/Game-Page/rewards.js.
create or replace function public.award_rewards(p_xp integer, p_currency integer)
returns table (xp integer, level integer, currency integer)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_max_xp constant integer := 500;
  v_max_currency constant integer := 100;
  v_xp_per_level constant integer := 500;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_xp is null or p_currency is null or p_xp < 0 or p_currency < 0 then
    raise exception 'Rewards must be zero or positive';
  end if;

  if p_xp > v_max_xp or p_currency > v_max_currency then
    raise exception 'Rewards exceed the per-game limit';
  end if;

  return query
  update currencycosmetics c
  set xp = c.xp + p_xp,
      currency = c.currency + p_currency,
      level = 1 + (c.xp + p_xp) / v_xp_per_level
  from users u
  where u.auth_user_id = v_uid
    and c.currency_id = u.currency_id
  returning c.xp, c.level, c.currency;

  if not found then
    raise exception 'No profile found for this user';
  end if;
end;
$$;

grant execute on function public.award_rewards(integer, integer) to authenticated;

drop policy if exists currencycosmetics_update_own on currencycosmetics;
