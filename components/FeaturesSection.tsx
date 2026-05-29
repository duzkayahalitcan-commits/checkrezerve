'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface Feature {
  icon: string
  img: string
  title: string
  desc: string
}

export default function FeaturesSection({ features }: { features: Feature[] }) {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15 }
    )
    rowRefs.current.forEach(r => r && obs.observe(r))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="fs-section">
      <div className="fs-inner">
        {features.map((f, i) => {
          const isRight = i % 2 === 1
          return (
            <div
              key={f.title}
              ref={el => { rowRefs.current[i] = el }}
              className={`fs-row ${isRight ? 'fs-row--right' : 'fs-row--left'}`}
            >
              <div className="fs-img-wrap img-zoom">
                <Image
                  src={f.img}
                  alt={f.title}
                  width={580}
                  height={380}
                  className="fs-img"
                />
                <div className="fs-img-overlay" />
                <div className="fs-icon-badge">{f.icon}</div>
              </div>
              <div className="fs-text">
                <h3 className="fs-title">{f.title}</h3>
                <p className="fs-desc">{f.desc}</p>
                <div className="fs-line" />
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .fs-section {
          padding: 6rem 0;
          background: #fff;
          overflow: hidden;
        }
        .fs-inner {
          max-width: 72rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 5rem;
        }
        .fs-row {
          display: flex;
          align-items: center;
          gap: 4rem;
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1), transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
          will-change: opacity, transform;
        }
        .fs-row--left {
          transform: translateX(-50px);
        }
        .fs-row--right {
          transform: translateX(50px);
          flex-direction: row-reverse;
        }
        .fs-row.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .fs-img-wrap {
          flex: 0 0 52%;
          position: relative;
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.15);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease;
          will-change: transform;
        }
        .fs-img-wrap:hover {
          transform: scale(1.02);
          box-shadow: 0 40px 100px rgba(0,0,0,0.22);
        }
        .fs-img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          display: block;
        }
        .fs-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(229,57,53,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .fs-icon-badge {
          position: absolute;
          bottom: 1.25rem;
          right: 1.25rem;
          width: 52px;
          height: 52px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(12px);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .fs-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .fs-title {
          font-size: clamp(1.4rem, 2.5vw, 2rem);
          font-weight: 900;
          color: #111;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0;
        }
        .fs-desc {
          font-size: 1.05rem;
          color: #52525b;
          line-height: 1.7;
          margin: 0;
        }
        .fs-line {
          width: 48px;
          height: 3px;
          background: #E53935;
          border-radius: 2px;
          margin-top: 0.5rem;
        }
        @media (max-width: 768px) {
          .fs-inner { gap: 3rem; }
          .fs-row, .fs-row--right {
            flex-direction: column;
            transform: translateY(30px);
          }
          .fs-row.visible { transform: translateY(0); }
          .fs-img-wrap { flex: none; width: 100%; }
          .fs-img { height: 220px; }
        }
      `}</style>
    </section>
  )
}
