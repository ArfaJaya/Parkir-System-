/*
# Create parking_sessions table (single-tenant, no auth)

1. New Tables
- `parking_sessions`
  - `id` (uuid, primary key)
  - `plate_number` (text, not null) — vehicle license plate, e.g. "B 1234 ABC"
  - `vehicle_type` (text, not null) — "mobil" or "motor"
  - `entry_time` (timestamptz, not null, default now()) — when vehicle entered
  - `exit_time` (timestamptz, nullable) — when vehicle exited, null means still parked
  - `fee` (integer, nullable) — parking fee in Rupiah, computed on exit
  - `status` (text, not null, default 'parked') — 'parked' or 'exited'
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `parking_sessions`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen).
3. Notes
- This is a single-tenant parking management app with no login required.
- Parking fee is calculated based on vehicle type and duration.
*/

CREATE TABLE IF NOT EXISTS parking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'mobil',
  entry_time timestamptz NOT NULL DEFAULT now(),
  exit_time timestamptz,
  fee integer,
  status text NOT NULL DEFAULT 'parked',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_parking" ON parking_sessions;
CREATE POLICY "anon_select_parking" ON parking_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_parking" ON parking_sessions;
CREATE POLICY "anon_insert_parking" ON parking_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_parking" ON parking_sessions;
CREATE POLICY "anon_update_parking" ON parking_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_parking" ON parking_sessions;
CREATE POLICY "anon_delete_parking" ON parking_sessions FOR DELETE
  TO anon, authenticated USING (true);
