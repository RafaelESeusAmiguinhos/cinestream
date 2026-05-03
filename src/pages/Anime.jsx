import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import CategoryRow from '../components/CategoryRow'
import Modal from '../components/Modal'
import {
  getTrendingAnime, getPopularAnime, getTopAnime,
  getSeasonAnime, getAnimeByGenre, ANIME_GENRES,
} from '../api/jikan'

export default function Anime() {
  const [base, setBase] = useState({})
  const [genreData, setGenreData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchBase = async () => {
      setLoading(true)
      try {
        const [trending, popular, top, season] = await Promise.allSettled([
          getTrendingAnime(), getPopularAnime(), getTopAnime(), getSeasonAnime(),
        ])
        setBase({
          trending: trending.value?.data?.data || [],
          popular: popular.value?.data?.data || [],
          top: top.value?.data?.data || [],
          season: season.value?.data?.data || [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBase()
  }, [])

  useEffect(() => {
    // Load genres one at a time to avoid rate limiting
    const fetchGenres = async () => {
      const newData = {}
      for (const genre of ANIME_GENRES) {
        try {
          const res = await getAnimeByGenre(genre.id)
          newData[genre.id] = res?.data?.data || []
          setGenreData((prev) => ({ ...prev, [genre.id]: newData[genre.id] }))
          await new Promise((r) => setTimeout(r, 600))
        } catch {
          newData[genre.id] = []
        }
      }
    }
    fetchGenres()
  }, [])

  const open = (item) => setSelected({ item, type: 'anime' })

  const genreEmoji = {
    1: '💥', 2: '🗺️', 4: '😂', 7: '🔍', 8: '🎭',
    9: '🔥', 10: '🧙', 14: '👻', 22: '💕', 24: '🚀',
    36: '☕', 37: '👻',
  }

  return (
    <div className="pt-16">
      <Hero
        items={loading ? [] : (base.trending || []).slice(0, 5)}
        type="anime"
        onPlay={(i) => open(i)}
      />
      <div className="mt-2">
        <CategoryRow title="⚡ Em Alta" items={base.trending} loading={loading} type="anime" onCardClick={open} />
        <CategoryRow title="🌸 Esta Temporada" items={base.season} loading={loading} type="anime" onCardClick={open} />
        <CategoryRow title="💫 Populares" items={base.popular} loading={loading} type="anime" onCardClick={open} />
        <CategoryRow title="🥇 Top All Time" items={base.top} loading={loading} type="anime" onCardClick={open} />
        {ANIME_GENRES.map((g) => (
          <CategoryRow
            key={g.id}
            title={`${genreEmoji[g.id] || '🎌'} ${g.name}`}
            items={genreData[g.id]}
            loading={!genreData[g.id]}
            type="anime"
            onCardClick={open}
          />
        ))}
      </div>
      {selected && <Modal item={selected.item} type="anime" onClose={() => setSelected(null)} />}
    </div>
  )
}
