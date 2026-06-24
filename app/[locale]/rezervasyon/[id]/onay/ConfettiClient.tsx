'use client'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function ConfettiClient() {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } })
  }, [])
  return null
}
