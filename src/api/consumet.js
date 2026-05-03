import axios from 'axios'

// Múltiplas instâncias do Consumet (tenta próxima se falhar)
const INSTANCES = [
  'https://consumet-api.onrender.com',
  'https://api.consumet.org',
]

const cache = new Map()

const tryInstances = async (path, timeout = 40000) => {
  for (const base of INSTANCES) {
    try {
      const res = await axios.get(`${base}${path}`, { timeout })
      return res
    } catch {
      // tenta próxima instância
    }
  }
  throw new Error('Todas as instâncias falharam')
}

// Busca no AniList (GraphQL, sem CORS, sem chave)
export const searchAniList = async (title) => {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: `query($s:String){Media(search:$s,type:ANIME,format_in:[TV,MOVIE,OVA,ONA,SPECIAL]){id title{romaji english}episodes}}`,
      variables: { s: title },
    }),
  })
  const json = await res.json()
  return json?.data?.Media
}

// Busca episódios via Consumet (AniList meta → GogoAnime)
export const getEpisodesFromAniList = async (anilistId) => {
  const key = `eps_${anilistId}`
  if (cache.has(key)) return cache.get(key)
  const res = await tryInstances(`/meta/anilist/info/${anilistId}?provider=gogoanime`)
  const eps = res?.data?.episodes || []
  cache.set(key, eps)
  return eps
}

// Stream de um episódio
export const getStreamUrl = async (episodeId) => {
  const res = await tryInstances(`/meta/anilist/watch/${encodeURIComponent(episodeId)}?provider=gogoanime`, 40000)
  const sources = res?.data?.sources || []
  const hls = sources.find((s) => s.isM3U8) || sources[0]
  return hls?.url || null
}
