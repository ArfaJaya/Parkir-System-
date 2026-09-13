export interface ParkingSession {
  id: string
  plate_number: string
  vehicle_type: 'mobil' | 'motor'
  entry_time: string
  exit_time: string | null
  fee: number | null
  status: 'parked' | 'exited'
  created_at: string
}

export const VEHICLE_RATES: Record<string, number> = {
  mobil: 5000,
  motor: 3000,
}

export function calculateFee(
  vehicleType: 'mobil' | 'motor',
  entryTime: string,
  exitTime: string,
): number {
  const entry = new Date(entryTime).getTime()
  const exit = new Date(exitTime).getTime()
  const diffMs = exit - entry
  const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)))
  const baseRate = VEHICLE_RATES[vehicleType] ?? 5000
  return baseRate * diffHours
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(entryTime: string, exitTime: string | null): string {
  const start = new Date(entryTime).getTime()
  const end = exitTime ? new Date(exitTime).getTime() : Date.now()
  const diffMs = end - start
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes} menit`
  return `${hours}j ${minutes}m`
}
