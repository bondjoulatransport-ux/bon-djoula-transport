'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProgrammePage() {
  const supabase = createClient()
  const [programmes, setProgrammes] = useState<any[]>([])
  const [gares, setGares] = useState<any[]>([])
  const [chauffeurs, setChauffeurs] = useState<any[]>([])
  const [vehicules, setVehicules] = useState<any[]>([])
  const [form, setForm] = useState({ date_prog: '', heure_depart: '', chauffeur_id: '', vehicule_id: '', gare_depart: '', gare_arrivee: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: p } = await supabase
      .from('programmes')
      .select('*, chauffeur:chauffeurs(nom,prenoms), vehicule:vehicules(plaque), gare_dep:gares!programmes_gare_depart_fkey(nom), gare_arr:gares!programmes_gare_arrivee_fkey(nom)')
      .order('date_prog', { ascending: false })
    const { data: g } = await supabase.from('gares').select('*').order('nom')
    const { data: c } = await supabase.from('chauffeurs').select('*').order('nom')
    const { data: v } = await supabase.from('vehicules').select('*').order('plaque')
    setProgrammes(p || [])
    setGares(g || [])
    setChauffeurs(c || [])
    setVehicules(v || [])

    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)

    setForm({
      date_prog: today,
      heure_depart: now,
      chauffeur_id: c?.[0]?.id || '',
      vehicule_id: v?.[0]?.id || '',
      gare_depart: g?.[0]?.id || '',
      gare_arrivee: g?.[1]?.id || g?.[0]?.id || '',
    })
    setLoading(false)
  }

  async function ajouter() {
    setErreur('')
    if (!form.date_prog) { setErreur('Veuillez choisir une date'); return }
    if (!form.chauffeur_id) { setErreur('Veuillez choisir un chauffeur'); return }
    if (!form.vehicule_id) { setErreur('Veuillez choisir un véhicule'); return }

    setSaving(true)
    const { error } = await supabase.from('programmes').insert({
      date_prog: form.date_prog,
      heure_depart: form.heure_depart || null,
      chauffeur_id: form.chauffeur_id,
      vehicule_id: form.vehicule_id,
      gare_depart: form.gare_depart || null,
      gare_arrivee: form.gare_arrivee || null,
    })
    setSaving(false)

    if (error) {
      setErreur('Erreur : ' + error.message)
      return
    }
    setShow(false)
    charger()
  }

  async function supprimer(id: string) {
    await supabase.from('programmes').delete().eq('id', id)
    charger()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">📅 Programme</h1>
          <p className="text-zinc-500 mt-1">Affectation chauffeurs / véhicules</p>
        </div>
        <button onClick={() => { setShow(!show); setErreur('') }}
          className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Programmer
        </button>
      </div>

      {show && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">Date</label>
            <input type="date" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.date_prog} onChange={e => setForm({...form, date_prog: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Heure départ</label>
            <input type="time" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.heure_depart} onChange={e => setForm({...form, heure_depart: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Chauffeur</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.chauffeur_id} onChange={e => setForm({...form, chauffeur_id: e.target.value})}>
              {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.prenoms} {c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Véhicule</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.vehicule_id} onChange={e => setForm({...form, vehicule_id: e.target.value})}>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Gare départ</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.gare_depart} onChange={e => setForm({...form, gare_depart: e.target.value})}>
              {gares.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Gare arrivée</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.gare_arrivee} onChange={e => setForm({...form, gare_arrivee: e.target.value})}>
              {gares.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
          </div>

          {erreur && (
            <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              ⚠️ {erreur}
            </div>
          )}

          <div className="col-span-2 flex gap-3">
            <button onClick={ajouter} disabled={saving}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => { setShow(false); setErreur('') }}
              className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-zinc-400 text-sm">Chargement...</p> : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {['Date','Heure','Chauffeur','Véhicule','Départ','Arrivée',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programmes.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-zinc-400 text-center">Aucun programme — cliquez sur Programmer</td></tr>
              )}
              {programmes.map(p => (
                <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50 group">
                  <td className="px-4 py-3 text-zinc-600">{p.date_prog}</td>
                  <td className="px-4 py-3 text-violet-600 font-medium">{p.heure_depart || '-'}</td>
                  <td className="px-4 py-3 font-medium">{p.chauffeur?.prenoms} {p.chauffeur?.nom}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.vehicule?.plaque}</td>
                  <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">{p.gare_dep?.nom}</span></td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">{p.gare_arr?.nom}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => supprimer(p.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}