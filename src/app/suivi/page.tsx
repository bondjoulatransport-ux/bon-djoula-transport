'use client'

export default function SuiviPage() {
  return (
    <div className="w-full h-[calc(100vh-48px)] rounded-xl overflow-hidden border border-zinc-200">
      <iframe
        src="/bondjoula_dashboard.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Suivi GPS Bondjoula Transport"
      />
    </div>
  )
}
