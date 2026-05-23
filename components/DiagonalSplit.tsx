'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

const PANEL_DEFS = [
  {
    id: 'restoran',
    img: '/images/split-restoran.jpg',
    bgPos: 'center 40%',
    accent: '#B71C1C',
    icon: '🍷',
    clip: 'polygon(0 0, 108% 0, 90% 100%, 0 100%)',
  },
  {
    id: 'guzellik',
    img: '/images/split-guzellik.jpg',
    bgPos: 'center',
    accent: '#880E4F',
    icon: '✂️',
    clip: 'polygon(10% 0, 108% 0, 90% 100%, -8% 100%)',
  },
  {
    id: 'spa',
    img: '/images/split-spa.jpg',
    bgPos: 'center',
    accent: '#004D40',
    icon: '🧖',
    clip: 'polygon(10% 0, 100% 0, 100% 100%, -8% 100%)',
  },
]

export default function DiagonalSplit({ fullscreen = false }: { fullscreen?: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('diagonal')

  const labels: Record<string, string> = {
    restoran: t('restoran'),
    guzellik: t('guzellik'),
    spa:      t('spa'),
  }
  const subs: Record<string, string> = {
    restoran: t('restoranSub'),
    guzellik: t('guzellikSub'),
    spa:      t('spaSub'),
  }

  return (
    <section
      className="ds-section"
      style={fullscreen ? { height: '100dvh', maxHeight: 'none', minHeight: 'unset' } : {}}
    >
      <div className="ds-track">
        {PANEL_DEFS.map((panel, idx) => {
          const isHov   = hovered === panel.id
          const isOther = hovered !== null && !isHov
          return (
            <div
              key={panel.id}
              className="ds-panel"
              style={{
                backgroundImage:    `url(${panel.img})`,
                backgroundPosition: panel.bgPos,
                clipPath:           panel.clip,
                zIndex:  isHov ? 10 : idx + 1,
                filter:  isOther ? 'brightness(0.3) saturate(0.4)' : 'brightness(1) saturate(1)',
                flex:    isHov ? '1.65' : isOther ? '0.68' : '1',
              }}
              onMouseEnter={() => setHovered(panel.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push(`/${locale}/rezervasyon?kategori=${panel.id}`)}
            >
              <div
                className="ds-overlay"
                style={{
                  background: `linear-gradient(to top, ${panel.accent}f0 0%, ${panel.accent}60 35%, transparent 70%)`,
                  opacity: isHov ? 1 : 0.8,
                }}
              />
              <div className="ds-content" style={{ transform: isHov ? 'translateY(0)' : 'translateY(14px)' }}>
                <span className="ds-icon">{panel.icon}</span>
                <h2 className="ds-title">{labels[panel.id]}</h2>
                <p
                  className="ds-sub"
                  style={{
                    opacity:   isHov ? 1 : 0,
                    transform: isHov ? 'translateY(0)' : 'translateY(10px)',
                  }}
                >
                  {subs[panel.id]}
                </p>
                <div
                  className="ds-cta"
                  style={{
                    opacity:   isHov ? 1 : 0,
                    transform: isHov ? 'translateY(0)' : 'translateY(10px)',
                  }}
                >
                  <span>{t('discover')}</span>
                  <span className="ds-arrow">→</span>
                </div>
              </div>
              {isHov && <div className="ds-shine" />}
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .ds-section {
          width: 100%;
          height: 92vh;
          min-height: 560px;
          max-height: 860px;
          overflow: hidden;
          background: #060606;
          position: relative;
        }
        .ds-track {
          display: flex;
          width: 116%;
          height: 100%;
          margin-left: -8%;
          position: relative;
          transform: translateZ(0);
        }
        .ds-panel {
          position: relative;
          flex: 1;
          background-size: cover;
          cursor: pointer;
          transition: flex 0.65s cubic-bezier(0.23, 1, 0.32, 1), filter 0.45s ease;
          overflow: hidden;
          will-change: flex, filter;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .ds-overlay {
          position: absolute;
          inset: 0;
          transition: opacity 0.45s ease;
          pointer-events: none;
        }
        .ds-content {
          position: absolute;
          bottom: 0;
          left: max(16%, 40px);
          right: 20px;
          padding: 0 0 56px 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          z-index: 2;
          transition: transform 0.45s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .ds-icon {
          font-size: 3rem;
          filter: drop-shadow(0 3px 12px rgba(0,0,0,0.7));
          line-height: 1;
          margin-bottom: 2px;
        }
        .ds-title {
          font-size: clamp(1.6rem, 2.4vw, 3rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.05;
          text-shadow: 0 2px 28px rgba(0,0,0,0.95);
          margin: 0;
        }
        .ds-sub {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.88);
          margin: 0;
          transition: opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s;
          text-shadow: 0 1px 10px rgba(0,0,0,0.8);
        }
        .ds-cta {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 6px;
          padding-bottom: 4px;
          border-bottom: 2px solid rgba(255,255,255,0.75);
          transition: opacity 0.35s ease 0.18s, transform 0.35s ease 0.18s;
        }
        .ds-arrow {
          display: inline-block;
          transition: transform 0.25s ease;
          transform: translateX(0);
        }
        .ds-panel:hover .ds-arrow {
          transform: translateX(6px);
        }
        .ds-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 55%);
          pointer-events: none;
          animation: dsShine 0.4s ease forwards;
        }
        @keyframes dsShine {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (max-width: 768px) {
          .ds-section { height: auto; max-height: none; min-height: unset; }
          .ds-track { flex-direction: column; width: 100%; margin-left: 0; }
          .ds-panel {
            flex: none !important;
            height: 44vw;
            min-height: 220px;
            clip-path: none !important;
            filter: brightness(1) saturate(1) !important;
          }
          .ds-content { left: 24px; padding-bottom: 28px; transform: translateY(0) !important; }
          .ds-sub, .ds-cta { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  )
}
