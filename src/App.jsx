import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import Series from './pages/Series'
import Anime from './pages/Anime'
import Search from './pages/Search'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
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
          <p className="mb-1">
            <span className="text-[#E50914] font-bold">CINESTREAM</span> — Dados fornecidos por{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer" className="hover:text-gray-400 underline">TMDB</a>
            {' '}e{' '}
            <a href="https://jikan.moe" target="_blank" rel="noreferrer" className="hover:text-gray-400 underline">Jikan/MAL</a>
          </p>
          <p>Este produto usa a API TMDB mas não é endossado ou certificado pela TMDB.</p>
        </footer>
      </div>
    </BrowserRouter>
  )
}
