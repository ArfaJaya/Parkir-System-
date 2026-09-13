import { useState, useEffect, useCallback } from 'react'
import { Car, LogIn, LogOut, History, LayoutDashboard, Clock } from 'lucide-react'
import { supabase } from './lib/supabase'
import type { ParkingSession } from './lib/types'
import Dashboard from './components/Dashboard'
import EntryForm from './components/EntryForm'
import ExitForm from './components/ExitForm'
import HistoryView from './components/HistoryView'

type Tab = 'dashboard' | 'entry' | 'exit' | 'history'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sessions, setSessions] = useState<ParkingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSessions = useCallback(async () => {
    const { data, error } = await supabase
      .from('parking_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      showToast('Gagal memuat data: ' + error.message, 'error')
      return
    }
    setSessions((data ?? []) as ParkingSession[])
  }, [])

  useEffect(() => {
    fetchSessions().finally(() => setLoading(false))
  }, [fetchSessions])

  const parkedCount = sessions.filter((s) => s.status === 'parked').length

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="header-icon">
            <Car size={22} color="white" />
          </div>
          <h1>Sistem Parkir</h1>
        </div>
        <div className="header-right">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>
        <button
          className={`tab ${tab === 'entry' ? 'active' : ''}`}
          onClick={() => setTab('entry')}
        >
          <LogIn size={16} />
          Kendaraan Masuk
        </button>
        <button
          className={`tab ${tab === 'exit' ? 'active' : ''}`}
          onClick={() => setTab('exit')}
        >
          <LogOut size={16} />
          Kendaraan Keluar
          {parkedCount > 0 && <span className="tab-badge">{parkedCount}</span>}
        </button>
        <button
          className={`tab ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          <History size={16} />
          Riwayat
        </button>
      </nav>

      <main className="content">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Clock size={28} color="#9ca3af" />
            </div>
            <p>Memuat data...</p>
          </div>
        ) : (
          <>
            {tab === 'dashboard' && <Dashboard sessions={sessions} />}
            {tab === 'entry' && (
              <EntryForm onSaved={() => { fetchSessions(); showToast('Kendaraan berhasil masuk') }} onError={(m) => showToast(m, 'error')} />
            )}
            {tab === 'exit' && (
              <ExitForm
                sessions={sessions}
                onExited={() => { fetchSessions(); showToast('Kendaraan berhasil keluar') }}
                onError={(m) => showToast(m, 'error')}
              />
            )}
            {tab === 'history' && <HistoryView sessions={sessions} />}
          </>
        )}
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
