import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Navbar({ onResetKey }) {
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
      setSearching(false)
      setQuery('')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#141414] shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo + nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black tracking-tight flex-shrink-0">
            <span className="text-[#E50914]">CINE</span>
            <span className="text-white">STREAM</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {[
              { path: '/', label: 'Início' },
              { path: '/filmes', label: 'Filmes' },
              { path: '/series', label: 'Séries' },
              { path: '/anime', label: 'Anime' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`transition-colors hover:text-white ${
                  isActive(path) ? 'text-white font-semibold' : 'text-gray-300'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          {searching ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar filmes, séries, anime..."
                className="bg-black/80 border border-white/30 text-white text-sm px-3 py-1.5 rounded-l outline-none w-44 md:w-64"
                onBlur={() => !query && setSearching(false)}
              />
              <button
                type="submit"
                className="bg-white/10 border border-white/30 border-l-0 px-3 py-1.5 rounded-r hover:bg-white/20"
              >
                🔍
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearching(true)}
              className="text-gray-300 hover:text-white text-lg transition-colors"
              title="Buscar"
            >
              🔍
            </button>
          )}

          {/* Change TMDB key */}
          {onResetKey && (
            <button
              onClick={onResetKey}
              title="Alterar chave TMDB"
              className="hidden md:flex text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              ⚙
            </button>
          )}

          {/* Mobile nav links */}
          <div className="flex md:hidden gap-3 text-xs font-medium">
            {[
              { path: '/filmes', label: 'Filmes' },
              { path: '/series', label: 'Séries' },
              { path: '/anime', label: 'Anime' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`transition-colors ${
                  isActive(path) ? 'text-white' : 'text-gray-400'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
