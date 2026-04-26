import { Bus, Users, MapPin, Banknote, Fuel, CalendarDays } from 'lucide-react'
import { Sidebar } from '@/components/bon-djoula/sidebar'

export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a3a2a]">🚌 Bon Djoula Transport</h1>
          <p className="text-zinc-500 mt-1">Tableau de bord — Bienvenue !</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { label: 'Véhicules', icon: Bus, href: '/vehicules', bg: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', desc: 'Gérer la flotte' },
            { label: 'Chauffeurs', icon: Users, href: '/chauffeurs', bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', desc: 'Gérer les chauffeurs' },
            { label: 'Gares', icon: MapPin, href: '/gares', bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', desc: '13 gares du réseau' },
            { label: 'Programme', icon: CalendarDays, href: '/programme', bg: 'bg-violet-600', light: 'bg-violet-50', text: 'text-violet-600', desc: 'Planifier les trajets' },
            { label: 'Recettes', icon: Banknote, href: '/recettes', bg: 'bg-pink-600', light: 'bg-pink-50', text: 'text-pink-600', desc: 'Suivi des recettes' },
            { label: 'Carburant', icon: Fuel, href: '/carburant', bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', desc: 'Dépenses carburant' },
          ].map(({ label, icon: Icon, href, bg, light, text, desc }) => (
            <a key={href} href={href}
              className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-zinc-800 text-base">{label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
              </div>
              <div className={`text-xs font-medium ${text} ${light} rounded-lg px-2 py-1 w-fit`}>
                Ouvrir →
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}