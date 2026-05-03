'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bus, Users, TrendingUp, MapPin, Map, Navigation } from 'lucide-react'

export default function Home() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    nb_vehicules: 0, nb_chauffeurs: 0, nb_gares: 0,
    recettes_jour: 0, recettes_mois: 0, carburant_mois: 0
  })
  const [dernieres, setDernieres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { charger() }, [])

  async function charger() {
    const today = new Date().toISOString().split('T')[0]
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const [{ count: nb_v }, { count: nb_c }, { count: nb_g },
           { data: r_jour }, { data: r_mois }, { data: carb }, { data: last }] = await Promise.all([
      supabase.from('vehicules').select('*', { count: 'exact', head: true }),
      supabase.from('chauffeurs').select('*', { count: 'exact', head: true }),
      supabase.from('gares').select('*', { count: 'exact', head: true }),
      supabase.from('recettes').select('recette_gare,recette_route').eq('date_recette', today),
      supabase.from('recettes').select('recette_gare,recette_route').gte('date_recette', firstDay),
      supabase.from('carburants').select('montant').gte('date_dep', firstDay),
      supabase.from('recettes').select('*, vehicule:vehicules(plaque), gare:gares(nom)').order('date_recette', { ascending: false }).limit(5)
    ])
    const rec_jour = (r_jour || []).reduce((s, r) => s + (r.recette_gare || 0) + (r.recette_route || 0), 0)
    const rec_mois = (r_mois || []).reduce((s, r) => s + (r.recette_gare || 0) + (r.recette_route || 0), 0)
    const carb_mois = (carb || []).reduce((s, c) => s + (c.montant || 0), 0)
    setStats({ nb_vehicules: nb_v || 0, nb_chauffeurs: nb_c || 0, nb_gares: nb_g || 0,
               recettes_jour: rec_jour, recettes_mois: rec_mois, carburant_mois: carb_mois })
    setDernieres(last || [])
    setLoading(false)
  }

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F'
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a3a2a]">🚌 Bon Djoula Transport</h1>
        <p className="text-zinc-400 text-sm mt-1 capitalize">{today}</p>
      </div>

      {/* Boutons GPS */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <a href="/suivi" className="bg-[#0a0f0d] border border-[#00e87a33] rounded-2xl p-5 flex items-center gap-4 hover:border-[#00e87a] transition-all group">
          <div className="w-12 h-12 rounded-xl bg-[#00e87a18] flex items-center justify-center group-hover:bg-[#00e87a33] transition-all">
            <Map className="w-6 h-6 text-[#00e87a]" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Suivi GPS en temps réel</p>
            <p className="text-xs text-[#5a7a65] mt-0.5">Carte de la flotte • positions live</p>
          </div>
          <div className="ml-auto">
            <div className="w-2 h-2 rounded-full bg-[#00e87a] animate-pulse"></div>
          </div>
        </a>
        <a href="/chauffeur" className="bg-[#0a0f0d] border border-[#00e87a33] rounded-2xl p-5 flex items-center gap-4 hover:border-[#00e87a] transition-all group">
          <div className="w-12 h-12 rounded-xl bg-[#00e87a18] flex items-center justify-center group-hover:bg-[#00e87a33] transition-all">
            <Navigation className="w-6 h-6 text-[#00e87a]" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">App Chauffeur GPS</p>
            <p className="text-xs text-[#5a7a65] mt-0.5">Démarrer le suivi • envoyer position</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] text-[#00e87a] font-mono border border-[#00e87a33] rounded px-1.5 py-0.5">MOBILE</span>
          </div>
        </a>
      </div>

      {loading ? <p className="text-zinc-400 text-sm">Chargement...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-600 rounded-2xl p-5 text-white">
              <p className="text-emerald-200 text-xs font-medium">Recettes aujourd'hui</p>
              <p className="text-2xl font-bold mt-1">{fmt(stats.recettes_jour)}</p>
            </div>
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <p className="text-blue-200 text-xs font-medium">Recettes ce mois</p>
              <p className="text-2xl font-bold mt-1">{fmt(stats.recettes_mois)}</p>
            </div>
            <div className="bg-orange-500 rounded-2xl p-5 text-white">
              <p className="text-orange-200 text-xs font-medium">Carburant ce mois</p>
              <p className="text-2xl font-bold mt-1">{fmt(stats.carburant_mois)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Véhicules', value: stats.nb_vehicules, icon: Bus, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/vehicules' },
              { label: 'Chauffeurs', value: stats.nb_chauffeurs, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/chauffeurs' },
              { label: 'Gares', value: stats.nb_gares, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50', href: '/gares' },
            ].map(({ label, value, icon: Icon, color, bg, href }) => (
              <a key={label} href={href} className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-800">{value}</p>
                  <p className="text-xs text-zinc-400">{label}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700">Bénéfice net ce mois</p>
                <p className="text-xs text-zinc-400">Recettes − Carburant</p>
              </div>
            </div>
            <p className={`text-2xl font-bold ${stats.recettes_mois - stats.carburant_mois >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {fmt(stats.recettes_mois - stats.carburant_mois)}
            </p>
          </div>

          {dernieres.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <p className="font-semibold text-zinc-700 text-sm">Dernières recettes saisies</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    {['Date','Véhicule','Gare','Montant'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dernieres.map(r => (
                    <tr key={r.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                      <td className="px-4 py-3 text-zinc-500">{r.date_recette}</td>
                      <td className="px-4 py-3 font-medium">{r.vehicule?.plaque}</td>
                      <td className="px-4 py-3 text-zinc-500">{r.gare?.nom}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{fmt((r.recette_gare||0)+(r.recette_route||0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
