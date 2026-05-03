import axios from 'axios'

// Instâncias do Consumet — tenta todas antes de desistir
const INSTANCES = [
  'https://consumet-api.onrender.com',
  'https://consumet.onrender.com',
  'https://api.consumet.org',
]

// Cache em memória para evitar requisições repetidas
const cache = new Map()

async function tryInstances(path, timeoutMs = 38000) {
  let lastErr
  for (const base of INSTANCES) {
    try {
      const res = await axios.get(`${base}${path}`, { timeout: timeoutMs })
      if (res.data && !res.data.message?.includes('not found')) return res
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('Todas as instâncias falharam')
}

/* ── AniList GraphQL (sem chave, CORS liberado) ── */
export async function searchAniList(title) {
  const q = `query($s:String){Media(search:$s,type:ANIME,format_in:[TV,MOVIE,OVA,ONA,SPECIAL]){id title{romaji english}episodes}}`
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: q, variables: { s: title } }),
  })
  const json = await res.json()
  return json?.data?.Media ?? null
}

/* ── Episódios via Consumet (AniList meta → GogoAnime) ── */
export async function getEpisodesFromAniList(anilistId, subOrDub = 'sub') {
  const key = `eps_${anilistId}_${subOrDub}`
  if (cache.has(key)) return cache.get(key)

  const res = await tryInstances(
    `/meta/anilist/info/${anilistId}?provider=gogoanime&subOrDub=${subOrDub}`
  )
  const eps = res?.data?.episodes ?? []
  if (eps.length > 0) cache.set(key, eps)
  return eps
}

/* ── Stream de um episódio — retorna { url, subtitles } ── */
export async function getStreamUrl(episodeId) {
  const res = await tryInstances(
    `/meta/anilist/watch/${encodeURIComponent(episodeId)}?provider=gogoanime`
  )
  const data = res?.data ?? {}
  const sources = data.sources ?? []
  const best = sources.find((s) => s.isM3U8 && s.quality === 'default')
    ?? sources.find((s) => s.isM3U8)
    ?? sources[0]
  return {
    url: best?.url ?? null,
    subtitles: (data.subtitles ?? []).filter((s) => s.url?.endsWith('.vtt')),
  }
}
