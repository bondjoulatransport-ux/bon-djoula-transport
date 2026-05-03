'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function BilanVehiculePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [vehicule, setVehicule] = useState<any>(null)
  const [recettes, setRecettes] = useState<any[]>([])
  const [cherche, setCherche] = useState(false)
  const [loading, setLoading] = useState(false)

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const fmt2 = (d: Date) => d.toISOString().split('T')[0]
  const [dateDebut, setDateDebut] = useState(fmt2(firstDay))
  const [dateFin, setDateFin] = useState(fmt2(today))

  useEffect(() => {
    supabase.from('vehicules').select('*, gare:gares(nom)').eq('id', id).single()
      .then(({ data }) => setVehicule(data))
    charger(fmt2(firstDay), fmt2(today))
  }, [id])

  async function charger(debut?: string, fin?: string) {
    const d = debut || dateDebut
    const f = fin || dateFin
    if (!d || !f) return
    setLoading(true)
    setCherche(true)
    const { data } = await supabase.rpc('get_recettes_par_vehicule', {
      p_vehicule_id: id,
      p_debut: d,
      p_fin: f
    })
    setRecettes(data || [])
    setLoading(false)
  }

  const total_gare = recettes.reduce((s, r) => s + (r.recette_gare || 0), 0)
  const total_route = recettes.reduce((s, r) => s + (r.recette_route || 0), 0)
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vehicules" className="text-zinc-400 hover:text-zinc-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1a3a2a]">🚌 {vehicule?.plaque || 'Chargement...'}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{vehicule?.gare?.nom} — Bilan périodique</p>
        </div>
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
        <button onClick={() => charger()} disabled={loading}
          className="bg-[#1a3a2a] text-[#f7b731] px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#142e20] disabled:opacity-50">
          {loading ? 'Chargement...' : 'Afficher le bilan'}
        </button>
      </div>

      {recettes.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-blue-600">Recette Gare</p>
              <p className="text-xl font-bold text-blue-700 mt-1">{fmt(total_gare)}</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-violet-600">Recette Route</p>
              <p className="text-xl font-bold text-violet-700 mt-1">{fmt(total_route)}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4">
              <p className="text-xs font-medium text-emerald-600">Total Net</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{fmt(total_gare + total_route)}</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  {['Date','Chauffeur','Gare','Rec. Gare','Rec. Route','Net'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recettes.map(r => (
                  <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-600">{r.date_recette}</td>
                    <td className="px-4 py-3 font-medium">{r.chauffeur_prenoms} {r.chauffeur_nom}</td>
                    <td className="px-4 py-3 text-zinc-500">{r.gare_nom}</td>
                    <td className="px-4 py-3 text-blue-600">{fmt(r.recette_gare)}</td>
                    <td className="px-4 py-3 text-violet-600">{fmt(r.recette_route)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">{fmt((r.recette_gare || 0) + (r.recette_route || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {cherche && recettes.length === 0 && !loading && (
        <p className="text-zinc-400 text-sm text-center py-8">Aucune recette pour cette période</p>
      )}
    </div>
  )
}
