'use client'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

interface Props {
  title: string
  subtitle: string
  badge: string
  ctaPrimary: string
  ctaSecondary: string
  locale: string
}

export default function HomeHero({ title, subtitle, badge, ctaPrimary, ctaSecondary, locale }: Props) {
  const words = title.split(' ')

  return (
    <section className="hero-section">
      <div className="hero-bg">
        <Image
          src="/images/hero-premium.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="hero-overlay-lr" />
        <div className="hero-overlay-tb" />
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot">
            <span className="badge-ping" />
            <span className="badge-core" />
          </span>
          <span className="badge-label">{badge}</span>
        </div>

        <h1 className="hero-title">
          {words.map((word, i) => (
            <span
              key={i}
              className="word"
              style={{ '--d': `${i * 0.1}s` } as React.CSSProperties}
            >
              {word}{i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        <p className="hero-sub">{subtitle}</p>

        <div className="hero-ctas">
          <Link
            href={`/${locale}/rezervasyon` as never}
            className="cta-primary"
          >
            {ctaPrimary}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="cta-arrow">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <a href="#nasil-calisir" className="cta-ghost">
            {ctaSecondary}
          </a>
        </div>

        <div className="hero-stats">
          {[
            { val: '500+', label: 'İşletme' },
            { val: '50K+', label: 'Rezervasyon' },
            { val: '%98', label: 'Memnuniyet' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-val">{s.val}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-indicator">
        <span className="scroll-label">Keşfet</span>
        <div className="scroll-track">
          <div className="scroll-dot" />
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          height: 100vh;
          min-height: 640px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #0a0a0a;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
        }
        .hero-overlay-lr {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.70) 50%, rgba(0,0,0,0.25) 100%);
        }
        .hero-overlay-tb {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
        }
        .hero-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
          padding: 6rem 1.5rem 0;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.1s both;
        }
        .badge-dot {
          position: relative;
          display: flex;
          width: 12px;
          height: 12px;
        }
        .badge-ping {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #ef4444;
          opacity: 0.75;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .badge-core {
          position: relative;
          display: block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
        }
        .badge-label {
          color: #fca5a5;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .hero-title {
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin: 0 0 1.5rem;
          max-width: 800px;
        }
        .word {
          display: inline;
          opacity: 0;
          transform: translateY(40px);
          animation: wordIn 0.75s cubic-bezier(0.23, 1, 0.32, 1) var(--d, 0s) both;
          will-change: transform, opacity;
        }
        .hero-sub {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.65);
          max-width: 500px;
          line-height: 1.6;
          margin: 0 0 2.5rem;
          animation: fadeUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
        }
        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          animation: fadeUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.75s both;
        }
        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #E53935;
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 9999px;
          font-size: 1rem;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          will-change: transform;
        }
        .cta-primary:hover {
          background: #ef5350;
          transform: scale(1.05);
          box-shadow: 0 20px 60px rgba(229,57,53,0.45);
        }
        .cta-arrow {
          width: 18px;
          height: 18px;
          transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cta-primary:hover .cta-arrow {
          transform: translateX(4px);
        }
        .cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 2px solid rgba(255,255,255,0.25);
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 9999px;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cta-ghost:hover {
          border-color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.1);
        }
        .hero-stats {
          display: flex;
          gap: 2.5rem;
          margin-top: 4rem;
          animation: fadeUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.9s both;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stat-val {
          font-size: 1.75rem;
          font-weight: 900;
          color: #fff;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.45);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: fadeIn 1s ease 1.8s both;
          z-index: 10;
        }
        .scroll-label {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .scroll-track {
          width: 24px;
          height: 40px;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 5px;
        }
        .scroll-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          animation: scrollDrop 2s cubic-bezier(0.23, 1, 0.32, 1) infinite;
        }
        @keyframes wordIn {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        @keyframes scrollDrop {
          0%   { transform: translateY(0); opacity: 1; }
          70%  { transform: translateY(18px); opacity: 0.2; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @media (max-width: 640px) {
          .hero-stats { gap: 1.5rem; }
          .stat-val { font-size: 1.4rem; }
          .cta-primary, .cta-ghost { padding: 0.85rem 1.5rem; font-size: 0.9rem; }
        }
      `}</style>
    </section>
  )
}
