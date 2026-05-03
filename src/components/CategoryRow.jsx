import { useRef } from 'react'
import MovieCard from './MovieCard'

export default function CategoryRow({ title, items, type = 'movie', onCardClick, loading }) {
  const rowRef = useRef(null)

  const scroll = (dir) => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
    }
  }

  if (!loading && (!items || items.length === 0)) return null

  return (
    <div className="mb-8">
      <h2 className="text-white text-lg md:text-xl font-bold mb-3 px-4 md:px-8">{title}</h2>
      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black text-white w-10 h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xl"
        >
          ‹
        </button>

        {/* Scroll container */}
        <div ref={rowRef} className="row-scroll px-4 md:px-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 md:w-44">
                  <div className="skeleton rounded-md aspect-[2/3] w-full" />
                  <div className="skeleton h-3 rounded mt-2 w-3/4" />
                  <div className="skeleton h-3 rounded mt-1 w-1/2" />
                </div>
              ))
            : items.map((item) => (
                <MovieCard
                  key={item.id || item.mal_id}
                  item={item}
                  type={type}
                  onClick={onCardClick}
                />
              ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/70 hover:bg-black text-white w-10 h-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xl"
        >
          ›
        </button>
      </div>
    </div>
  )
}
