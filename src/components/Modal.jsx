import { useEffect, useState } from 'react'
import { getImgUrl, getMovieDetails, getSeriesDetails } from '../api/tmdb'
import { getAnimeDetails } from '../api/jikan'

export default function Modal({ item, type, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trailerKey, setTrailerKey] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true)
      setShowTrailer(false)
      setTrailerKey(null)
      try {
        if (type === 'anime') {
          const res = await getAnimeDetails(item.mal_id)
          setDetails(res.data.data)
          const trailer = res.data.data?.trailer?.youtube_id
          if (trailer) setTrailerKey(trailer)
        } else if (type === 'movie') {
          const res = await getMovieDetails(item.id)
          setDetails(res.data)
          const trailer = res.data.videos?.results?.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube'
          )
          if (trailer) setTrailerKey(trailer.key)
        } else {
          const res = await getSeriesDetails(item.id)
          setDetails(res.data)
          const trailer = res.data.videos?.results?.find(
            (v) => v.type === 'Trailer' && v.site === 'YouTube'
          )
          if (trailer) setTrailerKey(trailer.key)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()

    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [item, type])

  const isAnime = type === 'anime'

  const title = isAnime
    ? details?.title || details?.title_english || item.title
    : details?.title || details?.name || item.title || item.name

  const overview = isAnime
    ? details?.synopsis
    : details?.overview

  const score = isAnime ? details?.score : details?.vote_average
  const backdrop = isAnime
    ? details?.images?.jpg?.large_image_url
    : getImgUrl(details?.backdrop_path || item.backdrop_path, 'w1280')

  const genres = isAnime
    ? details?.genres?.map((g) => g.name)
    : details?.genres?.map((g) => g.name)

  const year = isAnime
    ? details?.year || details?.aired?.prop?.from?.year
    : (details?.release_date || details?.first_air_date || '').slice(0, 4)

  const episodes = isAnime ? details?.episodes : details?.number_of_episodes
  const seasons = !isAnime && type === 'tv' ? details?.number_of_seasons : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="modal-enter relative bg-[#1a1a1a] rounded-xl overflow-hidden w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
        >
          ×
        </button>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Hero image / trailer */}
            <div className="relative w-full aspect-video bg-gray-900">
              {showTrailer && trailerKey ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={backdrop}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                </>
              )}
            </div>

            {/* Content */}
            <div className="p-5 md:p-6 -mt-12 relative">
              <div className="flex flex-wrap gap-3 mb-4">
                {trailerKey && !showTrailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    ▶ Assistir Trailer
                  </button>
                )}
                {showTrailer && (
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="flex items-center gap-2 bg-white/20 text-white font-bold px-5 py-2 rounded-md hover:bg-white/30 transition-colors text-sm"
                  >
                    ⊠ Fechar Trailer
                  </button>
                )}
                {isAnime && details?.url && (
                  <a
                    href={details.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#E50914] text-white font-bold px-5 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Ver no MyAnimeList
                  </a>
                )}
              </div>

              <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">{title}</h2>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                {score > 0 && (
                  <span className="text-yellow-400 font-bold">⭐ {Number(score).toFixed(1)}</span>
                )}
                {year && <span className="text-gray-400">{year}</span>}
                {episodes && <span className="text-gray-400">{episodes} ep.</span>}
                {seasons && <span className="text-gray-400">{seasons} temporada{seasons > 1 ? 's' : ''}</span>}
                {isAnime && details?.status && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    details.status === 'Currently Airing' ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {details.status === 'Currently Airing' ? 'Em exibição' : details.status}
                  </span>
                )}
              </div>

              {/* Genres */}
              {genres && genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {genres.map((g) => (
                    <span key={g} className="bg-white/10 text-gray-200 text-xs px-2.5 py-1 rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {overview && (
                <p className="text-gray-300 text-sm leading-relaxed">{overview}</p>
              )}

              {/* Studios / cast */}
              {isAnime && details?.studios?.length > 0 && (
                <p className="text-gray-500 text-xs mt-3">
                  Estúdio: {details.studios.map((s) => s.name).join(', ')}
                </p>
              )}
              {!isAnime && details?.credits?.cast?.length > 0 && (
                <p className="text-gray-500 text-xs mt-3">
                  Elenco: {details.credits.cast.slice(0, 5).map((c) => c.name).join(', ')}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
