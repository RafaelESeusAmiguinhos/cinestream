import axios from 'axios'

const api = axios.create({ baseURL: 'https://api.jikan.moe/v4' })

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

const safeGet = async (url, params = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await api.get(url, { params })
      return res
    } catch (e) {
      if (e.response?.status === 429 && i < retries - 1) {
        await delay(1500)
      } else {
        throw e
      }
    }
  }
}

export const getTrendingAnime = () => safeGet('/top/anime', { filter: 'airing', limit: 20 })
export const getPopularAnime = () => safeGet('/top/anime', { filter: 'bypopularity', limit: 20 })
export const getTopAnime = () => safeGet('/top/anime', { limit: 20 })
export const getSeasonAnime = () => safeGet('/seasons/now', { limit: 20 })
export const getAnimeByGenre = (genreId, page = 1) =>
  safeGet('/anime', { genres: genreId, page, order_by: 'popularity', sort: 'asc', limit: 20 })
export const getAnimeDetails = (id) => safeGet(`/anime/${id}/full`)
export const searchAnime = (query, page = 1) => safeGet('/anime', { q: query, page, limit: 20 })

export const ANIME_GENRES = [
  { id: 1, name: 'Ação' },
  { id: 2, name: 'Aventura' },
  { id: 4, name: 'Comédia' },
  { id: 7, name: 'Mistério' },
  { id: 8, name: 'Drama' },
  { id: 9, name: 'Ecchi' },
  { id: 10, name: 'Fantasia' },
  { id: 14, name: 'Terror' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Ficção Científica' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Sobrenatural' },
]
