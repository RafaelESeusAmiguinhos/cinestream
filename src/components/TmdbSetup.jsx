import { useState } from 'react'
import { validateTmdbKey } from '../api/tmdb'

export default function TmdbSetup({ onSuccess }) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!key.trim()) return
    setLoading(true)
    setError('')
    const valid = await validateTmdbKey(key.trim())
    if (valid) {
      localStorage.setItem('tmdb_key', key.trim())
      onSuccess()
    } else {
      setError('Chave inválida. Verifique e tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* TMDB logo */}
        <div className="w-16 h-16 bg-[#01b4e4] rounded-full flex items-center justify-center mx-auto mb-5 text-3xl font-black text-white">
          T
        </div>

        <h2 className="text-white text-2xl font-bold mb-2">Configure a API TMDB</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Para carregar filmes e séries, você precisa de uma chave <strong className="text-white">gratuita</strong> da TMDB.
        </p>

        {/* Steps */}
        <ol className="text-left text-sm text-gray-300 space-y-2 mb-6 bg-white/5 rounded-xl p-4">
          <li>
            <span className="text-[#E50914] font-bold">1.</span> Acesse{' '}
            <a
              href="https://www.themoviedb.org/signup"
              target="_blank"
              rel="noreferrer"
              className="text-[#01b4e4] underline hover:text-blue-300"
            >
              themoviedb.org/signup
            </a>{' '}
            e crie uma conta gratuita
          </li>
          <li>
            <span className="text-[#E50914] font-bold">2.</span> Vá em{' '}
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="text-[#01b4e4] underline hover:text-blue-300"
            >
              Configurações → API
            </a>
          </li>
          <li>
            <span className="text-[#E50914] font-bold">3.</span> Clique em <strong className="text-white">Criar → Uso pessoal</strong> e copie a <strong className="text-white">API Key (v3 auth)</strong>
          </li>
          <li>
            <span className="text-[#E50914] font-bold">4.</span> Cole a chave abaixo
          </li>
        </ol>

        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Cole sua API Key aqui..."
          className="w-full bg-black/40 border border-white/20 text-white px-4 py-3 rounded-lg text-sm outline-none focus:border-[#E50914] transition-colors mb-3"
        />

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={loading || !key.trim()}
          className="w-full bg-[#E50914] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
        >
          {loading ? 'Validando...' : 'Salvar e Continuar'}
        </button>

        <p className="text-gray-600 text-xs mt-4">A chave é salva no navegador. Anime funciona sem ela.</p>
      </div>
    </div>
  )
}
