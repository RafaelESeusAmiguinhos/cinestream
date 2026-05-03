import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import CategoryRow from '../components/CategoryRow'
import Modal from '../components/Modal'
import {
  getTrendingMovies, getPopularMovies, getTopRatedMovies,
  getNowPlayingMovies, getUpcomingMovies, getMoviesByGenre,
} from '../api/tmdb'

const GENRES = [
  { id: 28, name: '💥 Ação' },
  { id: 35, name: '😂 Comédia' },
  { id: 18, name: '🎭 Drama' },
  { id: 27, name: '👻 Terror' },
  { id: 878, name: '🚀 Ficção Científica' },
  { id: 10749, name: '💕 Romance' },
  { id: 16, name: '🎨 Animação' },
  { id: 80, name: '🔪 Crime' },
  { id: 14, name: '🧙 Fantasia' },
  { id: 53, name: '😱 Suspense' },
  { id: 36, name: '📜 História' },
  { id: 10752, name: '⚔️ Guerra' },
  { id: 12, name: '🗺️ Aventura' },
  { id: 9648, name: '🔍 Mistério' },
  { id: 10402, name: '🎵 Musical' },
]

export default function Movies() {
  const [base, setBase] = useState({})
  const [genreData, setGenreData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchBase = async () => {
      setLoading(true)
      try {
        const [trending, popular, topRated, nowPlaying, upcoming] = await Promise.allSettled([
          getTrendingMovies(), getPopularMovies(), getTopRatedMovies(),
          getNowPlayingMovies(), getUpcomingMovies(),
        ])
        setBase({
          trending: trending.value?.data?.results || [],
          popular: popular.value?.data?.results || [],
          topRated: topRated.value?.data?.results || [],
          nowPlaying: nowPlaying.value?.data?.results || [],
          upcoming: upcoming.value?.data?.results || [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBase()
  }, [])

  useEffect(() => {
    const fetchGenres = async () => {
      const results = await Promise.allSettled(
        GENRES.map((g) => getMoviesByGenre(g.id))
      )
      const newData = {}
      GENRES.forEach((g, i) => {
        newData[g.id] = results[i].value?.data?.results || []
      })
      setGenreData(newData)
    }
    fetchGenres()
  }, [])

  const open = (item) => setSelected({ item, type: 'movie' })

  return (
    <div className="pt-16">
      <Hero items={base.trending || []} type="movie" onPlay={(i) => open(i)} />
      <div className="mt-2">
        <CategoryRow title="🔥 Em Alta" items={base.trending} loading={loading} type="movie" onCardClick={open} />
        <CategoryRow title="🎬 Populares" items={base.popular} loading={loading} type="movie" onCardClick={open} />
        <CategoryRow title="⭐ Mais Bem Avaliados" items={base.topRated} loading={loading} type="movie" onCardClick={open} />
        <CategoryRow title="🎥 Em Cartaz" items={base.nowPlaying} loading={loading} type="movie" onCardClick={open} />
        <CategoryRow title="🗓️ Em Breve" items={base.upcoming} loading={loading} type="movie" onCardClick={open} />
        {GENRES.map((g) => (
          <CategoryRow
            key={g.id}
            title={g.name}
            items={genreData[g.id]}
            loading={!genreData[g.id]}
            type="movie"
            onCardClick={open}
          />
        ))}
      </div>
      {selected && <Modal item={selected.item} type="movie" onClose={() => setSelected(null)} />}
    </div>
  )
}
