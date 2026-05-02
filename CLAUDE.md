# CheckRezerve — CLAUDE.md

## Proje
İşletmelere özel rezervasyon ve randevu yönetim sistemi.
Restoranlar, kafeler, barlar, berberler, kuaförler, spa/güzellik salonları.

## Klasörler (KARIŞTIRILMAMALI)
- ~/Desktop/checkrezerve → Backend (FastAPI) + Web
- ~/Desktop/checkrezerve-app → Expo/React Native mobil uygulama
- ~/Desktop/phoebix → TAMAMEN AYRI proje, bu projede bahsetme

## Stack
- Backend: FastAPI (Python), async-first
- ORM: SQLAlchemy 2.x (mapped_column + Mapped type hints)
- Migration: Alembic
- Database: Supabase PostgreSQL (posarvagedpqtsrcrwfe)
- Auth: Supabase JWKS (ES256), get_current_user dependency
- Mobile: Expo / React Native
- Deploy: VPS 161.97.68.236, Docker + docker-compose
- SSH: ~/.ssh/checkrezerve_vps
- Web klasörü: /opt/checkrezerve
- Domain: checkrezerve.com

## Veritabanı Tabloları
restaurants, reservations, calisanlar, hizmetler,
user_favorites, profiles, masa_tipleri

## Rol Sistemi
super_admin, isletme_admin, isletme_calisan

## Test Kullanıcıları
- ceviz@checkrezerve.com / Ceviz2024 → isletme_admin
- ceviz.manager@checkrezerve.com / Manager2024 → isletme_calisan
- checkrezerve@proton.me → super_admin

## Kurallar
- Env değerleri hardcode etme, her zaman .env'den oku
- Async-first: tüm DB işlemleri async olmalı
- Over-engineering yapma, basit tut
- Her route dosyası tek bir domain'e ait olmalı
- Sync kütüphaneler (Gemini SDK gibi) → asyncio.to_thread() ile sar

## Komutlar
- Production deploy: ssh VPS → docker-compose up -d --build
- Local backend: uvicorn main:app --reload
- Migration: alembic revision -m "..." → alembic upgrade head
- Mobile: cd ~/Desktop/checkrezerve-app → npx expo start --ios
