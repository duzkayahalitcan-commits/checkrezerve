'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'motion/react'

interface Props {
  title: string
  subtitle: string
  badge: string
  ctaPrimary: string
  ctaSecondary: string
  locale: string
}

const SLIDES = [
  { src: '/images/split-restoran.jpg',   label: '🍽️  Restoran' },
  { src: '/images/split-guzellik.jpg',   label: '💇  Güzellik' },
  { src: '/images/split-spa.jpg',        label: '💆  Spa & Masaj' },
]

const DEMO_CARDS = [
  {
    name:    'Zeytin Restoran',
    detail:  '4 kişi · Bugün 19:30',
    status:  'confirmed',
    label:   'Onaylı',
    icon:    '🍽️',
    rotate:  '-rotate-2',
    delay:   0.55,
    yOffset: 0,
  },
  {
    name:    'Lotus Güzellik',
    detail:  'Saç Kesim · Yarın 14:00',
    status:  'pending',
    label:   'Beklemede',
    icon:    '💇',
    rotate:  'rotate-1',
    delay:   0.7,
    yOffset: 80,
  },
  {
    name:    'Serenity Spa',
    detail:  'Masaj 60dk · Bugün 16:30',
    status:  'completed',
    label:   'Tamamlandı',
    icon:    '💆',
    rotate:  'rotate-3',
    delay:   0.85,
    yOffset: 160,
  },
]

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pending:   'bg-amber-500/20   text-amber-300   border-amber-500/30',
  completed: 'bg-blue-500/20    text-blue-300    border-blue-500/30',
}

export default function HomeHero({ title, subtitle, badge, ctaPrimary, ctaSecondary, locale }: Props) {
  const words = title.split(' ')
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="hero-section">
      {/* ── Sliding Background Images ── */}
      <div className="hero-bg">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <Image
              src={SLIDES[slide].src}
              alt=""
              fill
              className="object-cover"
              priority={slide === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="hero-overlay-lr" />
        <div className="hero-overlay-tb" />
      </div>

      {/* ── Main Content ── */}
      <div className="hero-layout">
        {/* Left: Text content */}
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            <span className="badge-dot">
              <span className="badge-ping" />
              <span className="badge-core" />
            </span>
            <span className="badge-label">{badge}</span>
          </div>

          {/* Title */}
          <h1 className="hero-title">
            {words.map((word, i) => (
              <span
                key={i}
                className="word"
                style={{ '--d': `${i * 0.1}s` } as React.CSSProperties}
              >
                {word}{i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>

          <p className="hero-sub">{subtitle}</p>

          {/* CTAs */}
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

          {/* Stats */}
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

        {/* Right: Floating demo cards (desktop only) */}
        <div className="hero-cards" aria-hidden>
          {DEMO_CARDS.map((card, i) => (
            <motion.div
              key={card.name}
              className={`demo-card ${card.rotate}`}
              style={{ top: card.yOffset, willChange: 'transform' }}
              initial={{ opacity: 0, x: 60 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -8, 0],
              }}
              transition={{
                opacity: { delay: card.delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] },
                x:       { delay: card.delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] },
                y:       { delay: card.delay + 0.5, duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' },
              }}
            >
              <div className="demo-card-icon">{card.icon}</div>
              <div className="demo-card-body">
                <p className="demo-card-name">{card.name}</p>
                <p className="demo-card-detail">{card.detail}</p>
              </div>
              <span className={`demo-card-badge ${STATUS_STYLE[card.status]}`}>
                {card.label}
              </span>
            </motion.div>
          ))}

          {/* Slide indicator dots */}
          <div className="slide-dots">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                onClick={() => setSlide(i)}
                className={`slide-dot ${i === slide ? 'active' : ''}`}
                aria-label={s.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll Indicator ── */}
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
          background: linear-gradient(to right, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.35) 100%);
        }
        .hero-overlay-tb {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
        }

        /* Two-column layout */
        .hero-layout {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
        }
        .hero-content {
          flex: 1;
          padding-top: 5rem;
          max-width: 600px;
        }

        /* Floating cards panel */
        .hero-cards {
          display: none;
          position: relative;
          width: 280px;
          flex-shrink: 0;
          height: 420px;
        }
        @media (min-width: 1024px) {
          .hero-cards { display: block; }
        }

        .demo-card {
          position: absolute;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          cursor: default;
        }
        .demo-card-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.08);
          border-radius: 10px;
        }
        .demo-card-body {
          flex: 1;
          min-width: 0;
        }
        .demo-card-name {
          color: #fff;
          font-size: 0.85rem;
          font-weight: 700;
          truncate: true;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .demo-card-detail {
          color: rgba(255,255,255,0.5);
          font-size: 0.72rem;
          margin-top: 2px;
        }
        .demo-card-badge {
          flex-shrink: 0;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          border-width: 1px;
          border-style: solid;
          white-space: nowrap;
        }

        /* Slide dots */
        .slide-dots {
          position: absolute;
          bottom: -32px;
          left: 0;
          display: flex;
          gap: 6px;
        }
        .slide-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
        }
        .slide-dot.active {
          background: #E53935;
          width: 20px;
          border-radius: 999px;
        }

        /* Badge */
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

        /* Title */
        .hero-title {
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin: 0 0 1.5rem;
        }
        .word {
          display: inline;
          opacity: 0;
          transform: translateY(40px);
          animation: wordIn 0.75s cubic-bezier(0.23, 1, 0.32, 1) var(--d, 0s) both;
          will-change: transform, opacity;
        }
        .hero-sub {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.60);
          max-width: 480px;
          line-height: 1.6;
          margin: 0 0 2.5rem;
          animation: fadeUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
        }

        /* CTAs */
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
          box-shadow: 0 0 0 0 rgba(229,57,53,0.4);
        }
        .cta-primary:hover {
          background: #ef5350;
          transform: scale(1.05);
          box-shadow: 0 20px 60px rgba(229,57,53,0.45), 0 0 0 6px rgba(229,57,53,0.15);
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
          border: 2px solid rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.8);
          padding: 1rem 2rem;
          border-radius: 9999px;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cta-ghost:hover {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        /* Stats */
        .hero-stats {
          display: flex;
          gap: 2.5rem;
          margin-top: 3.5rem;
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
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* Scroll Indicator */
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
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .scroll-track {
          width: 24px;
          height: 40px;
          border: 2px solid rgba(255,255,255,0.15);
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
          background: rgba(255,255,255,0.5);
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
          .hero-layout { padding-top: 0; }
          .hero-stats { gap: 1.5rem; }
          .stat-val { font-size: 1.4rem; }
          .cta-primary, .cta-ghost { padding: 0.85rem 1.5rem; font-size: 0.9rem; }
        }
      `}</style>
    </section>
  )
}
