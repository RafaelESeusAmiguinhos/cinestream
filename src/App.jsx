import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import TmdbSetup from './components/TmdbSetup'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Series from './pages/Series'
import Anime from './pages/Anime'
import Search from './pages/Search'
import { getTmdbKey, validateTmdbKey } from './api/tmdb'

export default function App() {
  // null = verificando, false = sem chave válida, true = pronto
  const [keyStatus, setKeyStatus] = useState(null)

  useEffect(() => {
    const check = async () => {
      const key = getTmdbKey()
      if (!key) { setKeyStatus(false); return }
      const valid = await validateTmdbKey(key)
      if (!valid) localStorage.removeItem('tmdb_key')
      setKeyStatus(valid)
    }
    check()
  }, [])

  const handleKeySuccess = () => setKeyStatus(true)
  const handleResetKey = () => { localStorage.removeItem('tmdb_key'); setKeyStatus(false) }
  const handleSkip = () => setKeyStatus('anime-only')

  if (keyStatus === null) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (keyStatus === false) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#141414]/90 backdrop-blur-sm border-b border-white/5 px-6 h-16 flex items-center">
          <span className="text-2xl font-black">
            <span className="text-[#E50914]">CINE</span><span className="text-white">STREAM</span>
          </span>
        </div>
        <div className="pt-20">
          <TmdbSetup onSuccess={handleKeySuccess} />
          <div className="text-center pb-10">
            <button onClick={handleSkip} className="text-gray-500 hover:text-gray-300 text-sm transition-colors underline">
              Pular — só quero ver anime por agora
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#141414]">
        <Navbar onResetKey={keyStatus !== 'anime-only' ? handleResetKey : undefined} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/filmes" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/buscar" element={<Search />} />
          </Routes>
        </main>
        <footer className="text-center text-gray-600 text-xs py-8 mt-8 border-t border-white/5">
          <p>
            <span className="text-[#E50914] font-bold">CINESTREAM</span>
            {' · '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="hover:text-gray-400 underline">TMDB</a>
            {' · '}
            <a href="https://jikan.moe" target="_blank" rel="noreferrer" className="hover:text-gray-400 underline">Jikan/MAL</a>
            {' · Streaming: '}
            <a href="https://vidsrc.to" target="_blank" rel="noreferrer" className="hover:text-gray-400 underline">VidSrc</a>
            {' · '}
            <a href="https://gogoanime.cl" target="_blank" rel="noreferrer" className="hover:text-gray-400 underline">Gogoanime</a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  )
}
