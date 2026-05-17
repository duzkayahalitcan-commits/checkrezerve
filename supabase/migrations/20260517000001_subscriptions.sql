-- ══════════════════════════════════════════════════════════════════
-- İyzico abonelik sistemi
-- Tarih: 2026-05-17
-- ══════════════════════════════════════════════════════════════════

-- Enum'lar
CREATE TYPE subscription_plan   AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');
CREATE TYPE billing_period      AS ENUM ('monthly', 'yearly');

-- ── 1. subscriptions ─────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id                    uuid        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  plan                             subscription_plan   NOT NULL DEFAULT 'starter',
  status                           subscription_status NOT NULL DEFAULT 'trialing',
  billing_period                   billing_period      NOT NULL DEFAULT 'monthly',
  price_per_period                 numeric(10,2)       NOT NULL DEFAULT 0,
  currency                         text                NOT NULL DEFAULT 'TRY',

  -- İyzico referans kodları
  iyzico_customer_ref              text,
  iyzico_subscription_ref          text        UNIQUE,
  iyzico_product_ref               text,
  iyzico_pricing_plan_ref          text,

  -- Trial ve dönem bilgileri
  trial_start                      timestamptz,
  trial_end                        timestamptz,
  current_period_start             timestamptz,
  current_period_end               timestamptz,

  -- İptal
  cancelled_at                     timestamptz,
  cancel_reason                    text,

  created_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                       timestamptz NOT NULL DEFAULT now()
);

-- Bir işletmenin aynı anda yalnızca bir aktif/trialing/past_due aboneliği olabilir
CREATE UNIQUE INDEX idx_subscriptions_one_active
  ON subscriptions (restaurant_id)
  WHERE status IN ('active', 'trialing', 'past_due');

CREATE INDEX idx_subscriptions_restaurant  ON subscriptions (restaurant_id);
CREATE INDEX idx_subscriptions_status      ON subscriptions (status);
CREATE INDEX idx_subscriptions_period_end  ON subscriptions (current_period_end);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. subscription_payments ──────────────────────────────────────
CREATE TABLE subscription_payments (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id       uuid        NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  restaurant_id         uuid        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  amount                numeric(10,2) NOT NULL,
  currency              text          NOT NULL DEFAULT 'TRY',
  status                text          NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'success', 'failure')),

  -- İyzico ödeme detayları
  iyzico_payment_id     text,
  iyzico_basket_id      text,
  iyzico_conversation_id text,

  -- Hangi dönem için
  period_start          timestamptz,
  period_end            timestamptz,

  -- Hata bilgisi
  error_code            text,
  error_message         text,

  paid_at               timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sub_payments_subscription ON subscription_payments (subscription_id);
CREATE INDEX idx_sub_payments_restaurant   ON subscription_payments (restaurant_id);
CREATE INDEX idx_sub_payments_status       ON subscription_payments (status);

-- ── 3. iyzico_webhook_logs ────────────────────────────────────────
CREATE TABLE iyzico_webhook_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      text        NOT NULL,  -- SUBSCRIPTION_CREATED, SUBSCRIPTION_RENEWED, vb.
  payload         jsonb       NOT NULL,
  subscription_ref text,                 -- iyzico_subscription_ref, hızlı arama için
  processed       boolean     NOT NULL DEFAULT false,
  process_error   text,
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz
);

CREATE INDEX idx_webhook_logs_event        ON iyzico_webhook_logs (event_type);
CREATE INDEX idx_webhook_logs_subscription ON iyzico_webhook_logs (subscription_ref);
CREATE INDEX idx_webhook_logs_processed    ON iyzico_webhook_logs (processed) WHERE processed = false;

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE iyzico_webhook_logs   ENABLE ROW LEVEL SECURITY;

-- subscriptions: işletme sahibi/yöneticisi kendi aboneliğini okuyabilir
CREATE POLICY "subscriptions_owner_read" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.isletme_id = subscriptions.restaurant_id
        AND profiles.role IN ('business_owner', 'business_manager', 'super_admin')
    )
  );

-- super_admin her şeyi yazabilir
CREATE POLICY "subscriptions_super_admin_all" ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- subscription_payments: aynı kural
CREATE POLICY "sub_payments_owner_read" ON subscription_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.isletme_id = subscription_payments.restaurant_id
        AND profiles.role IN ('business_owner', 'business_manager', 'super_admin')
    )
  );

CREATE POLICY "sub_payments_super_admin_all" ON subscription_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- webhook_logs: yalnızca super_admin okuyabilir (service_role bypass eder)
CREATE POLICY "webhook_logs_super_admin_only" ON iyzico_webhook_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );
