'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bus } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect.')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1a3a2a] rounded-full flex items-center justify-center mb-4">
            <Bus className="w-8 h-8 text-[#f7b731]" />
          </div>
          <h1 className="text-xl font-bold text-[#1a3a2a]">Bon Djoula Transport</h1>
          <p className="text-zinc-400 text-sm mt-1">Espace administration</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600">Email</label>
            <input type="email" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-600">Mot de passe</label>
            <input type="password" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full bg-[#1a3a2a] text-[#f7b731] py-2.5 rounded-lg text-sm font-medium hover:bg-[#142e20] disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  )
}