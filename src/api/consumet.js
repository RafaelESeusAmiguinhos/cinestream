import axios from 'axios'

// Consumet public instance — free, may be slow on first request (cold start ~30s)
const BASE = 'https://consumet-api.onrender.com'
const api = axios.create({ baseURL: BASE, timeout: 45000 })

export const searchGogoanime = (title) =>
  api.get(`/anime/gogoanime/${encodeURIComponent(title)}`)

export const getGogoanimeInfo = (id) =>
  api.get(`/anime/gogoanime/info/${encodeURIComponent(id)}`)

export const watchGogoanime = (episodeId) =>
  api.get(`/anime/gogoanime/watch/${encodeURIComponent(episodeId)}`)
