create table if not exists sms_logs (
  id         uuid primary key default gen_random_uuid(),
  provider   text not null default 'mock',
  to_number  text not null,
  body       text not null,
  status     text not null default 'simulated',
  created_at timestamptz not null default now()
);

create index if not exists sms_logs_created_idx on sms_logs (created_at desc);
