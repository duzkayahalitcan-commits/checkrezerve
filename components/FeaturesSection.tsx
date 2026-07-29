// KURAL: Hero ve above-the-fold bileşenler whileInView KULLANMAZ. Scroll trigger sadece sayfanın alt yarısındaki section'lar için. Image wrapper'da opacity animasyonu yasak.

'use client'
import { motion } from 'motion/react'
import { CalendarCheck, CreditCard, Bell, Users, BarChart3, Globe } from 'lucide-react'

const ICON_MAP: Record<string, React.ReactNode> = {
  CalendarCheck: <CalendarCheck size={18} />,
  CreditCard:    <CreditCard size={18} />,
  Bell:         <Bell size={18} />,
  Users:        <Users size={18} />,
  BarChart3:    <BarChart3 size={18} />,
  Globe:        <Globe size={18} />,
}

const BADGES = [
  'Online Rezervasyon',
  'Ön Ödeme',
  'Akıllı Bildirimler',
  'Personel Yönetimi',
  'Analitik & Raporlar',
  'Web & Mobil',
]

interface Feature {
  icon: string
  img: string
  title: string
  desc: string
}

export default function FeaturesSection({ features }: { features: Feature[] }) {
  return (
    <section className="fs-section">
      <div className="fs-inner">
        {features.map((f, i) => {
          const isReversed = i % 2 === 1
          return (
            <motion.div
              key={f.title}
              className="fs-row"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -50px 0px' }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="fs-img-col">
                <motion.div
                  className="browser-frame"
                  initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '0px 0px -50px 0px' }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="browser-bar">
                    <div className="flex items-center gap-1.5">
                      <span className="browser-dot mac-red" />
                      <span className="browser-dot mac-yellow" />
                      <span className="browser-dot mac-green" />
                    </div>
                    <div className="browser-url">checkrezerve.com/panel</div>
                    <div className="w-14" />
                  </div>
                  <div className="browser-image-wrap">
                    <img
                      src={f.img}
                      alt={f.title}
                      loading="eager"
                    />
                    <div className="img-glow" />
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="fs-text-col"
                initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '0px 0px -50px 0px' }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              >
                <span className="fs-badge">{BADGES[i % BADGES.length]}</span>
                <h3 className="fs-title">{f.title}</h3>
                <p className="fs-desc">{f.desc}</p>
                <div className="fs-cta">
                  <span>{/* Detaylar → */}</span>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      <style jsx>{`
        .fs-section {
          padding: 5rem 0;
          background: #fff;
          overflow: hidden;
        }
        .fs-inner {
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 6rem;
        }

        /* ── Row ── */
        .fs-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
        }
        @media (min-width: 768px) {
          .fs-row {
            flex-direction: row;
            gap: 5rem;
          }
        }

        /* ── Image column ── */
        .fs-img-col {
          flex: 0 0 50%;
          width: 100%;
        }

        /* ── Browser mockup ── */
        .browser-frame {
          background: #fff;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow:
            0 25px 60px rgba(0,0,0,0.12),
            0 8px 20px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.06);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1),
                      box-shadow 0.4s ease;
          will-change: transform;
        }
        .browser-frame:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow:
            0 35px 80px rgba(0,0,0,0.15),
            0 10px 24px rgba(0,0,0,0.08);
        }

        .browser-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #f8f8f8;
          border-bottom: 1px solid rgba(0,0,0,0.04);
        }
        .browser-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: block;
        }
        .mac-red    { background: #ff5f56; }
        .mac-yellow { background: #ffbd2e; }
        .mac-green  { background: #27c93f; }

        .browser-url {
          flex: 1;
          text-align: center;
          font-size: 0.7rem;
          color: #888;
          background: #e8e8e8;
          border-radius: 4px;
          padding: 3px 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: var(--font-geist-mono, monospace);
        }

        .browser-image-wrap {
          position: relative;
          overflow: hidden;
          line-height: 0;
        }
        .browser-image-wrap img {
          width: 100%;
          height: auto;
          max-height: 420px;
          object-fit: cover;
          display: block;
          transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .browser-frame:hover .browser-image-wrap img {
          transform: scale(1.03);
        }
        .img-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(229,57,53,0.06) 0%, transparent 50%);
        }

        /* ── Text column ── */
        .fs-text-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .fs-badge {
          display: inline-block;
          align-self: flex-start;
          background: rgba(229,57,53,0.08);
          color: #E53935;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.35rem 0.9rem;
          border-radius: 999px;
          border: 1px solid rgba(229,57,53,0.12);
        }

        .fs-title {
          font-size: clamp(1.6rem, 2.8vw, 2.4rem);
          font-weight: 700;
          color: #111;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-playfair), serif;
        }

        .fs-desc {
          font-size: 1rem;
          color: #52525b;
          line-height: 1.7;
          margin: 0;
          max-width: 480px;
        }

        .fs-cta {
          margin-top: 0.5rem;
        }

        @media (max-width: 767px) {
          .fs-inner { gap: 4rem; }
          .fs-img-col { flex: none; width: 100%; }
          .browser-image-wrap img { max-height: 280px; }
        }
      `}</style>
    </section>
  )
}
