-- SMS onayı (KVKK) için reservations tablosuna kolon ekle
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS sms_consent BOOLEAN NOT NULL DEFAULT false;
