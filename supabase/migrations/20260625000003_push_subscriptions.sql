-- Push notification subscriptions table
create table if not exists push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  endpoint      text not null,
  keys_p256dh   text not null,
  keys_auth     text not null,
  created_at    timestamptz default now(),
  unique(endpoint)
);

create index if not exists push_subscriptions_user_id_idx
  on push_subscriptions (user_id);
