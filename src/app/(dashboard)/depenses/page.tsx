'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'

export default function DepensesPage() {
  const supabase = createClient()
  const [depenses, setDepenses] = useState<any[]>([])
  const [vehicules, setVehicules] = useState<any[]>([])
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string|null>(null)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [form, setForm] = useState({
    date_depense: new Date().toISOString().split('T')[0],
    vehicule_id: '',
    designation: '',
    montant: '',
    montant_avance: ''
  })

  useEffect(() => { charger() }, [])

  async function charger(dd?: string, df?: string) {
    let query = supabase
      .from('depenses')
      .select('*, vehicule:vehicules(plaque)')
      .order('date_depense', { ascending: false })
    if (dd) query = query.gte('date_depense', dd)
    if (df) query = query.lte('date_depense', df)
    const { data: d } = await query
    const { data: v } = await supabase.from('vehicules').select('*').order('plaque')
    setDepenses(d || [])
    setVehicules(v || [])
    setLoading(false)
  }

  async function ajouter() {
    if (!form.designation || !form.montant) return
    await supabase.from('depenses').insert({
      date_depense: form.date_depense,
      vehicule_id: form.vehicule_id || null,
      designation: form.designation,
      montant: Number(form.montant),
      montant_avance: Number(form.montant_avance || 0)
    })
    resetForm()
    charger(dateDebut, dateFin)
  }

  async function modifier(id: string) {
    await supabase.from('depenses').update({
      date_depense: form.date_depense,
      vehicule_id: form.vehicule_id || null,
      designation: form.designation,
      montant: Number(form.montant),
      montant_avance: Number(form.montant_avance || 0)
    }).eq('id', id)
    setEditId(null)
    resetForm()
    charger(dateDebut, dateFin)
  }

  async function supprimer(id: string) {
    await supabase.from('depenses').delete().eq('id', id)
    charger(dateDebut, dateFin)
  }

  function startEdit(d: any) {
    setEditId(d.id)
    setForm({
      date_depense: d.date_depense,
      vehicule_id: d.vehicule_id || '',
      designation: d.designation,
      montant: String(d.montant),
      montant_avance: String(d.montant_avance)
    })
  }

  function resetForm() {
    setForm({
      date_depense: new Date().toISOString().split('T')[0],
      vehicule_id: '',
      designation: '',
      montant: '',
      montant_avance: ''
    })
    setShow(false)
    setEditId(null)
  }

  const total_depenses = depenses.reduce((s, d) => s + (d.montant || 0), 0)
  const total_avance = depenses.reduce((s, d) => s + (d.montant_avance || 0), 0)
  const total_reste = depenses.reduce((s, d) => s + (d.reste_a_payer || 0), 0)
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">💰 Depenses</h1>
          <p className="text-zinc-500 mt-1">{depenses.length} depense(s)</p>
        </div>
        <button onClick={() => { resetForm(); setShow(!show) }}
          className="flex items-center gap-2 bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#142e20]">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Filtre dates */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-zinc-500">Date debut</label>
          <input type="date" className="mt-1 block border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Date fin</label>
          <input type="date" className="mt-1 block border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={dateFin} onChange={e => setDateFin(e.target.value)} />
        </div>
        <button onClick={() => charger(dateDebut, dateFin)}
          className="bg-[#1a3a2a] text-[#f7b731] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#142e20]">
          Filtrer
        </button>
        <button onClick={() => { setDateDebut(''); setDateFin(''); charger() }}
          className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg text-sm">
          Tout afficher
        </button>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-red-600">Total Depenses</p>
          <p className="text-xl font-bold text-red-700 mt-1">{fmt(total_depenses)}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-emerald-600">Total Avance</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{fmt(total_avance)}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-orange-600">Total Reste a Payer</p>
          <p className="text-xl font-bold text-orange-700 mt-1">{fmt(total_reste)}</p>
        </div>
      </div>

      {/* Formulaire ajout */}
      {show && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">Date</label>
            <input type="date" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.date_depense} onChange={e => setForm({...form, date_depense: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Vehicule</label>
            <select className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              value={form.vehicule_id} onChange={e => setForm({...form, vehicule_id: e.target.value})}>
              <option value="">-- Aucun --</option>
              {vehicules.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-zinc-500">Designation (objet achete)</label>
            <input className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Ex: Pneus avant, Huile moteur..."
              value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Montant total (F)</label>
            <input type="number" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="0"
              value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Montant avance (F)</label>
            <input type="number" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
              placeholder="0"
              value={form.montant_avance} onChange={e => setForm({...form, montant_avance: e.target.value})} />
          </div>
          <div className="col-span-2 flex gap-3">
            <button onClick={ajouter} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Enregistrer</button>
            <button onClick={resetForm} className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </div>
      )}

      {/* Tableau */}
      {loading ? <p className="text-zinc-400 text-sm">Chargement...</p> : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          {depenses.length === 0 ? (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune depense</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {['Date','Vehicule','Designation','Montant','Avance','Reste a Payer',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {depenses.map(d => (
                  <tr key={d.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    {editId === d.id ? (
                      <>
                        <td className="px-2 py-2"><input type="date" className="border rounded px-2 py-1 text-xs w-full" value={form.date_depense} onChange={e => setForm({...form, date_depense: e.target.value})} /></td>
                        <td className="px-2 py-2">
                          <select className="border rounded px-2 py-1 text-xs w-full" value={form.vehicule_id} onChange={e => setForm({...form, vehicule_id: e.target.value})}>
                            <option value="">--</option>
                            {vehicules.map(v => <option key={v.id} value={v.id}>{v.plaque}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2"><input className="border rounded px-2 py-1 text-xs w-full" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></td>
                        <td className="px-2 py-2"><input type="number" className="border rounded px-2 py-1 text-xs w-24" value={form.montant} onChange={e => setForm({...form, montant: e.target.value})} /></td>
                        <td className="px-2 py-2"><input type="number" className="border rounded px-2 py-1 text-xs w-24" value={form.montant_avance} onChange={e => setForm({...form, montant_avance: e.target.value})} /></td>
                        <td className="px-4 py-2 text-zinc-400 text-xs">auto</td>
                        <td className="px-2 py-2 flex gap-2">
                          <button onClick={() => modifier(d.id)} className="text-emerald-600 hover:text-emerald-800"><Check className="w-4 h-4" /></button>
                          <button onClick={resetForm} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-zinc-600">{d.date_depense}</td>
                        <td className="px-4 py-3 font-medium">{d.vehicule?.plaque || '—'}</td>
                        <td className="px-4 py-3 text-zinc-700">{d.designation}</td>
                        <td className="px-4 py-3 font-bold text-red-600">{fmt(d.montant)}</td>
                        <td className="px-4 py-3 text-emerald-600">{fmt(d.montant_avance)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${d.reste_a_payer > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {fmt(d.reste_a_payer)}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => startEdit(d)} className="text-blue-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => supprimer(d.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}