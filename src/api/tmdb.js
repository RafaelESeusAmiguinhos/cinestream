import axios from 'axios'

const KEY = import.meta.env.VITE_TMDB_KEY
const BASE = 'https://api.themoviedb.org/3'
export const IMG = 'https://image.tmdb.org/t/p'

const api = axios.create({ baseURL: BASE, params: { api_key: KEY, language: 'pt-BR' } })

export const getImgUrl = (path, size = 'w500') =>
  path ? `${IMG}/${size}${path}` : 'https://via.placeholder.com/300x450?text=Sem+Imagem'

// Movies
export const getTrendingMovies = () => api.get('/trending/movie/week')
export const getPopularMovies = () => api.get('/movie/popular')
export const getTopRatedMovies = () => api.get('/movie/top_rated')
export const getNowPlayingMovies = () => api.get('/movie/now_playing')
export const getUpcomingMovies = () => api.get('/movie/upcoming')
export const getMoviesByGenre = (genreId, page = 1) =>
  api.get('/discover/movie', { params: { with_genres: genreId, page, sort_by: 'popularity.desc' } })
export const getMovieDetails = (id) => api.get(`/movie/${id}`, { params: { append_to_response: 'videos,credits,similar' } })

// Series
export const getTrendingSeries = () => api.get('/trending/tv/week')
export const getPopularSeries = () => api.get('/tv/popular')
export const getTopRatedSeries = () => api.get('/tv/top_rated')
export const getAiringToday = () => api.get('/tv/airing_today')
export const getSeriesByGenre = (genreId, page = 1) =>
  api.get('/discover/tv', { params: { with_genres: genreId, page, sort_by: 'popularity.desc' } })
export const getSeriesDetails = (id) => api.get(`/tv/${id}`, { params: { append_to_response: 'videos,credits,similar' } })

// Search
export const searchMulti = (query, page = 1) =>
  api.get('/search/multi', { params: { query, page } })

// Genres
export const getMovieGenres = () => api.get('/genre/movie/list')
export const getTVGenres = () => api.get('/genre/tv/list')
