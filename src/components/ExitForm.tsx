import { useState } from 'react'
import { LogOut, Clock, Car, Bike, Receipt } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ParkingSession } from '../lib/types'
import { calculateFee, formatRupiah, formatDateTime, formatDuration } from '../lib/types'

export default function ExitForm({
  sessions,
  onExited,
  onError,
}: {
  sessions: ParkingSession[]
  onExited: () => void
  onError: (msg: string) => void
}) {
  const parked = sessions.filter((s) => s.status === 'parked')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [processing, setProcessing] = useState(false)

  const selected = parked.find((s) => s.id === selectedId)

  const handleConfirm = async () => {
    if (!selected) return
    setProcessing(true)
    const now = new Date().toISOString()
    const fee = calculateFee(selected.vehicle_type, selected.entry_time, now)

    const { error } = await supabase
      .from('parking_sessions')
      .update({
        exit_time: now,
        fee,
        status: 'exited',
      })
      .eq('id', selected.id)

    setProcessing(false)

    if (error) {
      onError('Gagal memproses keluar: ' + error.message)
      return
    }

    setConfirming(false)
    setSelectedId(null)
    onExited()
  }

  if (parked.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <LogOut size={24} color="#9ca3af" />
          </div>
          <p>Tidak ada kendaraan yang sedang parkir</p>
        </div>
      </div>
    )
  }

  if (confirming && selected) {
    const now = new Date().toISOString()
    const fee = calculateFee(selected.vehicle_type, selected.entry_time, now)

    return (
      <div className="modal-overlay" onClick={() => setConfirming(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Konfirmasi Keluar</h3>
          </div>
          <div className="modal-body">
            <div className="detail-row">
              <span className="detail-label">Plat Nomor</span>
              <span className="detail-value">{selected.plate_number}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Jenis</span>
              <span className="detail-value">
                {selected.vehicle_type === 'mobil' ? 'Mobil' : 'Motor'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Waktu Masuk</span>
              <span className="detail-value">{formatDateTime(selected.entry_time)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Waktu Keluar</span>
              <span className="detail-value">{formatDateTime(now)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Durasi</span>
              <span className="detail-value">{formatDuration(selected.entry_time, now)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Biaya Parkir</span>
              <span className="detail-value fee-amount">{formatRupiah(fee)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={processing}>
              Batal
            </button>
            <button className="btn btn-success" onClick={handleConfirm} disabled={processing}>
              <Receipt size={16} />
              {processing ? 'Memproses...' : 'Bayar & Keluar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>
          <LogOut size={18} />
          Pilih Kendaraan yang Keluar
        </h2>
      </div>
      {selected ? (
        <div style={{ padding: '1.25rem' }}>
          <div style={{
            background: 'var(--primary-50)',
            borderRadius: '0.625rem',
            padding: '1rem',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {selected.vehicle_type === 'mobil' ? <Car size={20} /> : <Bike size={20} />}
              <span className="plate">{selected.plate_number}</span>
              <span className={`badge badge-${selected.vehicle_type}`}>
                {selected.vehicle_type === 'mobil' ? 'Mobil' : 'Motor'}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock size={14} />
              Masuk: {formatDateTime(selected.entry_time)} ({formatDuration(selected.entry_time, null)})
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost" onClick={() => setSelectedId(null)}>
              Batal
            </button>
            <button className="btn btn-success" onClick={() => setConfirming(true)}>
              <LogOut size={16} />
              Proses Keluar
            </button>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plat Nomor</th>
                <th>Jenis</th>
                <th>Waktu Masuk</th>
                <th>Durasi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parked.map((s) => (
                <tr key={s.id}>
                  <td className="plate">{s.plate_number}</td>
                  <td>
                    <span className={`badge badge-${s.vehicle_type}`}>
                      {s.vehicle_type === 'mobil' ? 'Mobil' : 'Motor'}
                    </span>
                  </td>
                  <td>{formatDateTime(s.entry_time)}</td>
                  <td>{formatDuration(s.entry_time, null)}</td>
                  <td>
                    <button className="btn btn-success" onClick={() => setSelectedId(s.id)}>
                      <LogOut size={14} />
                      Keluar
                    </button>
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
