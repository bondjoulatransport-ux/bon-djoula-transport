'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bus, Users, MapPin, CalendarDays, Banknote, Fuel, LayoutDashboard, LogOut, TrendingUp, Map, Navigation } from 'lucide-react'

const nav = [
  { href: '/',           label: 'Tableau de bord', icon: LayoutDashboard, newTab: false },
  { href: '/vehicules',  label: 'Véhicules',        icon: Bus,             newTab: false },
  { href: '/chauffeurs', label: 'Chauffeurs',        icon: Users,           newTab: false },
  { href: '/gares',      label: 'Gares',             icon: MapPin,          newTab: false },
  { href: '/programme',  label: 'Programme',         icon: CalendarDays,    newTab: false },
  { href: '/recettes',   label: 'Recettes',          icon: Banknote,        newTab: false },
  { href: '/carburant',  label: 'Carburant',         icon: Fuel,            newTab: false },
  { href: '/bilan',      label: 'Bilan Global',      icon: TrendingUp,      newTab: false },
  { href: '/suivi',      label: 'Suivi GPS',         icon: Map,             newTab: true  },
  { href: '/chauffeur',  label: 'App Chauffeur',     icon: Navigation,      newTab: true  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-[#1a3a2a] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#f7b731] rounded-full flex items-center justify-center">
          <Bus className="w-5 h-5 text-[#1a3a2a]" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Bon Djoula</p>
          <p className="text-[#8fbf9f] text-xs">Transport</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, newTab }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              target={newTab ? '_blank' : '_self'}
              rel={newTab ? 'noopener noreferrer' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#f7b731] text-[#1a3a2a] font-medium'
                  : 'text-[#8fbf9f] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[#8fbf9f] hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
