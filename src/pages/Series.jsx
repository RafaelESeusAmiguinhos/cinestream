import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import CategoryRow from '../components/CategoryRow'
import Modal from '../components/Modal'
import {
  getTrendingSeries, getPopularSeries, getTopRatedSeries,
  getAiringToday, getSeriesByGenre,
} from '../api/tmdb'

const GENRES = [
  { id: 10759, name: '💥 Ação & Aventura' },
  { id: 35, name: '😂 Comédia' },
  { id: 18, name: '🎭 Drama' },
  { id: 9648, name: '🔍 Mistério' },
  { id: 10765, name: '🧙 Ficção Científica & Fantasia' },
  { id: 80, name: '🔪 Crime' },
  { id: 10751, name: '👨‍👩‍👧 Família' },
  { id: 16, name: '🎨 Animação' },
  { id: 99, name: '📰 Documentário' },
  { id: 10764, name: '🎉 Reality' },
  { id: 10762, name: '👶 Infantil' },
  { id: 37, name: '🤠 Faroeste' },
]

export default function Series() {
  const [base, setBase] = useState({})
  const [genreData, setGenreData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchBase = async () => {
      setLoading(true)
      try {
        const [trending, popular, topRated, airing] = await Promise.allSettled([
          getTrendingSeries(), getPopularSeries(), getTopRatedSeries(), getAiringToday(),
        ])
        setBase({
          trending: trending.value?.data?.results || [],
          popular: popular.value?.data?.results || [],
          topRated: topRated.value?.data?.results || [],
          airing: airing.value?.data?.results || [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBase()
  }, [])

  useEffect(() => {
    const fetchGenres = async () => {
      const results = await Promise.allSettled(GENRES.map((g) => getSeriesByGenre(g.id)))
      const newData = {}
      GENRES.forEach((g, i) => {
        newData[g.id] = results[i].value?.data?.results || []
      })
      setGenreData(newData)
    }
    fetchGenres()
  }, [])

  const open = (item) => setSelected({ item, type: 'tv' })

  return (
    <div className="pt-16">
      <Hero items={base.trending || []} type="tv" onPlay={(i) => open(i)} />
      <div className="mt-2">
        <CategoryRow title="🔥 Em Alta" items={base.trending} loading={loading} type="tv" onCardClick={open} />
        <CategoryRow title="📺 Populares" items={base.popular} loading={loading} type="tv" onCardClick={open} />
        <CategoryRow title="⭐ Mais Bem Avaliadas" items={base.topRated} loading={loading} type="tv" onCardClick={open} />
        <CategoryRow title="📡 Hoje na TV" items={base.airing} loading={loading} type="tv" onCardClick={open} />
        {GENRES.map((g) => (
          <CategoryRow
            key={g.id}
            title={g.name}
            items={genreData[g.id]}
            loading={!genreData[g.id]}
            type="tv"
            onCardClick={open}
          />
        ))}
      </div>
      {selected && <Modal item={selected.item} type="tv" onClose={() => setSelected(null)} />}
    </div>
  )
}
