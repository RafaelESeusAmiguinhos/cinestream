import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import Modal from '../components/Modal'
import { searchMulti } from '../api/tmdb'
import { searchAnime } from '../api/jikan'

export default function Search() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState([])
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!query) return
    const fetch = async () => {
      setLoading(true)
      setResults([])
      setAnime([])
      try {
        const [tmdb, jikan] = await Promise.allSettled([
          searchMulti(query),
          searchAnime(query),
        ])
        setResults((tmdb.value?.data?.results || []).filter((r) => r.media_type !== 'person'))
        setAnime(jikan.value?.data?.data || [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [query])

  const getType = (item) => item.media_type === 'tv' ? 'tv' : 'movie'

  return (
    <div className="pt-24 px-4 md:px-8 min-h-screen">
      <h1 className="text-white text-2xl font-bold mb-6">
        {query ? `Resultados para: "${query}"` : 'Buscar'}
      </h1>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length === 0 && anime.length === 0 && query && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl">Nenhum resultado encontrado para "{query}"</p>
          <p className="text-sm mt-2">Tente outros termos de busca</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mb-10">
          <h2 className="text-white text-lg font-bold mb-4">🎬 Filmes & Séries ({results.length})</h2>
          <div className="flex flex-wrap gap-4">
            {results.map((item) => (
              <MovieCard
                key={item.id}
                item={item}
                type={getType(item)}
                onClick={(i, t) => setSelected({ item: i, type: t })}
              />
            ))}
          </div>
        </div>
      )}

      {anime.length > 0 && (
        <div className="mb-10">
          <h2 className="text-white text-lg font-bold mb-4">🎌 Anime ({anime.length})</h2>
          <div className="flex flex-wrap gap-4">
            {anime.map((item) => (
              <MovieCard
                key={item.mal_id}
                item={item}
                type="anime"
                onClick={(i) => setSelected({ item: i, type: 'anime' })}
              />
            ))}
          </div>
        </div>
      )}

      {selected && (
        <Modal item={selected.item} type={selected.type} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
