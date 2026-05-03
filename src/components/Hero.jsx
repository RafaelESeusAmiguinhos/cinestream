import { useState, useEffect } from 'react'
import { getImgUrl } from '../api/tmdb'

export default function Hero({ items, type = 'movie', onPlay }) {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    if (!items?.length) return
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % Math.min(items.length, 5))
        setFade(true)
      }, 400)
    }, 7000)
    return () => clearInterval(t)
  }, [items])

  if (!items?.length) {
    return <div className="h-[60vh] bg-gray-900 skeleton" />
  }

  const item = items[Math.min(idx, items.length - 1)]
  const isAnime = type === 'anime'

  const title = isAnime
    ? item.title || item.title_english
    : item.title || item.name

  const overview = isAnime ? item.synopsis : item.overview
  const score = isAnime ? item.score : item.vote_average

  const backdrop = isAnime
    ? item.images?.jpg?.large_image_url
    : getImgUrl(item.backdrop_path, 'original')

  return (
    <div className="relative h-[60vh] md:h-[75vh] overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
      >
        <img
          src={backdrop}
          alt={title}
          className="w-full h-full object-cover object-top"
          onError={(e) => { e.target.style.display='none' }}
        />
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 hero-bottom-gradient" />

      {/* Content */}
      <div
        className={`absolute bottom-16 left-0 px-6 md:px-12 max-w-xl transition-all duration-500 ${
          fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          {score > 0 && (
            <span className="text-yellow-400 font-bold text-sm">⭐ {Number(score).toFixed(1)}</span>
          )}
          {type === 'anime' && item.type && (
            <span className="bg-[#E50914] text-white text-xs px-2 py-0.5 rounded font-semibold">
              {item.type}
            </span>
          )}
        </div>

        <h1 className="text-white text-3xl md:text-5xl font-black mb-3 leading-tight drop-shadow-lg">
          {title}
        </h1>

        {overview && (
          <p className="text-gray-200 text-sm md:text-base line-clamp-3 mb-5 leading-relaxed drop-shadow">
            {overview}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onPlay && onPlay(item, type)}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-md hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            ▶ Ver Detalhes
          </button>
          <button
            onClick={() => onPlay && onPlay(item, type)}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold px-6 py-2.5 rounded-md hover:bg-white/30 transition-colors text-sm md:text-base"
          >
            ℹ Mais Info
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {Array.from({ length: Math.min(items.length, 5) }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true) }, 300) }}
            className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}
