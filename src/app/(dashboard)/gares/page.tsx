'use client'
import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const couleursBase = [
  'bg-emerald-500','bg-blue-500','bg-amber-500','bg-violet-500',
  'bg-pink-500','bg-orange-500','bg-teal-500','bg-red-500',
  'bg-indigo-500','bg-cyan-500','bg-lime-500','bg-rose-500','bg-sky-500'
]

export default function GaresPage() {
  const supabase = createClient()
  const [gares, setGares] = useState<any[]>([])
  const [nouvelle, setNouvelle] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data } = await supabase.from('gares').select('*').order('nom')
    setGares(data || [])
    setLoading(false)
  }

  async function ajouter() {
    if (!nouvelle.trim()) return
    await supabase.from('gares').insert({ nom: nouvelle.trim() })
    setNouvelle('')
    setShow(false)
    charger()
  }

  async function supprimer(id: string) {
    await supabase.from('gares').delete().eq('id', id)
    charger()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">📍 Gares</h1>
          <p className="text-zinc-500 mt-1">{gares.length} gares du réseau Bon Djoula</p>
        </div>
        <button onClick={() => setShow(!show)}
          className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Ajouter une gare
        </button>
      </div>

      {show && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500">Nom de la gare</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Ex: San Pedro" value={nouvelle}
              onChange={e => setNouvelle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ajouter()} />
          </div>
          <button onClick={ajouter} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Enregistrer</button>
          <button onClick={() => setShow(false)} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm">Annuler</button>
        </div>
      )}

      {loading ? <p className="text-zinc-400 text-sm">Chargement...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gares.map((gare, i) => (
            <div key={gare.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md transition-all hover:-translate-y-1 relative group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${couleursBase[i % couleursBase.length]}`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-zinc-800 text-sm text-center">{gare.nom}</p>
              <button onClick={() => supprimer(gare.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}