drop function if exists public.ensure_app_user(text);
drop table if exists users, userdata, studysets, currencycosmetics, quiz_attempts cascade;

--user data
create table userdata(
  userdata_id integer generated always as identity primary key,
  email varchar(50) not null unique,
  password varchar(50) not null
);

--user study sets
create table studysets(
  studysets_id integer generated always as identity primary key,
--making a temp variable to visualize an array of studyset objects, this will be created when we have JSON files and objects. all of these sets have questions that can be gameified
  sets json not null default '[]'
);

--user currency/cosmetics
create table currencycosmetics(
  currency_id integer generated always as identity primary key,
  currency integer not null default 0,
  level integer not null default 1,
--created a temp variable to visualize the array of cosmetic items. This will be created when we can make objects from JSON files
  locker json not null default '[]'
);

--quiz attempt table, this keeps track of user quiz data
create table quiz_attempts(
  quiz_id integer generated always as identity primary key,
  currQuiz integer not null default 0,
  prevQuiz integer not null default 0,
  currTot integer not null default 0,
  prevTot integer not null default 0,
  currDate timestamptz,
  prevDate timestamptz
);

--Mass User table, this holds all users
create table users(
  user_id integer generated always as identity primary key,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  username varchar(18) not null unique,
  userdata_id integer not null unique references userdata(userdata_id),
  studysets_id integer not null unique references studysets(studysets_id),
  currency_id integer not null unique references currencycosmetics(currency_id),
  quiz_id integer not null unique references quiz_attempts(quiz_id)
);

-- everything together, one row per user (read path for the facade)
create or replace view public.user_overview
with (security_invoker = true) as
select
  u.user_id,
  u.username,
  u.auth_user_id,
  d.userdata_id,
  d.email,
  s.studysets_id,
  s.sets as studysets,
  c.currency_id,
  c.currency,
  c.level,
  c.locker,
  q.currquiz,
  q.prevquiz,
  q.currdate,
  q.prevdate,
  q.currtot,
  q.prevtot
from users u
join userdata d on d.userdata_id = u.userdata_id
join studysets s on s.studysets_id = u.studysets_id
join currencycosmetics c on c.currency_id = u.currency_id
join quiz_attempts q on q.quiz_id = u.quiz_id;

grant select on public.user_overview to authenticated;

create or replace function public.record_quiz_result(
  p_correct integer,
  p_total integer
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_total <= 0 or p_correct < 0 or p_correct > p_total then
    raise exception 'Quiz results must have a valid correct count and total.';
  end if;

  update public.quiz_attempts q
  set
    prevquiz = case when q.currdate is null then q.prevquiz else q.currquiz end,
    prevtot = case when q.currdate is null then q.prevtot else q.currtot end,
    prevdate = case when q.currdate is null then q.prevdate else q.currdate end,
    currquiz = p_correct,
    currtot = p_total,
    currdate = now()
  from public.users u
  where u.quiz_id = q.quiz_id
    and u.auth_user_id = auth.uid();

  if not found then
    raise exception 'Could not find a quiz record for the signed-in user.';
  end if;
end;
$$;

grant execute on function public.record_quiz_result(integer, integer)
  to authenticated;

create or replace function public.ensure_app_user(p_username text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_username text;
  v_userdata_id integer;
  v_studysets_id integer;
  v_currency_id integer;
  v_quiz_id integer;
  v_existing_studysets_id integer;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select studysets_id
  into v_existing_studysets_id
  from users
  where auth_user_id = v_uid;

  if found then
    return v_existing_studysets_id;
  end if;

  select email into v_email from auth.users where id = v_uid;
  v_email := left(coalesce(nullif(v_email, ''), v_uid::text || '@users.local'), 50);

  v_username := regexp_replace(
    coalesce(nullif(trim(p_username), ''), split_part(v_email, '@', 1), 'user'),
    '[^a-zA-Z0-9_]',
    '',
    'g'
  );
  if v_username = '' then
    v_username := 'user';
  end if;
  v_username := left(v_username, 12);
  v_username := left(v_username || '_' || substr(replace(v_uid::text, '-', ''), 1, 5), 18);

  select userdata_id into v_userdata_id from userdata where email = v_email;
  if not found then
    insert into userdata (email, password)
    values (v_email, 'auth')
    returning userdata_id into v_userdata_id;
  end if;

  insert into studysets default values
  returning studysets_id into v_studysets_id;

  insert into currencycosmetics default values
  returning currency_id into v_currency_id;

  insert into quiz_attempts default values
  returning quiz_id into v_quiz_id;

  insert into users (username, userdata_id, studysets_id, currency_id, quiz_id, auth_user_id)
  values (v_username, v_userdata_id, v_studysets_id, v_currency_id, v_quiz_id, v_uid);

  return v_studysets_id;
end;
$$;

grant execute on function public.ensure_app_user(text) to authenticated;

alter table users enable row level security;
alter table userdata enable row level security;
alter table studysets enable row level security;
alter table currencycosmetics enable row level security;
alter table quiz_attempts enable row level security;

drop policy if exists users_select_own on users;
drop policy if exists users_update_own on users;
create policy users_select_own on users
  for select using (auth_user_id = auth.uid());
create policy users_update_own on users
  for update using (auth_user_id = auth.uid());

drop policy if exists userdata_select_own on userdata;
drop policy if exists userdata_update_own on userdata;
create policy userdata_select_own on userdata
  for select using (
    userdata_id in (select userdata_id from users where auth_user_id = auth.uid())
  );
create policy userdata_update_own on userdata
  for update using (
    userdata_id in (select userdata_id from users where auth_user_id = auth.uid())
  );

drop policy if exists studysets_select_own on studysets;
drop policy if exists studysets_update_own on studysets;
create policy studysets_select_own on studysets
  for select using (
    studysets_id in (select studysets_id from users where auth_user_id = auth.uid())
  );
create policy studysets_update_own on studysets
  for update using (
    studysets_id in (select studysets_id from users where auth_user_id = auth.uid())
  )
  with check (
    studysets_id in (select studysets_id from users where auth_user_id = auth.uid())
  );

drop policy if exists currencycosmetics_select_own on currencycosmetics;
drop policy if exists currencycosmetics_update_own on currencycosmetics;
create policy currencycosmetics_select_own on currencycosmetics
  for select using (
    currency_id in (select currency_id from users where auth_user_id = auth.uid())
  );
create policy currencycosmetics_update_own on currencycosmetics
  for update using (
    currency_id in (select currency_id from users where auth_user_id = auth.uid())
  );
create policy quiz_attempts_select_own on quiz_attempts
  for select using (
    quiz_id in (select quiz_id from users where auth_user_id = auth.uid())
  );
create policy quiz_attempts_update_own on quiz_attempts
  for update using (
    quiz_id in (select quiz_id from users where auth_user_id = auth.uid())
  );
