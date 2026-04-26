'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ChauffeursPage() {
  const supabase = createClient()
  const [chauffeurs, setChauffeurs] = useState<any[]>([])
  const [gares, setGares] = useState<any[]>([])
  const [form, setForm] = useState({ nom: '', prenoms: '', contact: '', gare_id: '', statut: 'actif' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: c } = await supabase.from('chauffeurs').select('*, gare:gares(nom)').order('nom')
    const { data: g } = await supabase.from('gares').select('*').order('nom')
    setChauffeurs(c || [])
    setGares(g || [])
    if (g && g.length > 0) setForm(f => ({ ...f, gare_id: g[0].id }))
    setLoading(false)
  }

  async function ajouter() {
    if (!form.nom || !form.prenoms) return
    await supabase.from('chauffeurs').insert({ nom: form.nom, prenoms: form.prenoms, contact: form.contact, gare_id: form.gare_id, statut: form.statut })
    setForm({ nom: '', prenoms: '', contact: '', gare_id: gares[0]?.id || '', statut: 'actif' })
    setShow(false)
    charger()
  }

  async function supprimer(id: string) {
    await supabase.from('chauffeurs').delete().eq('id', id)
    charger()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">👤 Chauffeurs</h1>
          <p className="text-zinc-500 mt-1">{chauffeurs.length} chauffeur(s) enregistré(s)</p>
        </div>
        <button onClick={() => setShow(!show)} className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>
      {show && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">Nom</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="Koné" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Prénoms</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="Mamadou" value={form.prenoms} onChange={e => setForm({...form, prenoms: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Contact</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="07 00 00 00" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
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
          {chauffeurs.length === 0 && <p className="text-zinc-400 text-sm col-span-3">Aucun chauffeur — cliquez sur Ajouter</p>}
          {chauffeurs.map(c => (
            <div key={c.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-lg">{c.nom[0]}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700">{c.statut}</span>
              </div>
              <p className="font-bold text-zinc-800">{c.prenoms} {c.nom}</p>
              <p className="text-sm text-zinc-500">{c.gare?.nom}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Phone className="w-3 h-3" />{c.contact || 'Non renseigné'}
                </span>
                <button onClick={() => supprimer(c.id)} className="text-red-400 hover:text-red-600">
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