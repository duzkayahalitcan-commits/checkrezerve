-- ─────────────────────────────────────────────────────────────────────────────
-- EMAIL LOGS + RESERVATION TRIGGER (pure SQL, no Edge Functions)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add email columns to existing tables
alter table restaurants
  add column if not exists email text;

alter table reservations
  add column if not exists guest_email text;

-- 2. email_logs table — pending emails queue
create table if not exists email_logs (
  id               uuid default gen_random_uuid() primary key,
  reservation_id   uuid references reservations(id) on delete cascade,
  recipient_email  text not null,
  subject          text not null,
  body             text not null,
  sent_at          timestamptz default now(),
  status           text default 'pending'
                     check (status in ('pending', 'sent', 'failed'))
);

create index if not exists email_logs_reservation_id_idx on email_logs (reservation_id);
create index if not exists email_logs_status_idx         on email_logs (status);

-- 3. Trigger function — pure plpgsql, no HTTP calls
create or replace function log_reservation_email()
returns trigger as $$
declare
  v_restaurant_name  text;
  v_restaurant_email text;
  v_calisan_name     text := null;
  v_hizmet_name      text := null;
  v_detail_line      text;
  v_time_str         text;
  v_biz_subject      text;
  v_biz_body         text;
  v_cust_subject     text;
  v_cust_body        text;
begin
  -- Fetch restaurant info
  select name, email
    into v_restaurant_name, v_restaurant_email
    from restaurants
   where id = new.restaurant_id;

  -- Fetch calisan name (beauty bookings)
  if new.calisan_id is not null then
    select ad into v_calisan_name
      from calisanlar
     where id = new.calisan_id;
  end if;

  -- Fetch hizmet name (beauty bookings)
  if new.hizmet_id is not null then
    select ad into v_hizmet_name
      from hizmetler
     where id = new.hizmet_id;
  end if;

  -- Format time as HH:MM
  v_time_str := substring(new.reserved_time::text from 1 for 5);

  -- Build detail line (beauty vs restaurant)
  if v_calisan_name is not null then
    v_detail_line := format('Çalışan: %s%s',
      v_calisan_name,
      case when v_hizmet_name is not null then ' | Hizmet: ' || v_hizmet_name else '' end
    );
  else
    v_detail_line := format('Kişi Sayısı: %s kişi',
      coalesce(new.party_size::text, '—')
    );
  end if;

  -- ── Email to business ────────────────────────────────────────────────────
  v_biz_subject := format('Yeni Rezervasyon — %s (%s %s)',
    coalesce(new.guest_name, 'Misafir'),
    new.reserved_date,
    v_time_str
  );

  v_biz_body := format(
    'İşletme: %s' || chr(10) ||
    'Müşteri: %s' || chr(10) ||
    'Telefon: %s' || chr(10) ||
    'Tarih: %s'   || chr(10) ||
    'Saat: %s'    || chr(10) ||
    '%s'          || chr(10) ||
    chr(10) ||
    'Panelden onaylayın: https://checkrezerve.com/panel/%s',
    coalesce(v_restaurant_name, '—'),
    coalesce(new.guest_name, '—'),
    coalesce(new.guest_phone, '—'),
    coalesce(new.reserved_date::text, '—'),
    v_time_str,
    v_detail_line,
    coalesce(
      (select slug from restaurants where id = new.restaurant_id),
      ''
    )
  );

  insert into email_logs (reservation_id, recipient_email, subject, body)
  values (
    new.id,
    coalesce(v_restaurant_email, 'info@checkrezerve.com'),
    v_biz_subject,
    v_biz_body
  );

  -- ── Email to customer (only if guest_email provided) ─────────────────────
  if new.guest_email is not null and trim(new.guest_email) != '' then
    v_cust_subject := format('Rezervasyonunuz Alındı — %s',
      coalesce(v_restaurant_name, 'CheckRezerve')
    );

    v_cust_body := format(
      'Merhaba %s,' || chr(10) || chr(10) ||
      '%s için rezervasyonunuz alındı.' || chr(10) || chr(10) ||
      'Tarih: %s'   || chr(10) ||
      'Saat: %s'    || chr(10) ||
      '%s'          || chr(10) || chr(10) ||
      'Durum: Onay Bekliyor' || chr(10) || chr(10) ||
      'İşletme onayladığında bilgilendirileceksiniz.' || chr(10) ||
      '— CheckRezerve',
      coalesce(new.guest_name, 'Sayın Müşteri'),
      coalesce(v_restaurant_name, '—'),
      coalesce(new.reserved_date::text, '—'),
      v_time_str,
      v_detail_line
    );

    insert into email_logs (reservation_id, recipient_email, subject, body)
    values (
      new.id,
      trim(new.guest_email),
      v_cust_subject,
      v_cust_body
    );
  end if;

  return new;
exception when others then
  -- Never block a reservation insert due to email logging failure
  raise warning 'log_reservation_email error: %', sqlerrm;
  return new;
end;
$$ language plpgsql security definer;

-- 4. Attach trigger
drop trigger if exists on_reservation_created on reservations;

create trigger on_reservation_created
  after insert on reservations
  for each row
  execute function log_reservation_email();
