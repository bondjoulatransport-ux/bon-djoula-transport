'use client'
import { useState, useEffect } from 'react'
import { Bus, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VehiculesPage() {
  const supabase = createClient()
  const [vehicules, setVehicules] = useState<any[]>([])
  const [gares, setGares] = useState<any[]>([])
  const [form, setForm] = useState({ plaque: '', modele: '', nb_places: '', gare_id: '', statut: 'actif' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: v } = await supabase.from('vehicules').select('*, gare:gares(nom)').order('plaque')
    const { data: g } = await supabase.from('gares').select('*').order('nom')
    setVehicules(v || [])
    setGares(g || [])
    if (g && g.length > 0) setForm(f => ({ ...f, gare_id: g[0].id }))
    setLoading(false)
  }

  async function ajouter() {
    if (!form.plaque || !form.modele || !form.nb_places) return
    await supabase.from('vehicules').insert({ plaque: form.plaque, modele: form.modele, nb_places: Number(form.nb_places), gare_id: form.gare_id, statut: form.statut })
    setForm({ plaque: '', modele: '', nb_places: '', gare_id: gares[0]?.id || '', statut: 'actif' })
    setShow(false)
    charger()
  }

  async function supprimer(id: string) {
    await supabase.from('vehicules').delete().eq('id', id)
    charger()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">🚌 Véhicules</h1>
          <p className="text-zinc-500 mt-1">{vehicules.length} véhicule(s) dans la flotte</p>
        </div>
        <button onClick={() => setShow(!show)} className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {show && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">Plaque</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="AB 1234 CI" value={form.plaque} onChange={e => setForm({...form, plaque: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Modèle</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="Mercedes Sprinter" value={form.modele} onChange={e => setForm({...form, modele: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Nb places</label>
            <input type="number" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="18" value={form.nb_places} onChange={e => setForm({...form, nb_places: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Gare</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.gare_id} onChange={e => setForm({...form, gare_id: e.target.value})}>
              {gares.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-3">
            <button onClick={ajouter} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Enregistrer</button>
            <button onClick={() => setShow(false)} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </div>
      )}
      {loading ? (
        <p className="text-zinc-400 text-sm">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicules.length === 0 && <p className="text-zinc-400 text-sm col-span-3">Aucun véhicule — cliquez sur Ajouter</p>}
          {vehicules.map(v => (
            <div key={v.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Bus className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">{v.statut}</span>
              </div>
              <p className="font-bold text-zinc-800">{v.plaque}</p>
              <p className="text-sm text-zinc-500">{v.modele}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                <span className="text-xs text-zinc-400">{v.nb_places} places • {v.gare?.nom}</span>
                <button onClick={() => supprimer(v.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}