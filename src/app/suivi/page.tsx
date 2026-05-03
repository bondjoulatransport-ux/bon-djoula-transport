'use client'

export default function SuiviPage() {
  return (
    <div style={{ margin: '-24px', height: 'calc(100vh - 0px)' }}>
      <iframe
        src="/bondjoula_dashboard.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Suivi GPS Bondjoula Transport"
      />
    </div>
  )
}
