// KURAL: Hero ve above-the-fold bileşenler whileInView KULLANMAZ. Scroll trigger sadece sayfanın alt yarısındaki section'lar için. Image wrapper'da opacity animasyonu yasak.

'use client'
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
            <div key={f.title} className={`fs-row${isReversed ? ' fs-row--reversed' : ''}`}>
              <div className="fs-img-col">
                <figure className="fs-figure">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.img} alt={f.title} loading="lazy" />
                </figure>
              </div>

              <div className="fs-text-col">
                <span className="fs-badge">{BADGES[i % BADGES.length]}</span>
                <h3 className="fs-title">{f.title}</h3>
                <p className="fs-desc">{f.desc}</p>
              </div>
            </div>
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
          .fs-row--reversed {
            flex-direction: row-reverse;
          }
        }

        /* ── Image column ── */
        .fs-img-col {
          flex: 0 0 50%;
          width: 100%;
        }

        /* ── Real screenshot in a figure — hairline border, no fake chrome ── */
        .fs-figure {
          margin: 0;
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          border: 1px solid rgba(0,0,0,0.08);
          background: #fff;
          line-height: 0;
        }
        .fs-figure img {
          width: 100%;
          height: auto;
          max-height: 420px;
          object-fit: cover;
          display: block;
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

        @media (max-width: 767px) {
          .fs-inner { gap: 4rem; }
          .fs-img-col { flex: none; width: 100%; }
          .fs-figure img { max-height: 280px; }
        }
      `}</style>
    </section>
  )
}
