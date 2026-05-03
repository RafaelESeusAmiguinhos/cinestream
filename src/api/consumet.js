// Tenta todas as instâncias em paralelo e usa a primeira que responder
const INSTANCES = [
  'https://consumet-api.onrender.com',
  'https://consumet.onrender.com',
  'https://api.consumet.org',
]

// Se todas falharem, tenta via proxy CORS público
const CORS_PROXY = 'https://corsproxy.io/?url='

const cache = new Map()

async function fetchJSON(url, timeout = 35000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    clearTimeout(timer)
    throw e
  }
}

async function tryAll(path) {
  // Dispara todas as instâncias ao mesmo tempo — usa a mais rápida
  const races = INSTANCES.map((base) => fetchJSON(`${base}${path}`, 35000))

  const results = await Promise.allSettled(races)
  const winner = results.find(
    (r) => r.status === 'fulfilled' && r.value && !r.value.message?.includes('not found'),
  )
  if (winner) return winner.value

  // Último recurso: proxy CORS (contorna bloqueios regionais)
  const proxyUrl = CORS_PROXY + encodeURIComponent(`https://consumet-api.onrender.com${path}`)
  return fetchJSON(proxyUrl, 40000)
}

/* ── AniList GraphQL (CORS liberado, sem chave) ── */
export async function searchAniList(title) {
  const query = `query($s:String){Media(search:$s,type:ANIME,format_in:[TV,MOVIE,OVA,ONA,SPECIAL]){id title{romaji english}episodes}}`
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables: { s: title } }),
  })
  const json = await res.json()
  return json?.data?.Media ?? null
}

/* ── Episódios via Consumet (provider = gogoanime, fallback = animepahe) ── */
export async function getEpisodesFromAniList(anilistId, subOrDub = 'sub') {
  const key = `eps_${anilistId}_${subOrDub}`
  if (cache.has(key)) return cache.get(key)

  // Tenta gogoanime, depois animepahe se voltar vazio
  for (const provider of ['gogoanime', 'animepahe']) {
    try {
      const path = `/meta/anilist/info/${anilistId}?provider=${provider}&subOrDub=${subOrDub}`
      const data = await tryAll(path)
      const eps = data?.episodes ?? []
      if (eps.length > 0) {
        cache.set(key, eps)
        return eps
      }
    } catch { /* tenta próximo */ }
  }
  return []
}

/* ── Stream — retorna { url, subtitles } ── */
export async function getStreamUrl(episodeId) {
  const path = `/meta/anilist/watch/${encodeURIComponent(episodeId)}?provider=gogoanime`
  const data = await tryAll(path)
  const sources = data?.sources ?? []
  const best =
    sources.find((s) => s.isM3U8 && s.quality === 'default') ??
    sources.find((s) => s.isM3U8) ??
    sources[0]
  return {
    url: best?.url ?? null,
    subtitles: (data?.subtitles ?? []).filter((s) => s.url?.endsWith('.vtt')),
  }
}
