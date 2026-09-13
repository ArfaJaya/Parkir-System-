import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { VEHICLE_RATES } from '../lib/types'

export default function EntryForm({
  onSaved,
  onError,
}: {
  onSaved: () => void
  onError: (msg: string) => void
}) {
  const [plate, setPlate] = useState('')
  const [vehicleType, setVehicleType] = useState<'mobil' | 'motor'>('mobil')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = plate.trim().toUpperCase()
    if (!trimmed) {
      onError('Plat nomor tidak boleh kosong')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('parking_sessions')
      .insert({
        plate_number: trimmed,
        vehicle_type: vehicleType,
        entry_time: new Date().toISOString(),
        status: 'parked',
      })

    setSaving(false)

    if (error) {
      onError('Gagal menyimpan: ' + error.message)
      return
    }

    setPlate('')
    setVehicleType('mobil')
    onSaved()
  }

  return (
    <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="card-header">
        <h2>
          <LogIn size={18} />
          Catat Kendaraan Masuk
        </h2>
      </div>
      <form className="form-group" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="plate">Plat Nomor</label>
          <input
            id="plate"
            type="text"
            placeholder="Contoh: B 1234 ABC"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            style={{ textTransform: 'uppercase' }}
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="type">Jenis Kendaraan</label>
          <select
            id="type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as 'mobil' | 'motor')}
          >
            <option value="mobil">Mobil — {formatRate(VEHICLE_RATES.mobil)}/jam</option>
            <option value="motor">Motor — {formatRate(VEHICLE_RATES.motor)}/jam</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
          <LogIn size={18} />
          {saving ? 'Menyimpan...' : 'Catat Masuk'}
        </button>
      </form>
    </div>
  )
}

function formatRate(r: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(r)
}
