'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Pencil, Mail } from 'lucide-react'

interface Courrier {
  id: string
  date_courrier: string
  gare_id: string | null
  montant: number
  gare?: { nom: string }
}
interface Gare { id: string; nom: string }

export default function CourriersPage() {
  const supabase = createClient()
  const [courriers, setCourriers] = useState<Courrier[]>([])
  const [gares, setGares] = useState<Gare[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [form, setForm] = useState({ date_courrier: new Date().toISOString().split('T')[0], gare_id: '', montant: '' })

  useEffect(() => { charger() }, [])

  async function charger(debut?: string, fin?: string) {
    let q = supabase.from('courriers').select('*, gare:gares(nom)').order('date_courrier', { ascending: false })
    if (debut) q = q.gte('date_courrier', debut)
    if (fin) q = q.lte('date_courrier', fin)
    const [{ data: c }, { data: g }] = await Promise.all([q, supabase.from('gares').select('id, nom').order('nom')])
    setCourriers(c || [])
    setGares(g || [])
    setLoading(false)
  }

  async function sauvegarder() {
    if (!form.montant) return
    setSaving(true)
    const payload = { date_courrier: form.date_courrier, gare_id: form.gare_id || null, montant: parseInt(form.montant) || 0 }
    if (editId) await supabase.from('courriers').update(payload).eq('id', editId)
    else await supabase.from('courriers').insert(payload)
    setForm({ date_courrier: new Date().toISOString().split('T')[0], gare_id: '', montant: '' })
    setShowForm(false); setEditId(null); setSaving(false); charger(dateDebut, dateFin)
  }

  function editer(c: Courrier) {
    setForm({ date_courrier: c.date_courrier, gare_id: c.gare_id || '', montant: String(c.montant) })
    setEditId(c.id); setShowForm(true)
  }

  async function supprimer(id: string) {
    if (!confirm('Supprimer ce courrier ?')) return
    await supabase.from('courriers').delete().eq('id', id); charger(dateDebut, dateFin)
  }

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F'
  const total = courriers.reduce((s, c) => s + c.montant, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a] flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500" /> Courriers
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Recettes journalières — service courriers</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ date_courrier: new Date().toISOString().split('T')[0], gare_id: '', montant: '' }) }}
          className="flex items-center gap-2 bg-[#1a3a2a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2a5a3a] transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Filtre */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-6 flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1 block">Date début</label>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a2a]" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-1 block">Date fin</label>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
            className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a2a]" />
        </div>
        <button onClick={() => charger(dateDebut, dateFin)}
          className="bg-[#1a3a2a] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2a5a3a]">Filtrer</button>
        <button onClick={() => { setDateDebut(''); setDateFin(''); charger() }}
          className="border border-zinc-200 text-zinc-500 px-4 py-2 rounded-xl text-sm hover:bg-zinc-50">Tout afficher</button>
        <div className="ml-auto bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-blue-400 font-medium">Total période</p>
          <p className="text-lg font-bold text-blue-600">{fmt(total)}</p>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-zinc-700 text-sm mb-4">{editId ? 'Modifier le courrier' : 'Nouveau courrier'}</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1 block">Date</label>
              <input type="date" value={form.date_courrier} onChange={e => setForm({ ...form, date_courrier: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a2a]" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1 block">Gare</label>
              <select value={form.gare_id} onChange={e => setForm({ ...form, gare_id: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a2a] bg-white">
                <option value="">— Choisir —</option>
                {gares.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 font-medium mb-1 block">Montant (F)</label>
              <input type="number" placeholder="0" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a2a]" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={sauvegarder} disabled={saving || !form.montant}
              className="flex-1 bg-[#1a3a2a] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2a5a3a] disabled:opacity-50">
              {saving ? 'Enregistrement...' : editId ? 'Modifier' : 'Enregistrer'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-500 hover:bg-zinc-50">Annuler</button>
          </div>
        </div>
      )}

      {/* Tableau */}
      {loading ? <p className="text-zinc-400 text-sm">Chargement...</p> : courriers.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
          <Mail className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Aucun courrier enregistré</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>{['Date', 'Gare', 'Montant', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {courriers.map(c => (
                <tr key={c.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 text-zinc-500">{new Date(c.date_courrier).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">{c.gare?.nom || <span className="text-zinc-300">—</span>}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{fmt(c.montant)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => editer(c)} className="text-zinc-300 hover:text-blue-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => supprimer(c.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-zinc-50 border-t-2 border-zinc-200">
              <tr>
                <td className="px-4 py-3 text-xs font-semibold text-zinc-500" colSpan={2}>TOTAL</td>
                <td className="px-4 py-3 font-bold text-blue-600">{fmt(total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
