'use client'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CarburantPage() {
  const supabase = createClient()
  const [depenses, setDepenses] = useState<any[]>([])
  const [vehicules, setVehicules] = useState<any[]>([])
  const [form, setForm] = useState({ date_dep: '', vehicule_id: '', montant: '', litres: '', station: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { charger() }, [])

  async function charger() {
    const { data: d } = await supabase.from('carburants').select('*, vehicule:vehicules(plaque)').order('date_dep', { ascending: false })
    const { data: v } = await supabase.from('vehicules').select('*').order('plaque')
    setDepenses(d || [])
    setVehicules(v || [])
    if (v && v.length > 0) setForm(f => ({ ...f, vehicule_id: v[0].id }))
    setLoading(false)
  }

  async function ajouter() {
    if (!form.date_dep || !form.vehicule_id || !form.montant) return
    await supabase.from('carburants').insert({
      date_dep: form.date_dep,
      vehicule_id: form.vehicule_id,
      montant: Number(form.montant),
      litres: Number(form.litres) || null,
      station: form.station || null
    })
    setForm({ date_dep: '', vehicule_id: vehicules[0]?.id || '', montant: '', litres: '', station: '' })
    setShow(false)
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
        <button onClick={() => setShow(!show)} className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
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
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
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
                {['Date','Véhicule','Station','Litres','Montant'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depenses.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-zinc-400 text-center">Aucune dépense — cliquez sur Saisir dépense</td></tr>}
              {depenses.map(d => (
                <tr key={d.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-600">{d.date_dep}</td>
                  <td className="px-4 py-3 font-medium">{d.vehicule?.plaque}</td>
                  <td className="px-4 py-3 text-zinc-500">{d.station || '-'}</td>
                  <td className="px-4 py-3 text-blue-600">{d.litres ? d.litres + ' L' : '-'}</td>
                  <td className="px-4 py-3 font-bold text-orange-600">{fmt(d.montant)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}