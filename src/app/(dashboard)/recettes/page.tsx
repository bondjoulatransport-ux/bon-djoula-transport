'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RecettesPage() {
  const supabase = createClient()
  const [recettes, setRecettes] = useState<any[]>([])
  const [gares, setGares] = useState<any[]>([])
  const [vehicules, setVehicules] = useState<any[]>([])
  const [chauffeurs, setChauffeurs] = useState<any[]>([])
  const [form, setForm] = useState({
    date_recette: '',
    vehicule_id: '',
    chauffeur_id: '',
    gare_id: '',
    recette_gare: '',
    recette_route: ''
  })
  const [show, setShow] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: r } = await supabase
      .from('recettes')
      .select('*, vehicule:vehicules(plaque), gare:gares(nom), chauffeur:chauffeurs(nom, prenoms)')
      .order('date_recette', { ascending: false })
    const { data: g } = await supabase.from('gares').select('*').order('nom')
    const { data: v } = await supabase.from('vehicules').select('*').order('plaque')
    const { data: c } = await supabase.from('chauffeurs').select('*').order('nom')
    setRecettes(r || [])
    setGares(g || [])
    setVehicules(v || [])
    setChauffeurs(c || [])
    setForm(f => ({
      ...f,
      gare_id: g?.[0]?.id || '',
      vehicule_id: v?.[0]?.id || '',
      chauffeur_id: c?.[0]?.id || ''
    }))
    setLoading(false)
  }

  function ouvrirNouveau() {
    setEditId(null)
    setForm({
      date_recette: '',
      vehicule_id: vehicules[0]?.id || '',
      chauffeur_id: chauffeurs[0]?.id || '',
      gare_id: gares[0]?.id || '',
      recette_gare: '',
      recette_route: ''
    })
    setShow(true)
  }

  function ouvrirEdition(r: any) {
    setEditId(r.id)
    setForm({
      date_recette: r.date_recette,
      vehicule_id: r.vehicule_id,
      chauffeur_id: r.chauffeur_id || '',
      gare_id: r.gare_id,
      recette_gare: String(r.recette_gare || ''),
      recette_route: String(r.recette_route || '')
    })
    setShow(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function enregistrer() {
    if (!form.date_recette || !form.vehicule_id) return
    if (editId) {
      await supabase.from('recettes').update({
        date_recette: form.date_recette,
        vehicule_id: form.vehicule_id,
        chauffeur_id: form.chauffeur_id || null,
        gare_id: form.gare_id,
        recette_gare: Number(form.recette_gare) || 0,
        recette_route: Number(form.recette_route) || 0,
      }).eq('id', editId)
    } else {
      await supabase.from('recettes').insert({
        date_recette: form.date_recette,
        vehicule_id: form.vehicule_id,
        chauffeur_id: form.chauffeur_id || null,
        gare_id: form.gare_id,
        recette_gare: Number(form.recette_gare) || 0,
        recette_route: Number(form.recette_route) || 0,
        nb_passagers: 0
      })
    }
    setShow(false)
    setEditId(null)
    charger()
  }

  async function supprimer(id: string) {
    await supabase.from('recettes').delete().eq('id', id)
    setConfirmDelete(null)
    charger()
  }

  const total_gare = recettes.reduce((s, r) => s + (r.recette_gare || 0), 0)
  const total_route = recettes.reduce((s, r) => s + (r.recette_route || 0), 0)
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">💰 Recettes</h1>
          <p className="text-zinc-500 mt-1">Suivi journalier des recettes</p>
        </div>
        <button onClick={ouvrirNouveau} className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Saisir recette
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-blue-600">Total Recette Gare</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{fmt(total_gare)}</p>
        </div>
        <div className="bg-violet-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-violet-600">Total Recette Route</p>
          <p className="text-2xl font-bold text-violet-700 mt-1">{fmt(total_route)}</p>
        </div>
      </div>

      {show && (
        <div className="bg-white border-2 border-[#1a3a2a] rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 mb-1">
            <h2 className="text-base font-bold text-[#1a3a2a]">
              {editId ? '✏️ Modifier la recette' : '➕ Nouvelle recette'}
            </h2>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Date</label>
            <input type="date" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.date_recette} onChange={e => setForm({...form, date_recette: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Véhicule</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.vehicule_id} onChange={e => setForm({...form, vehicule_id: e.target.value})}>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Chauffeur</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.chauffeur_id} onChange={e => setForm({...form, chauffeur_id: e.target.value})}>
              {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.prenoms} {c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Gare</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.gare_id} onChange={e => setForm({...form, gare_id: e.target.value})}>
              {gares.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Recette Gare (F CFA)</label>
            <input type="number" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.recette_gare} onChange={e => setForm({...form, recette_gare: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Recette Route (F CFA)</label>
            <input type="number" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.recette_route} onChange={e => setForm({...form, recette_route: e.target.value})} />
          </div>
          <div className="col-span-2 flex gap-3">
            <button onClick={enregistrer} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {editId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button onClick={() => { setShow(false); setEditId(null) }} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-bold text-zinc-800 text-lg mb-2">Confirmer la suppression</h3>
            <p className="text-zinc-500 text-sm mb-5">Cette recette sera définitivement supprimée. Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => supprimer(confirmDelete)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex-1">Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className="text-zinc-400 text-sm">Chargement...</p> : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                {['Date', 'Véhicule', 'Chauffeur', 'Gare', 'Rec. Gare', 'Rec. Route', 'Net', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recettes.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-6 text-zinc-400 text-center">Aucune recette — cliquez sur Saisir recette</td></tr>
              )}
              {recettes.map(r => (
                <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-600">{r.date_recette}</td>
                  <td className="px-4 py-3 font-medium">{r.vehicule?.plaque}</td>
                  <td className="px-4 py-3 text-zinc-600">{r.chauffeur ? `${r.chauffeur.prenoms} ${r.chauffeur.nom}` : '—'}</td>
                  <td className="px-4 py-3 text-zinc-600">{r.gare?.nom}</td>
                  <td className="px-4 py-3 text-blue-600">{fmt(r.recette_gare)}</td>
                  <td className="px-4 py-3 text-violet-600">{fmt(r.recette_route)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{fmt(r.recette_gare + r.recette_route)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => ouvrirEdition(r)} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(r.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
