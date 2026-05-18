-- Add translation columns to hizmetler table
ALTER TABLE hizmetler
  ADD COLUMN IF NOT EXISTS ad_en text,
  ADD COLUMN IF NOT EXISTS ad_ar text,
  ADD COLUMN IF NOT EXISTS ad_de text,
  ADD COLUMN IF NOT EXISTS ad_da text,
  ADD COLUMN IF NOT EXISTS ad_es text,
  ADD COLUMN IF NOT EXISTS ad_ru text;

-- Add translation columns to services table
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS name_de text,
  ADD COLUMN IF NOT EXISTS name_da text,
  ADD COLUMN IF NOT EXISTS name_es text,
  ADD COLUMN IF NOT EXISTS name_ru text;

-- Populate hizmetler translations for known service names
UPDATE hizmetler SET
  ad_en = 'Haircut',
  ad_ar = 'قص الشعر',
  ad_de = 'Haarschnitt',
  ad_da = 'Hårklip',
  ad_es = 'Corte de cabello',
  ad_ru = 'Стрижка'
WHERE ad = 'Saç Kesimi';

UPDATE hizmetler SET
  ad_en = 'Beard Shave',
  ad_ar = 'حلاقة اللحية',
  ad_de = 'Bartrasur',
  ad_da = 'Barberbarbering',
  ad_es = 'Afeitado de barba',
  ad_ru = 'Бритье бороды'
WHERE ad = 'Sakal Tıraşı';

UPDATE hizmetler SET
  ad_en = 'Hair & Beard',
  ad_ar = 'الشعر واللحية',
  ad_de = 'Haare & Bart',
  ad_da = 'Hår og skæg',
  ad_es = 'Cabello & Barba',
  ad_ru = 'Волосы и борода'
WHERE ad = 'Saç + Sakal';

UPDATE hizmetler SET
  ad_en = 'Hair Coloring',
  ad_ar = 'صباغة الشعر',
  ad_de = 'Haare färben',
  ad_da = 'Hårfarve',
  ad_es = 'Coloración',
  ad_ru = 'Окрашивание волос'
WHERE ad = 'Saç Boyama';

UPDATE hizmetler SET
  ad_en = 'Blow Dry',
  ad_ar = 'مجفف الشعر',
  ad_de = 'Föhnen',
  ad_da = 'Tørring',
  ad_es = 'Secado',
  ad_ru = 'Укладка феном'
WHERE ad = 'Fön';

UPDATE hizmetler SET
  ad_en = 'Cut & Blow Dry',
  ad_ar = 'قص وتجفيف',
  ad_de = 'Schnitt + Föhnen',
  ad_da = 'Klip + Tørring',
  ad_es = 'Corte + Secado',
  ad_ru = 'Стрижка + Укладка'
WHERE ad = 'Makas + Fön';

UPDATE hizmetler SET
  ad_en = 'Highlights',
  ad_ar = 'صبغ خصلات',
  ad_de = 'Highlights',
  ad_da = 'Highlights',
  ad_es = 'Reflejos',
  ad_ru = 'Мелирование'
WHERE ad = 'Röfle';

UPDATE hizmetler SET
  ad_en = 'Keratin Treatment',
  ad_ar = 'علاج الكيراتين',
  ad_de = 'Keratin-Behandlung',
  ad_da = 'Keratinbehandling',
  ad_es = 'Tratamiento de keratina',
  ad_ru = 'Кератиновое выпрямление'
WHERE ad = 'Keratin Bakımı';

UPDATE hizmetler SET
  ad_en = 'Manicure',
  ad_ar = 'مانيكير',
  ad_de = 'Maniküre',
  ad_da = 'Manicure',
  ad_es = 'Manicura',
  ad_ru = 'Маникюр'
WHERE ad = 'Manikür';

UPDATE hizmetler SET
  ad_en = 'Pedicure',
  ad_ar = 'باديكير',
  ad_de = 'Pediküre',
  ad_da = 'Pedicure',
  ad_es = 'Pedicura',
  ad_ru = 'Педикюр'
WHERE ad = 'Pedikür';

UPDATE hizmetler SET
  ad_en = 'Facial',
  ad_ar = 'عناية بالوجه',
  ad_de = 'Gesichtsbehandlung',
  ad_da = 'Ansigtsbehandling',
  ad_es = 'Tratamiento facial',
  ad_ru = 'Уход за лицом'
WHERE ad = 'Yüz Bakımı';

UPDATE hizmetler SET
  ad_en = 'Peeling',
  ad_ar = 'تقشير',
  ad_de = 'Peeling',
  ad_da = 'Peeling',
  ad_es = 'Peeling',
  ad_ru = 'Пилинг'
WHERE ad = 'Peeling';

UPDATE hizmetler SET
  ad_en = 'Permanent Makeup',
  ad_ar = 'مكياج دائم',
  ad_de = 'Permanent Make-up',
  ad_da = 'Permanent Makeup',
  ad_es = 'Maquillaje permanente',
  ad_ru = 'Перманентный макияж'
WHERE ad = 'Kalıcı Makyaj';

UPDATE hizmetler SET
  ad_en = 'Gel Nails',
  ad_ar = 'طلاء أظافر دائم',
  ad_de = 'Gel-Nagellack',
  ad_da = 'Gellak',
  ad_es = 'Esmalte en gel',
  ad_ru = 'Гель-лак'
WHERE ad = 'Kalıcı Oje';

UPDATE hizmetler SET
  ad_en = 'Swedish Massage',
  ad_ar = 'المساج السويدي',
  ad_de = 'Schwedische Massage',
  ad_da = 'Svensk massage',
  ad_es = 'Masaje sueco',
  ad_ru = 'Шведский массаж'
WHERE ad = 'İsveç Masajı';

UPDATE hizmetler SET
  ad_en = 'Aromatherapy Massage',
  ad_ar = 'مساج بالعطور',
  ad_de = 'Aromaterapie-Massage',
  ad_da = 'Aromaterapi Massage',
  ad_es = 'Masaje de aromaterapia',
  ad_ru = 'Аромамассаж'
WHERE ad = 'Aromaterapi Masajı';

UPDATE hizmetler SET
  ad_en = 'Couples Massage',
  ad_ar = 'مساج للزوجين',
  ad_de = 'Paarmassage',
  ad_da = 'Parmassage',
  ad_es = 'Masaje en pareja',
  ad_ru = 'Массаж для пар'
WHERE ad = 'Çift Masaj';

-- Populate services translations
UPDATE services SET
  name_en = 'Table Reservation',
  name_ar = 'حجز طاولة',
  name_de = 'Tischreservierung',
  name_da = 'Bordreservering',
  name_es = 'Reserva de mesa',
  name_ru = 'Бронирование столика'
WHERE name = 'Masa Rezervasyonu';
