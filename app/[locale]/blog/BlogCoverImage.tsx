'use client'
import Image from 'next/image'
import { useState } from 'react'

export default function BlogCoverImage({ src, alt, tag }: { src?: string; alt: string; tag: string }) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="h-44 bg-zinc-100 flex flex-col items-center justify-center gap-2">
        <span className="text-2xl">📄</span>
        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wide">{tag}</span>
      </div>
    )
  }

  return (
    <div className="h-44 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={480}
        height={176}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  )
}
