import { Car, Bike, Wallet, ParkingCircle } from 'lucide-react'
import type { ParkingSession } from '../lib/types'
import { formatRupiah } from '../lib/types'

export default function Dashboard({ sessions }: { sessions: ParkingSession[] }) {
  const parked = sessions.filter((s) => s.status === 'parked')
  const mobilCount = parked.filter((s) => s.vehicle_type === 'mobil').length
  const motorCount = parked.filter((s) => s.vehicle_type === 'motor').length
  const totalRevenue = sessions
    .filter((s) => s.status === 'exited' && s.fee !== null)
    .reduce((sum, s) => sum + (s.fee ?? 0), 0)

  const stats = [
    {
      icon: <ParkingCircle size={22} />,
      cls: 'parked',
      value: parked.length,
      label: 'Kendaraan Parkir',
    },
    {
      icon: <Car size={22} />,
      cls: 'mobil',
      value: mobilCount,
      label: 'Mobil Parkir',
    },
    {
      icon: <Bike size={22} />,
      cls: 'motor',
      value: motorCount,
      label: 'Motor Parkir',
    },
    {
      icon: <Wallet size={22} />,
      cls: 'revenue',
      value: formatRupiah(totalRevenue),
      label: 'Total Pendapatan',
    },
  ]

  return (
    <div>
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>
            <ParkingCircle size={18} />
            Sedang Parkir
          </h2>
        </div>
        {parked.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Car size={24} color="#9ca3af" />
            </div>
            <p>Tidak ada kendaraan yang sedang parkir</p>
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
                    <td>{formatDateTimeShort(s.entry_time)}</td>
                    <td>{formatDurationShort(s.entry_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDateTimeShort(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDurationShort(entryTime: string): string {
  const start = new Date(entryTime).getTime()
  const diffMs = Date.now() - start
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes} menit`
  return `${hours}j ${minutes}m`
}
