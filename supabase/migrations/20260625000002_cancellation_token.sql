-- cancellation_token for secure cancel links
alter table reservations
  add column if not exists cancellation_token text;

create index if not exists reservations_cancellation_token_idx
  on reservations (cancellation_token)
  where cancellation_token is not null;
