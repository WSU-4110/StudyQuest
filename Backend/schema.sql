drop table if exists users, questions, studysets, currencycosmetics cascade;

--questions
create table questions(
  questions_id integer generated always as identity primary key
--making a temp variable to visualize an array of question objects, this will be created when we have JSON files and objects. all of these sets have questions that can be gameified
  sets json not null default '[]'
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

--Mass User table, this holds all users
create table users(
  user_id integer generated always as identity primary key,
  username varchar(18) not null unique,
  userdata_id integer not null unique references userdata(userdata_id),
  studysets_id integer not null unique references studysets(studysets_id),
  currency_id integer not null unique references currencycosmetics(currency_id)
);

with d as (
  insert into questions default values returning questions_id
),
s as (
  insert into studysets default values returning studysets_id
),
c as (
  insert into currencycosmetics default values returning currency_id
)
insert into users (username, questions_id, studysets_id, currency_id)
select 'testuser', d.questions_id, s.studysets_id, c.currency_id
from d, s, c;

select * from questions;
select * from studysets;
select * from currencycosmetics;
select * from users;

-- everything together, one row per user
select
  u.user_id,
  u.username,
  q.questions_id,
  q.sets  as question_sets,
  s.studysets_id,
  s.sets  as studysets,
  c.currency_id,
  c.currency,
  c.level,
  c.locker
from users u
join questions        q on q.questions_id = u.questions_id
join studysets        s on s.studysets_id = u.studysets_id
join currencycosmetics c on c.currency_id  = u.currency_id;