import { useEffect, useState, useCallback } from 'react'
import { getImgUrl, getMovieDetails, getSeriesDetails } from '../api/tmdb'
import { getAnimeDetails, getAnimeEpisodes } from '../api/jikan'
import { searchGogoanime, getGogoanimeInfo, watchGogoanime } from '../api/consumet'
import VideoPlayer from './VideoPlayer'

/* ─── TMDB / vidsrc player ─── */
function TmdbPlayer({ item, type }) {
  const [mode, setMode] = useState('trailer') // 'trailer' | 'watch'
  const [trailerKey, setTrailerKey] = useState(null)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [totalSeasons, setTotalSeasons] = useState(1)
  const [totalEps, setTotalEps] = useState(1)
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const isTV = type === 'tv'

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = isTV ? await getSeriesDetails(item.id) : await getMovieDetails(item.id)
        const d = res.data
        setDetails(d)
        const t = d.videos?.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube')
        if (t) setTrailerKey(t.key)
        if (isTV) {
          setTotalSeasons(d.number_of_seasons || 1)
          if (d.seasons?.[0]) {
            const firstReal = d.seasons.find((s) => s.season_number > 0) || d.seasons[0]
            setSeason(firstReal.season_number)
            setTotalEps(firstReal.episode_count || 1)
          }
        }
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetch()
  }, [item.id, isTV])

  const watchUrl = isTV
    ? `https://vidsrc.to/embed/tv/${item.id}/${season}/${episode}`
    : `https://vidsrc.to/embed/movie/${item.id}`

  const title = details?.title || details?.name || item.title || item.name
  const overview = details?.overview || item.overview
  const score = details?.vote_average || item.vote_average
  const year = (details?.release_date || details?.first_air_date || '').slice(0, 4)
  const backdrop = getImgUrl(details?.backdrop_path || item.backdrop_path, 'w1280')
  const genres = details?.genres?.map((g) => g.name) || []
  const cast = details?.credits?.cast?.slice(0, 6).map((c) => c.name).join(', ')

  if (loading) return (
    <div className="h-80 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      {/* Player area */}
      {mode === 'watch' ? (
        <div className="relative bg-black">
          <iframe
            src={watchUrl}
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
          <button
            onClick={() => setMode('trailer')}
            className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black"
          >
            ✕ Fechar Player
          </button>
        </div>
      ) : mode === 'trailer' && trailerKey ? (
        <div className="relative">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=0`}
            className="w-full aspect-video"
            allow="encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-gray-900">
          {backdrop && <img src={backdrop} alt={title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
        </div>
      )}

      {/* Info */}
      <div className="p-5 md:p-6">
        {/* Season/episode selector for TV */}
        {isTV && mode === 'watch' && (
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-xs">Temporada</label>
              <select
                value={season}
                onChange={(e) => { setSeason(+e.target.value); setEpisode(1) }}
                className="bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 outline-none"
              >
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>T{s}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-xs">Episódio</label>
              <select
                value={episode}
                onChange={(e) => setEpisode(+e.target.value)}
                className="bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 outline-none"
              >
                {Array.from({ length: Math.max(totalEps, 1) }, (_, i) => i + 1).map((e) => (
                  <option key={e} value={e}>E{e}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setMode('watch')}
            className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            ▶ Assistir
          </button>
          {trailerKey && (
            <button
              onClick={() => setMode(mode === 'trailer' ? 'info' : 'trailer')}
              className="flex items-center gap-2 bg-white/15 text-white font-semibold px-4 py-2 rounded-md hover:bg-white/25 transition-colors text-sm"
            >
              {mode === 'trailer' ? '⊠ Fechar Trailer' : '▷ Trailer'}
            </button>
          )}
        </div>

        <h2 className="text-white text-2xl font-bold mb-1">{title}</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
          {score > 0 && <span className="text-yellow-400 font-bold">⭐ {Number(score).toFixed(1)}</span>}
          {year && <span className="text-gray-400">{year}</span>}
          {isTV && totalSeasons > 0 && <span className="text-gray-400">{totalSeasons} temp.</span>}
        </div>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {genres.map((g) => (
              <span key={g} className="bg-white/10 text-gray-200 text-xs px-2.5 py-0.5 rounded-full">{g}</span>
            ))}
          </div>
        )}
        {overview && <p className="text-gray-300 text-sm leading-relaxed mb-3">{overview}</p>}
        {cast && <p className="text-gray-500 text-xs">Elenco: {cast}</p>}
      </div>
    </div>
  )
}

/* ─── Anime player ─── */
function AnimePlayer({ item }) {
  const [details, setDetails] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [totalEps, setTotalEps] = useState(0)
  const [epPage, setEpPage] = useState(1)
  const [activeTab, setActiveTab] = useState('sobre') // 'sobre' | 'episodios'

  // Consumet state
  const [gogoanimeId, setGogoanimeId] = useState(null)
  const [gogoanimeEps, setGogoanimeEps] = useState([])
  const [selectedEp, setSelectedEp] = useState(null)
  const [streamUrl, setStreamUrl] = useState(null)
  const [streamLoading, setStreamLoading] = useState(false)
  const [streamError, setStreamError] = useState('')
  const [searchingStream, setSearchingStream] = useState(false)

  // Load anime details + episodes from Jikan
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detRes, epRes] = await Promise.allSettled([
          getAnimeDetails(item.mal_id),
          getAnimeEpisodes(item.mal_id, 1),
        ])
        const d = detRes.value?.data?.data
        setDetails(d)
        const epData = epRes.value?.data
        setEpisodes(epData?.data || [])
        setTotalEps(epData?.pagination?.items?.total || d?.episodes || 0)
      } catch { /* ignore */ }
    }
    fetchDetails()
  }, [item.mal_id])

  // Load more episode pages
  useEffect(() => {
    if (epPage === 1) return
    const fetch = async () => {
      try {
        const res = await getAnimeEpisodes(item.mal_id, epPage)
        setEpisodes((prev) => [...prev, ...(res?.data?.data || [])])
      } catch { /* ignore */ }
    }
    fetch()
  }, [epPage, item.mal_id])

  // Find anime on Gogoanime via Consumet
  const findOnGogoanime = useCallback(async (title) => {
    setSearchingStream(true)
    try {
      const res = await searchGogoanime(title)
      const results = res?.data?.results || []
      if (results.length === 0) return null
      // prefer exact or closest match
      const match = results.find((r) =>
        r.title?.toLowerCase().includes(title.toLowerCase().split(' ')[0])
      ) || results[0]
      setGogoanimeId(match.id)

      // Get episodes from Consumet
      const infoRes = await getGogoanimeInfo(match.id)
      const eps = infoRes?.data?.episodes || []
      setGogoanimeEps(eps)
      return match.id
    } catch {
      return null
    } finally {
      setSearchingStream(false)
    }
  }, [])

  const playEpisode = async (epNum) => {
    setSelectedEp(epNum)
    setStreamUrl(null)
    setStreamError('')
    setStreamLoading(true)
    setActiveTab('episodios')

    try {
      let gId = gogoanimeId
      if (!gId) {
        const searchTitle = details?.title_english || details?.title || item.title
        gId = await findOnGogoanime(searchTitle)
      }

      if (!gId) {
        setStreamError('Anime não encontrado na fonte de streaming.')
        setStreamLoading(false)
        return
      }

      // Find the episode ID from Consumet's list
      let eps = gogoanimeEps
      if (eps.length === 0) {
        const infoRes = await getGogoanimeInfo(gId)
        eps = infoRes?.data?.episodes || []
        setGogoanimeEps(eps)
      }

      const epEntry = eps.find((e) => e.number === epNum) || eps[epNum - 1]
      if (!epEntry) {
        setStreamError(`Episódio ${epNum} não disponível.`)
        setStreamLoading(false)
        return
      }

      const watchRes = await watchGogoanime(epEntry.id)
      const sources = watchRes?.data?.sources || []
      // Prefer default HLS source
      const hls = sources.find((s) => s.isM3U8) || sources[0]
      if (!hls) {
        setStreamError('Stream não disponível para este episódio.')
      } else {
        setStreamUrl(hls.url)
      }
    } catch (e) {
      if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
        setStreamError('O servidor de streaming está iniciando (pode levar ~30s). Tente novamente.')
      } else {
        setStreamError('Erro ao carregar stream. Tente outro episódio.')
      }
    } finally {
      setStreamLoading(false)
    }
  }

  const title = details?.title || details?.title_english || item.title
  const overview = details?.synopsis
  const score = details?.score || item.score
  const poster = details?.images?.jpg?.large_image_url || item.images?.jpg?.large_image_url
  const genres = details?.genres?.map((g) => g.name) || []
  const year = details?.year || item.year
  const epCount = details?.episodes || item.episodes || totalEps

  return (
    <div>
      {/* Player or poster */}
      {streamLoading && (
        <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">
            {searchingStream ? 'Buscando anime...' : `Carregando episódio ${selectedEp}...`}
          </p>
          <p className="text-gray-600 text-xs">Pode levar até 30s no primeiro acesso</p>
        </div>
      )}

      {!streamLoading && streamUrl && (
        <div className="relative">
          <VideoPlayer src={streamUrl} poster={poster} />
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
            Episódio {selectedEp}
          </div>
          <button
            onClick={() => { setStreamUrl(null); setSelectedEp(null) }}
            className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full hover:bg-black"
          >
            ✕ Fechar
          </button>
        </div>
      )}

      {!streamLoading && !streamUrl && (
        <div className="relative w-full aspect-video bg-gray-900">
          {poster && <img src={poster} alt={title} className="w-full h-full object-cover object-top" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-5 mt-2">
        {['sobre', 'episodios'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'sobre' ? 'Sobre' : `Episódios${epCount > 0 ? ` (${epCount})` : ''}`}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Stream error */}
        {streamError && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
            {streamError}
          </div>
        )}

        {activeTab === 'sobre' && (
          <div>
            <div className="flex gap-4 mb-4">
              {/* Poster thumb */}
              <img src={poster} alt={title} className="w-20 rounded-lg object-cover flex-shrink-0 hidden sm:block" />
              <div>
                <h2 className="text-white text-xl font-bold">{title}</h2>
                {details?.title_english && details.title_english !== title && (
                  <p className="text-gray-500 text-sm">{details.title_english}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm mt-1">
                  {score > 0 && <span className="text-yellow-400 font-bold">⭐ {Number(score).toFixed(1)}</span>}
                  {year && <span className="text-gray-400">{year}</span>}
                  {epCount > 0 && <span className="text-gray-400">{epCount} ep.</span>}
                  {details?.status && (
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      details.status === 'Currently Airing' ? 'bg-green-700' : 'bg-gray-700'
                    }`}>
                      {details.status === 'Currently Airing' ? 'Em exibição' : 'Finalizado'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {genres.map((g) => (
                  <span key={g} className="bg-white/10 text-gray-200 text-xs px-2.5 py-0.5 rounded-full">{g}</span>
                ))}
              </div>
            )}
            {overview && <p className="text-gray-300 text-sm leading-relaxed">{overview}</p>}
            {details?.studios?.length > 0 && (
              <p className="text-gray-500 text-xs mt-3">Estúdio: {details.studios.map((s) => s.name).join(', ')}</p>
            )}
            <button
              onClick={() => { setActiveTab('episodios') }}
              className="mt-4 flex items-center gap-2 bg-[#E50914] text-white font-bold px-5 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              ▶ Ver Episódios
            </button>
          </div>
        )}

        {activeTab === 'episodios' && (
          <div>
            {episodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin mx-auto mb-3" />
                Carregando episódios...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                  {episodes.map((ep) => (
                    <button
                      key={ep.mal_id}
                      onClick={() => playEpisode(ep.mal_id)}
                      className={`text-left p-3 rounded-lg text-sm transition-colors border ${
                        selectedEp === ep.mal_id
                          ? 'bg-[#E50914] border-red-600 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs mb-0.5">Ep. {ep.mal_id}</div>
                      <div className="text-xs opacity-80 line-clamp-2">
                        {ep.title || `Episódio ${ep.mal_id}`}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Load more episodes */}
                {episodes.length < totalEps && (
                  <button
                    onClick={() => setEpPage((p) => p + 1)}
                    className="mt-3 w-full bg-white/10 hover:bg-white/15 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    Carregar mais episódios
                  </button>
                )}

                <p className="text-gray-600 text-xs mt-3 text-center">
                  Clique em um episódio para assistir direto aqui
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Modal wrapper ─── */
export default function Modal({ item, type, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="modal-enter relative bg-[#1a1a1a] rounded-xl overflow-hidden w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
        >
          ×
        </button>

        {type === 'anime' ? (
          <AnimePlayer item={item} />
        ) : (
          <TmdbPlayer item={item} type={type} />
        )}
      </div>
    </div>
  )
}
