import axios from 'axios'

const BASE = 'https://api.themoviedb.org/3'
export const IMG = 'https://image.tmdb.org/t/p'

export const getTmdbKey = () =>
  localStorage.getItem('tmdb_key') || import.meta.env.VITE_TMDB_KEY || ''

const getApi = () =>
  axios.create({ baseURL: BASE, params: { api_key: getTmdbKey(), language: 'pt-BR' } })

export const getImgUrl = (path, size = 'w500') =>
  path ? `${IMG}/${size}${path}` : null

export const validateTmdbKey = async (key) => {
  try {
    await axios.get(`${BASE}/movie/popular`, { params: { api_key: key, language: 'pt-BR' } })
    return true
  } catch {
    return false
  }
}

// Movies
export const getTrendingMovies = () => getApi().get('/trending/movie/week')
export const getPopularMovies = () => getApi().get('/movie/popular')
export const getTopRatedMovies = () => getApi().get('/movie/top_rated')
export const getNowPlayingMovies = () => getApi().get('/movie/now_playing')
export const getUpcomingMovies = () => getApi().get('/movie/upcoming')
export const getMoviesByGenre = (genreId, page = 1) =>
  getApi().get('/discover/movie', { params: { with_genres: genreId, page, sort_by: 'popularity.desc' } })
export const getMovieDetails = (id) =>
  getApi().get(`/movie/${id}`, { params: { append_to_response: 'videos,credits,similar' } })

// Series
export const getTrendingSeries = () => getApi().get('/trending/tv/week')
export const getPopularSeries = () => getApi().get('/tv/popular')
export const getTopRatedSeries = () => getApi().get('/tv/top_rated')
export const getAiringToday = () => getApi().get('/tv/airing_today')
export const getSeriesByGenre = (genreId, page = 1) =>
  getApi().get('/discover/tv', { params: { with_genres: genreId, page, sort_by: 'popularity.desc' } })
export const getSeriesDetails = (id) =>
  getApi().get(`/tv/${id}`, { params: { append_to_response: 'videos,credits,similar' } })

// Search
export const searchMulti = (query, page = 1) =>
  getApi().get('/search/multi', { params: { query, page } })
