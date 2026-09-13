import { useState } from 'react'
import { History, Search, Car } from 'lucide-react'
import type { ParkingSession } from '../lib/types'
import { formatRupiah, formatDateTime, formatDuration } from '../lib/types'

export default function HistoryView({ sessions }: { sessions: ParkingSession[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'parked' | 'exited'>('all')

  const filtered = sessions.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false
    if (query.trim()) {
      return s.plate_number.toLowerCase().includes(query.trim().toLowerCase())
    }
    return true
  })

  return (
    <div className="card">
      <div className="card-header">
        <h2>
          <History size={18} />
          Riwayat Parkir
        </h2>
      </div>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cari plat nomor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'parked' | 'exited')}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            background: 'white',
          }}
        >
          <option value="all">Semua</option>
          <option value="parked">Sedang Parkir</option>
          <option value="exited">Sudah Keluar</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Car size={24} color="#9ca3af" />
          </div>
          <p>{query || filter !== 'all' ? 'Tidak ada data yang cocok' : 'Belum ada riwayat parkir'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plat Nomor</th>
                <th>Jenis</th>
                <th>Masuk</th>
                <th>Keluar</th>
                <th>Durasi</th>
                <th>Biaya</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="plate">{s.plate_number}</td>
                  <td>
                    <span className={`badge badge-${s.vehicle_type}`}>
                      {s.vehicle_type === 'mobil' ? 'Mobil' : 'Motor'}
                    </span>
                  </td>
                  <td>{formatDateTime(s.entry_time)}</td>
                  <td>{s.exit_time ? formatDateTime(s.exit_time) : '—'}</td>
                  <td>{formatDuration(s.entry_time, s.exit_time)}</td>
                  <td>{s.fee !== null ? formatRupiah(s.fee) : '—'}</td>
                  <td>
                    <span className={`badge badge-${s.status}`}>
                      {s.status === 'parked' ? 'Parkir' : 'Keluar'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
