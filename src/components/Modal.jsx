import { useEffect, useState, useRef } from 'react'
import { getImgUrl, getMovieDetails, getSeriesDetails } from '../api/tmdb'
import { getAnimeDetails, getAnimeEpisodes } from '../api/jikan'
import { searchAniList, getEpisodesFromAniList, getStreamUrl } from '../api/consumet'
import VideoPlayer from './VideoPlayer'

/* ────────────────────────────────────────────
   Servidores de embed para filmes / séries
   sandbox bloqueia popups e redirecionamentos
──────────────────────────────────────────── */
const MOVIE_SERVERS = [
  { id: 1, name: 'Server 1', url: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { id: 2, name: 'Server 2', url: (id) => `https://embed.su/embed/movie/${id}` },
  { id: 3, name: 'Server 3', url: (id) => `https://www.2embed.cc/embed/${id}` },
  { id: 4, name: 'Server 4', url: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
  { id: 5, name: 'Server 5', url: (id) => `https://vidsrc.to/embed/movie/${id}` },
]

const TV_SERVERS = [
  { id: 1, name: 'Server 1', url: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { id: 2, name: 'Server 2', url: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
  { id: 3, name: 'Server 3', url: (id, s, e) => `https://www.2embed.cc/embed/tv?tmdb=${id}&s=${s}&e=${e}` },
  { id: 4, name: 'Server 4', url: (id, s, e) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { id: 5, name: 'Server 5', url: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
]

// Atributo sandbox: bloqueia popups e redirecionamentos sem quebrar o player
const IFRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-presentation allow-autoplay'

/* ────────────────────────────────────
   Player de filmes / séries (iframes)
──────────────────────────────────── */
function TmdbPlayer({ item, type }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('info')   // 'info' | 'trailer' | 'watch'
  const [trailerKey, setTrailerKey] = useState(null)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [totalSeasons, setTotalSeasons] = useState(1)
  const [seasonEps, setSeasonEps] = useState({})  // { season: totalEps }
  const [server, setServer] = useState(1)
  const isTV = type === 'tv'
  const servers = isTV ? TV_SERVERS : MOVIE_SERVERS

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
          const realSeasons = (d.seasons ?? []).filter((s) => s.season_number > 0)
          setTotalSeasons(realSeasons.length || d.number_of_seasons || 1)
          const counts = {}
          realSeasons.forEach((s) => { counts[s.season_number] = s.episode_count ?? 1 })
          setSeasonEps(counts)
          const first = realSeasons[0]
          if (first) { setSeason(first.season_number); }
        }
      } catch { /* silencia */ } finally { setLoading(false) }
    }
    fetch()
  }, [item.id, isTV])

  const totalEps = seasonEps[season] ?? 1
  const embedUrl = isTV
    ? servers.find((s) => s.id === server)?.url(item.id, season, episode)
    : servers.find((s) => s.id === server)?.url(item.id)

  const title    = details?.title || details?.name || item.title || item.name
  const overview = details?.overview || item.overview
  const score    = details?.vote_average || item.vote_average
  const year     = (details?.release_date || details?.first_air_date || '').slice(0, 4)
  const backdrop = getImgUrl(details?.backdrop_path || item.backdrop_path, 'w1280')
  const genres   = details?.genres?.map((g) => g.name) ?? []
  const cast     = details?.credits?.cast?.slice(0, 6).map((c) => c.name).join(', ')

  if (loading) return (
    <div className="h-72 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      {/* ── Player / trailer / poster ── */}
      {mode === 'watch' && (
        <div className="bg-black">
          {/* Barra de servidores */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#111]">
            <span className="text-gray-500 text-xs mr-1">Servidor:</span>
            {servers.map((s) => (
              <button
                key={s.id}
                onClick={() => setServer(s.id)}
                className={`text-xs px-3 py-1 rounded-full transition-colors font-medium ${
                  server === s.id
                    ? 'bg-[#E50914] text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {s.name}
              </button>
            ))}

            {/* Seletor de temporada/episódio para séries */}
            {isTV && (
              <div className="flex gap-1.5 ml-auto">
                <select
                  value={season}
                  onChange={(e) => { setSeason(+e.target.value); setEpisode(1) }}
                  className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 outline-none"
                >
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s} className="bg-gray-900">Temp. {s}</option>
                  ))}
                </select>
                <select
                  value={episode}
                  onChange={(e) => setEpisode(+e.target.value)}
                  className="bg-white/10 text-white text-xs px-2 py-1 rounded border border-white/20 outline-none"
                >
                  {Array.from({ length: Math.max(totalEps, 1) }, (_, i) => i + 1).map((e) => (
                    <option key={e} value={e} className="bg-gray-900">Ep. {e}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setMode('info')}
              className="text-gray-500 hover:text-white text-xs px-2 ml-1"
            >
              ✕
            </button>
          </div>

          {/* iframe com sandbox anti-ads/redirect */}
          <iframe
            key={`${server}-${season}-${episode}`}
            src={embedUrl}
            className="w-full aspect-video"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            sandbox={IFRAME_SANDBOX}
            referrerPolicy="no-referrer"
          />
          <p className="text-gray-600 text-xs text-center py-1.5 bg-[#111]">
            Popups e redirecionamentos bloqueados · Se não carregar, troque o servidor
          </p>
        </div>
      )}

      {mode === 'trailer' && trailerKey && (
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
          className="w-full aspect-video"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          sandbox={IFRAME_SANDBOX}
        />
      )}

      {mode === 'info' && (
        <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
          {backdrop && (
            <img src={backdrop} alt={title} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/20 to-transparent" />
          <button
            onClick={() => setMode('watch')}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="w-16 h-16 bg-white/20 group-hover:bg-white/35 backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
              <span className="text-white text-3xl ml-1">▶</span>
            </div>
          </button>
        </div>
      )}

      {/* ── Informações ── */}
      <div className="p-5 md:p-6">
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
          {isTV && totalSeasons > 0 && (
            <span className="text-gray-400">{totalSeasons} temporada{totalSeasons > 1 ? 's' : ''}</span>
          )}
        </div>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {genres.map((g) => (
              <span key={g} className="bg-white/10 text-gray-200 text-xs px-2.5 py-0.5 rounded-full">{g}</span>
            ))}
          </div>
        )}
        {overview && <p className="text-gray-300 text-sm leading-relaxed mb-2">{overview}</p>}
        {cast && <p className="text-gray-500 text-xs">Elenco: {cast}</p>}
      </div>
    </div>
  )
}

/* ────────────────────────────────
   Player de anime com sub / dub
──────────────────────────────── */
function AnimePlayer({ item }) {
  const [details, setDetails]     = useState(null)
  const [jikanEps, setJikanEps]   = useState([])
  const [totalEps, setTotalEps]   = useState(0)
  const [epPage, setEpPage]       = useState(1)
  const [activeTab, setActiveTab] = useState('sobre')
  const [subOrDub, setSubOrDub]   = useState('sub')
  const [dubAvail, setDubAvail]   = useState(null)  // null=desconhecido, true/false

  // Stream
  const [selectedEp, setSelectedEp]   = useState(null)
  const [streamUrl, setStreamUrl]     = useState(null)
  const [subtitles, setSubtitles]     = useState([])
  const [streamLoading, setStreamLoading] = useState(false)
  const [streamError, setStreamError] = useState('')
  const [streamStatus, setStreamStatus] = useState('')

  // Refs de cache
  const anilistId    = useRef(null)
  const consumetEps  = useRef({ sub: [], dub: [] })

  // Carrega detalhes e episódios do Jikan
  useEffect(() => {
    const load = async () => {
      try {
        const [detRes, epRes] = await Promise.allSettled([
          getAnimeDetails(item.mal_id),
          getAnimeEpisodes(item.mal_id, 1),
        ])
        if (detRes.status === 'fulfilled') setDetails(detRes.value?.data?.data)
        if (epRes.status === 'fulfilled') {
          const d = epRes.value?.data
          setJikanEps(d?.data ?? [])
          setTotalEps(d?.pagination?.items?.total ?? 0)
        }
      } catch { /* ignora */ }
    }
    load()
  }, [item.mal_id])

  // Mais episódios (paginação)
  useEffect(() => {
    if (epPage === 1) return
    getAnimeEpisodes(item.mal_id, epPage)
      .then((r) => setJikanEps((p) => [...p, ...(r?.data?.data ?? [])]))
      .catch(() => {})
  }, [epPage, item.mal_id])

  // Quando troca sub/dub, reinicia stream
  useEffect(() => {
    setStreamUrl(null)
    setSelectedEp(null)
    setStreamError('')
    consumetEps.current[subOrDub] = []
  }, [subOrDub])

  const playEpisode = async (epNum) => {
    setSelectedEp(epNum)
    setStreamUrl(null)
    setSubtitles([])
    setStreamError('')
    setStreamLoading(true)
    setActiveTab('episodios')

    try {
      // 1 — Obtém AniList ID (uma vez)
      if (!anilistId.current) {
        const searchTitle =
          details?.title_english ?? details?.title ?? item.title_english ?? item.title
        setStreamStatus(`Buscando "${searchTitle}" no AniList...`)
        const media = await searchAniList(searchTitle)
        if (!media?.id) throw new Error('Anime não encontrado no AniList')
        anilistId.current = media.id
      }

      // 2 — Obtém lista de episódios (sub ou dub)
      if (consumetEps.current[subOrDub].length === 0) {
        setStreamStatus(`Carregando episódios (${subOrDub.toUpperCase()})... aguarde ~30s`)
        const eps = await getEpisodesFromAniList(anilistId.current, subOrDub)
        if (eps.length === 0 && subOrDub === 'dub') {
          setDubAvail(false)
          throw new Error('Dublagem não disponível para este anime')
        }
        if (eps.length === 0) throw new Error('Nenhum episódio encontrado na fonte')
        consumetEps.current[subOrDub] = eps
        if (subOrDub === 'dub') setDubAvail(true)
      }

      // 3 — Encontra episódio
      const eps = consumetEps.current[subOrDub]
      const epEntry =
        eps.find((e) => e.number === epNum) ?? eps[epNum - 1]
      if (!epEntry) throw new Error(`Episódio ${epNum} indisponível`)

      // 4 — Obtém URL de stream
      setStreamStatus(`Carregando stream — episódio ${epNum}...`)
      const { url, subtitles: subs } = await getStreamUrl(epEntry.id)
      if (!url) throw new Error('Stream não encontrado para este episódio')

      setStreamUrl(url)
      setSubtitles(subs)
    } catch (e) {
      const msg = e.message ?? ''
      if (msg.includes('timeout') || msg.includes('ECONNABORTED') || msg.includes('falharam')) {
        setStreamError(
          'Servidor de streaming não respondeu. Aguarde ~1 min e tente novamente — o servidor gratuito pode estar iniciando.'
        )
      } else {
        setStreamError(msg || 'Erro ao carregar stream.')
      }
    } finally {
      setStreamLoading(false)
      setStreamStatus('')
    }
  }

  const title    = details?.title    ?? details?.title_english ?? item.title
  const overview = details?.synopsis
  const score    = details?.score    ?? item.score
  const poster   = details?.images?.jpg?.large_image_url ?? item.images?.jpg?.large_image_url
  const genres   = details?.genres?.map((g) => g.name) ?? []
  const epCount  = details?.episodes ?? item.episodes ?? totalEps
  const year     = details?.year     ?? item.year

  return (
    <div>
      {/* ── Área do player ── */}
      {streamLoading && (
        <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 text-sm">{streamStatus || 'Carregando...'}</p>
          <p className="text-gray-600 text-xs">Servidores gratuitos podem levar até 40s na primeira carga</p>
        </div>
      )}

      {!streamLoading && streamUrl && (
        <div className="relative">
          <VideoPlayer src={streamUrl} poster={poster} subtitles={subtitles} />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
              Ep. {selectedEp}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
              subOrDub === 'dub' ? 'bg-blue-700 text-white' : 'bg-yellow-700 text-white'
            }`}>
              {subOrDub.toUpperCase()}
            </span>
            {subtitles.length > 0 && (
              <span className="bg-green-700/80 text-white text-xs px-2 py-1 rounded-full">
                CC
              </span>
            )}
          </div>
          <button
            onClick={() => { setStreamUrl(null); setSelectedEp(null) }}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-3 py-1 rounded-full"
          >
            ✕ Fechar
          </button>
        </div>
      )}

      {!streamLoading && !streamUrl && (
        <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
          {poster && (
            <img src={poster} alt={title} className="w-full h-full object-cover object-top" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-white/10 px-5 mt-1">
        {['sobre', 'episodios'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
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
        {/* ── Erro de stream ── */}
        {streamError && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-4 flex gap-3">
            <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">⚠</span>
            <div>
              <p className="text-red-300 text-sm">{streamError}</p>
              {selectedEp && (
                <button
                  onClick={() => playEpisode(selectedEp)}
                  className="mt-2 text-xs bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                >
                  Tentar novamente
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Aba Sobre ── */}
        {activeTab === 'sobre' && (
          <div>
            <div className="flex gap-4 mb-4">
              {poster && (
                <img
                  src={poster}
                  alt={title}
                  className="w-20 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-xl font-bold leading-tight">{title}</h2>
                {details?.title_english && details.title_english !== title && (
                  <p className="text-gray-500 text-sm mt-0.5">{details.title_english}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
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
              <p className="text-gray-500 text-xs mt-3">
                Estúdio: {details.studios.map((s) => s.name).join(', ')}
              </p>
            )}
            <button
              onClick={() => setActiveTab('episodios')}
              className="mt-4 flex items-center gap-2 bg-[#E50914] text-white font-bold px-5 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              ▶ Ver Episódios
            </button>
          </div>
        )}

        {/* ── Aba Episódios ── */}
        {activeTab === 'episodios' && (
          <div>
            {/* Toggle Sub / Dub */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gray-400 text-sm font-medium">Áudio:</span>
              <div className="flex rounded-lg overflow-hidden border border-white/15">
                <button
                  onClick={() => setSubOrDub('sub')}
                  className={`px-4 py-1.5 text-sm font-bold transition-colors ${
                    subOrDub === 'sub'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Legendado
                </button>
                <button
                  onClick={() => setSubOrDub('dub')}
                  className={`px-4 py-1.5 text-sm font-bold transition-colors ${
                    subOrDub === 'dub'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Dublado
                  {dubAvail === false && (
                    <span className="ml-1 text-xs opacity-60">✕</span>
                  )}
                </button>
              </div>
              {subtitles.length > 0 && (
                <span className="text-green-400 text-xs bg-green-900/40 px-2 py-0.5 rounded">
                  CC Legendas disponíveis
                </span>
              )}
            </div>

            {/* Lista de episódios */}
            {jikanEps.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin mx-auto mb-3" />
                Carregando episódios...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                  {jikanEps.map((ep) => {
                    const isPlaying = selectedEp === ep.mal_id && !!streamUrl
                    const isLoading = selectedEp === ep.mal_id && streamLoading
                    return (
                      <button
                        key={ep.mal_id}
                        onClick={() => playEpisode(ep.mal_id)}
                        disabled={streamLoading}
                        className={`text-left p-3 rounded-lg text-sm transition-all border disabled:opacity-50 ${
                          isPlaying
                            ? 'bg-[#E50914] border-red-600 text-white'
                            : isLoading
                            ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300 animate-pulse'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          {isPlaying && <span className="text-xs">▶</span>}
                          <span className="font-bold text-xs">Ep. {ep.mal_id}</span>
                        </div>
                        <div className="text-xs opacity-75 line-clamp-2">
                          {ep.title || `Episódio ${ep.mal_id}`}
                        </div>
                        {ep.aired && (
                          <div className="text-xs opacity-40 mt-0.5">
                            {ep.aired.slice(0, 10)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {jikanEps.length < (totalEps || epCount || 0) && (
                  <button
                    onClick={() => setEpPage((p) => p + 1)}
                    className="mt-3 w-full bg-white/10 hover:bg-white/15 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    Carregar mais ({jikanEps.length}/{totalEps || epCount})
                  </button>
                )}

                <p className="text-gray-600 text-xs mt-3 text-center">
                  Clique para assistir · Primeira carga: ~30s · Suporte a CC quando disponível
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ────────────────────────
   Modal wrapper
──────────────────────── */
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
        {type === 'anime' ? <AnimePlayer item={item} /> : <TmdbPlayer item={item} type={type} />}
      </div>
    </div>
  )
}
