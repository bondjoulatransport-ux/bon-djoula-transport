'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Banknote, Fuel } from 'lucide-react'

export default function BilanGlobalPage() {
  const supabase = createClient()
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [recettes, setRecettes] = useState<any[]>([])
  const [carburants, setCarburants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [cherche, setCherche] = useState(false)

  async function charger() {
    if (!dateDebut || !dateFin) return
    setLoading(true)
    setCherche(true)
    const { data: r } = await supabase.from('recettes')
      .select('*, vehicule:vehicules(plaque), gare:gares(nom)')
      .gte('date_recette', dateDebut).lte('date_recette', dateFin)
      .order('date_recette', { ascending: false })
    const { data: c } = await supabase.from('carburants')
      .select('*, vehicule:vehicules(plaque)')
      .gte('date_dep', dateDebut).lte('date_dep', dateFin)
    setRecettes(r || [])
    setCarburants(c || [])
    setLoading(false)
  }

  const total_gare = recettes.reduce((s, r) => s + (r.recette_gare || 0), 0)
  const total_route = recettes.reduce((s, r) => s + (r.recette_route || 0), 0)
  const total_carb = carburants.reduce((s, c) => s + (c.montant || 0), 0)
  const net = total_gare + total_route - total_carb
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a3a2a]">📋 Bilan Global</h1>
        <p className="text-zinc-500 mt-1">Toutes recettes et dépenses sur une période</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-zinc-500">Date début</label>
          <input type="date" className="mt-1 block border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500">Date fin</label>
          <input type="date" className="mt-1 block border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            value={dateFin} onChange={e => setDateFin(e.target.value)} />
        </div>
        <button onClick={charger} disabled={loading}
          className="bg-[#1a3a2a] text-[#f7b731] px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#142e20] disabled:opacity-50">
          {loading ? 'Chargement...' : 'Afficher le bilan'}
        </button>
      </div>

      {cherche && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-blue-600">Recette Gare</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{fmt(total_gare)}</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-violet-600">Recette Route</p>
              <p className="text-xl font-bold text-violet-700 mt-1">{fmt(total_route)}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-red-600">Carburant</p>
              <p className="text-xl font-bold text-red-700 mt-1">{fmt(total_carb)}</p>
            </div>
            <div className={`rounded-2xl p-4 ${net >= 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
              <p className={`text-xs font-medium ${net >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>Bénéfice Net</p>
              <p className={`text-xl font-bold mt-1 ${net >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>{fmt(net)}</p>
            </div>
          </div>

          {recettes.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <p className="font-semibold text-zinc-700 text-sm">Recettes ({recettes.length})</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    {['Date','Véhicule','Gare','Rec. Gare','Rec. Route','Net'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recettes.map(r => (
                    <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-600">{r.date_recette}</td>
                      <td className="px-4 py-3 font-medium">{r.vehicule?.plaque}</td>
                      <td className="px-4 py-3 text-zinc-500">{r.gare?.nom}</td>
                      <td className="px-4 py-3 text-blue-600">{fmt(r.recette_gare)}</td>
                      <td className="px-4 py-3 text-violet-600">{fmt(r.recette_route)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{fmt((r.recette_gare||0)+(r.recette_route||0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {carburants.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-600" />
                <p className="font-semibold text-zinc-700 text-sm">Carburant ({carburants.length})</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    {['Date','Véhicule','Station','Litres','Montant'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {carburants.map(c => (
                    <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-600">{c.date_dep}</td>
                      <td className="px-4 py-3 font-medium">{c.vehicule?.plaque}</td>
                      <td className="px-4 py-3 text-zinc-500">{c.station || '-'}</td>
                      <td className="px-4 py-3 text-blue-600">{c.litres ? c.litres + ' L' : '-'}</td>
                      <td className="px-4 py-3 font-bold text-orange-600">{fmt(c.montant)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recettes.length === 0 && carburants.length === 0 && (
            <p className="text-zinc-400 text-sm text-center py-8">Aucune donnée pour cette période</p>
          )}
        </>
      )}
    </div>
  )
}