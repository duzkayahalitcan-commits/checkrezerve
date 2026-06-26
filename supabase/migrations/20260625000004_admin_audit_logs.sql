-- Admin audit log table
create table if not exists admin_audit_logs (
  id            uuid primary key default gen_random_uuid(),
  admin_id      uuid references auth.users(id) on delete set null,
  action        text not null,
  target_type   text not null,
  target_id     text,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);

create index if not exists admin_audit_logs_created_at_idx on admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_action_idx     on admin_audit_logs (action);
