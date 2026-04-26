'use client'
import { Sidebar } from '@/components/bon-djoula/sidebar'
import { MapPin } from 'lucide-react'

const gares = [
  'Abidjan', 'Bouaké', 'Man', 'Danané', 'Yamoussoukro',
  'Daloa', 'Biankouma', 'Odienné', 'Touba', 'Korhogo',
  'Divo', 'Tiémé', 'Boundiali'
]

const couleurs = [
  'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500',
  'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-red-500',
  'bg-indigo-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500', 'bg-sky-500'
]

export default function GaresPage() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1a3a2a]">📍 Gares</h1>
          <p className="text-zinc-500 mt-1">13 gares du réseau Bon Djoula</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gares.map((gare, i) => (
            <div key={gare} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col items-center gap-3 hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${couleurs[i]}`}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-zinc-800 text-sm text-center">{gare}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}