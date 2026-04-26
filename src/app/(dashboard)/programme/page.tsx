'use client'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProgrammePage() {
  const supabase = createClient()
  const [programmes, setProgrammes] = useState<any[]>([])
  const [gares, setGares] = useState<any[]>([])
  const [chauffeurs, setChauffeurs] = useState<any[]>([])
  const [vehicules, setVehicules] = useState<any[]>([])
  const [form, setForm] = useState({ date_depart: '', heure_depart: '', chauffeur_id: '', vehicule_id: '', gare_depart_id: '', gare_arrivee_id: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: p } = await supabase.from('programmes').select('*, chauffeur:chauffeurs(nom,prenoms), vehicule:vehicules(plaque), gare_depart:gares!programmes_gare_depart_id_fkey(nom), gare_arrivee:gares!programmes_gare_arrivee_id_fkey(nom)').order('date_depart', { ascending: false })
    const { data: g } = await supabase.from('gares').select('*').order('nom')
    const { data: c } = await supabase.from('chauffeurs').select('*').order('nom')
    const { data: v } = await supabase.from('vehicules').select('*').order('plaque')
    setProgrammes(p || [])
    setGares(g || [])
    setChauffeurs(c || [])
    setVehicules(v || [])
    if (g && g.length > 0) setForm(f => ({ ...f, gare_depart_id: g[0].id, gare_arrivee_id: g[0].id }))
    if (c && c.length > 0) setForm(f => ({ ...f, chauffeur_id: c[0].id }))
    if (v && v.length > 0) setForm(f => ({ ...f, vehicule_id: v[0].id }))
    setLoading(false)
  }

  async function ajouter() {
    if (!form.date_depart || !form.chauffeur_id || !form.vehicule_id) return
    await supabase.from('programmes').insert({
      date_depart: form.date_depart,
      heure_depart: form.heure_depart || null,
      chauffeur_id: form.chauffeur_id,
      vehicule_id: form.vehicule_id,
      gare_depart_id: form.gare_depart_id,
      gare_arrivee_id: form.gare_arrivee_id,
      statut: 'prevu'
    })
    setShow(false)
    charger()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">📅 Programme</h1>
          <p className="text-zinc-500 mt-1">Affectation chauffeurs / véhicules</p>
        </div>
        <button onClick={() => setShow(!show)} className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Programmer
        </button>
      </div>

      {show && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">Date</label>
            <input type="date" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.date_depart} onChange={e => setForm({...form, date_depart: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Heure départ</label>
            <input type="time" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.heure_depart} onChange={e => setForm({...form, heure_depart: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Chauffeur</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.chauffeur_id} onChange={e => setForm({...form, chauffeur_id: e.target.value})}>
              {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.prenoms} {c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Véhicule</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.vehicule_id} onChange={e => setForm({...form, vehicule_id: e.target.value})}>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Gare départ</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.gare_depart_id} onChange={e => setForm({...form, gare_depart_id: e.target.value})}>
              {gares.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Gare arrivée</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.gare_arrivee_id} onChange={e => setForm({...form, gare_arrivee_id: e.target.value})}>
              {gares.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-3">
            <button onClick={ajouter} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Enregistrer</button>
            <button onClick={() => setShow(false)} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-zinc-400 text-sm">Chargement...</p> : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {['Date','Heure','Chauffeur','Véhicule','Départ','Arrivée','Statut'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programmes.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-zinc-400 text-center">Aucun programme — cliquez sur Programmer</td></tr>}
              {programmes.map(p => (
                <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-600">{p.date_depart}</td>
                  <td className="px-4 py-3 text-violet-600 font-medium">{p.heure_depart || '-'}</td>
                  <td className="px-4 py-3 font-medium">{p.chauffeur?.prenoms} {p.chauffeur?.nom}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.vehicule?.plaque}</td>
                  <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">{p.gare_depart?.nom}</span></td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">{p.gare_arrivee?.nom}</span></td>
                  <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs">{p.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}