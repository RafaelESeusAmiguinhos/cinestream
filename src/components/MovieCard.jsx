import { getImgUrl } from '../api/tmdb'

export default function MovieCard({ item, type = 'movie', onClick }) {
  const isAnime = type === 'anime'

  const title = isAnime
    ? item.title || item.title_english || item.title_japanese
    : item.title || item.name

  const poster = isAnime
    ? item.images?.jpg?.large_image_url || item.images?.jpg?.image_url
    : getImgUrl(item.poster_path)

  const score = isAnime ? item.score : item.vote_average
  const year = isAnime
    ? item.year || item.aired?.prop?.from?.year
    : (item.release_date || item.first_air_date || '').slice(0, 4)

  return (
    <div
      className="card-hover cursor-pointer flex-shrink-0 w-36 md:w-44"
      onClick={() => onClick && onClick(item, type)}
    >
      <div className="relative rounded-md overflow-hidden bg-gray-800 aspect-[2/3]">
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://placehold.co/300x450/1a1a1a/666?text=${encodeURIComponent(title?.slice(0, 10) || '?')}`
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2">
          <div className="flex items-center gap-1 text-xs text-yellow-400 font-bold">
            ⭐ {score ? score.toFixed(1) : 'N/A'}
          </div>
          <p className="text-white text-xs font-semibold line-clamp-2 mt-0.5">{title}</p>
          <p className="text-gray-400 text-xs">{year}</p>
        </div>
        {/* Score badge */}
        {score > 0 && (
          <div className="absolute top-1.5 right-1.5 bg-black/70 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
            {score.toFixed(1)}
          </div>
        )}
      </div>
      <p className="text-white text-xs mt-1.5 font-medium line-clamp-2 leading-tight">{title}</p>
      <p className="text-gray-500 text-xs">{year}</p>
    </div>
  )
}
