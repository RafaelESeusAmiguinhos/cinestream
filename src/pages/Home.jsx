import { useState, useEffect } from 'react'
import Hero from '../components/Hero'
import CategoryRow from '../components/CategoryRow'
import Modal from '../components/Modal'
import {
  getTrendingMovies, getPopularMovies, getTopRatedMovies,
  getTrendingSeries, getPopularSeries, getTopRatedSeries,
} from '../api/tmdb'
import { getTrendingAnime, getPopularAnime, getTopAnime } from '../api/jikan'

export default function Home() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [
          trendMovies, popMovies, topMovies,
          trendSeries, popSeries, topSeries,
          trendAnime, popAnime, topAnime,
        ] = await Promise.allSettled([
          getTrendingMovies(), getPopularMovies(), getTopRatedMovies(),
          getTrendingSeries(), getPopularSeries(), getTopRatedSeries(),
          getTrendingAnime(), getPopularAnime(), getTopAnime(),
        ])

        setData({
          trendMovies: trendMovies.value?.data?.results || [],
          popMovies: popMovies.value?.data?.results || [],
          topMovies: topMovies.value?.data?.results || [],
          trendSeries: trendSeries.value?.data?.results || [],
          popSeries: popSeries.value?.data?.results || [],
          topSeries: topSeries.value?.data?.results || [],
          trendAnime: trendAnime.value?.data?.data || [],
          popAnime: popAnime.value?.data?.data || [],
          topAnime: topAnime.value?.data?.data || [],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const heroItems = [
    ...(data.trendMovies || []).slice(0, 2),
    ...(data.trendSeries || []).slice(0, 2),
    ...(data.trendAnime || []).slice(0, 1),
  ]

  const heroType = 'movie'

  return (
    <div>
      <Hero
        items={loading ? [] : heroItems}
        type={heroType}
        onPlay={(item, type) => setSelected({ item, type })}
      />

      <div className="mt-2">
        <CategoryRow title="🔥 Em Alta (Filmes)" items={data.trendMovies} loading={loading} type="movie" onCardClick={(i) => setSelected({ item: i, type: 'movie' })} />
        <CategoryRow title="🎬 Filmes Populares" items={data.popMovies} loading={loading} type="movie" onCardClick={(i) => setSelected({ item: i, type: 'movie' })} />
        <CategoryRow title="⭐ Filmes Mais Bem Avaliados" items={data.topMovies} loading={loading} type="movie" onCardClick={(i) => setSelected({ item: i, type: 'movie' })} />
        <CategoryRow title="📺 Séries em Alta" items={data.trendSeries} loading={loading} type="tv" onCardClick={(i) => setSelected({ item: i, type: 'tv' })} />
        <CategoryRow title="🌟 Séries Populares" items={data.popSeries} loading={loading} type="tv" onCardClick={(i) => setSelected({ item: i, type: 'tv' })} />
        <CategoryRow title="🏆 Séries Mais Bem Avaliadas" items={data.topSeries} loading={loading} type="tv" onCardClick={(i) => setSelected({ item: i, type: 'tv' })} />
        <CategoryRow title="⚡ Animes em Alta" items={data.trendAnime} loading={loading} type="anime" onCardClick={(i) => setSelected({ item: i, type: 'anime' })} />
        <CategoryRow title="💫 Animes Populares" items={data.popAnime} loading={loading} type="anime" onCardClick={(i) => setSelected({ item: i, type: 'anime' })} />
        <CategoryRow title="🥇 Top Animes" items={data.topAnime} loading={loading} type="anime" onCardClick={(i) => setSelected({ item: i, type: 'anime' })} />
      </div>

      {selected && (
        <Modal
          item={selected.item}
          type={selected.type}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
