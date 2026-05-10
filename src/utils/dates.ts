export function startOfLocalDay(ts: number): Date {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isSameLocalDay(a: number, b: number): boolean {
  const da = startOfLocalDay(a)
  const db = startOfLocalDay(b)
  return da.getTime() === db.getTime()
}

export function isSameLocalMonth(ts: number, ref: Date = new Date()): boolean {
  const d = new Date(ts)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function localMonthKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return `${y}-${String(m).padStart(2, '0')}`
}

export function localDayKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
