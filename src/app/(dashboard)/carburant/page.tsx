'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CarburantPage() {
  const supabase = createClient()
  const [depenses, setDepenses] = useState<any[]>([])
  const [vehicules, setVehicules] = useState<any[]>([])
  const [form, setForm] = useState({ date_dep: '', vehicule_id: '', montant: '', litres: '', station: '' })
  const [show, setShow] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: d } = await supabase.from('carburants').select('*, vehicule:vehicules(plaque)').order('date_dep', { ascending: false })
    const { data: v } = await supabase.from('vehicules').select('*').order('plaque')
    setDepenses(d || [])
    setVehicules(v || [])
    if (v && v.length > 0) setForm(f => ({ ...f, vehicule_id: v[0].id }))
    setLoading(false)
  }

  function ouvrirNouveau() {
    setEditId(null)
    setForm({ date_dep: '', vehicule_id: vehicules[0]?.id || '', montant: '', litres: '', station: '' })
    setShow(true)
  }

  function ouvrirEdition(d: any) {
    setEditId(d.id)
    setForm({
      date_dep: d.date_dep,
      vehicule_id: d.vehicule_id,
      montant: String(d.montant || ''),
      litres: String(d.litres || ''),
      station: d.station || ''
    })
    setShow(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function enregistrer() {
    if (!form.date_dep || !form.vehicule_id || !form.montant) return
    if (editId) {
      await supabase.from('carburants').update({
        date_dep: form.date_dep,
        vehicule_id: form.vehicule_id,
        montant: Number(form.montant),
        litres: Number(form.litres) || null,
        station: form.station || null
      }).eq('id', editId)
    } else {
      await supabase.from('carburants').insert({
        date_dep: form.date_dep,
        vehicule_id: form.vehicule_id,
        montant: Number(form.montant),
        litres: Number(form.litres) || null,
        station: form.station || null
      })
    }
    setShow(false)
    setEditId(null)
    charger()
  }

  async function supprimer(id: string) {
    await supabase.from('carburants').delete().eq('id', id)
    setConfirmDelete(null)
    charger()
  }

  const total = depenses.reduce((s, d) => s + (d.montant || 0), 0)
  const totalLitres = depenses.reduce((s, d) => s + (d.litres || 0), 0)
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">⛽ Carburant</h1>
          <p className="text-zinc-500 mt-1">Dépenses carburant par véhicule</p>
        </div>
        <button onClick={ouvrirNouveau} className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Saisir dépense
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-orange-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-orange-600">Total dépenses</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{fmt(total)}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-blue-600">Total litres</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{totalLitres} L</p>
        </div>
      </div>

      {show && (
        <div className="bg-white border-2 border-[#1a3a2a] rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 mb-1">
            <h2 className="text-base font-bold text-[#1a3a2a]">
              {editId ? '✏️ Modifier la dépense' : '➕ Nouvelle dépense'}
            </h2>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Date</label>
            <input type="date" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.date_dep} onChange={e => setForm({...form, date_dep: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Véhicule</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.vehicule_id} onChange={e => setForm({...form, vehicule_id: e.target.value})}>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Montant (F CFA)</label>
            <input type="number" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Litres</label>
            <input type="number" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" value={form.litres} onChange={e => setForm({...form, litres: e.target.value})} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-zinc-500">Station</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm" placeholder="Total Abidjan" value={form.station} onChange={e => setForm({...form, station: e.target.value})} />
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
            <p className="text-zinc-500 text-sm mb-5">Cette dépense carburant sera définitivement supprimée.</p>
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
                {['Date','Véhicule','Station','Litres','Montant','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depenses.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-zinc-400 text-center">Aucune dépense — cliquez sur Saisir dépense</td></tr>}
              {depenses.map(d => (
                <tr key={d.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-600">{d.date_dep}</td>
                  <td className="px-4 py-3 font-medium">{d.vehicule?.plaque}</td>
                  <td className="px-4 py-3 text-zinc-500">{d.station || '-'}</td>
                  <td className="px-4 py-3 text-blue-600">{d.litres ? d.litres + ' L' : '-'}</td>
                  <td className="px-4 py-3 font-bold text-orange-600">{fmt(d.montant)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => ouvrirEdition(d)} className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50" title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(d.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Supprimer">
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
