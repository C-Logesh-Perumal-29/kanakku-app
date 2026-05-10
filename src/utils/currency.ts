const INR = new Intl.NumberFormat('ta-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0'
  return INR.format(Math.round(amount))
}

/**
 * Short INR labels for compact chart axes (no ₹ symbol; scales by k/L).
 */
export function formatInrAxisShort(value: number): string {
  const v = Math.round(Number(value))
  if (!Number.isFinite(v)) return ''
  const a = Math.abs(v)
  if (a === 0) return '0'
  if (a < 1000) return `${v}`
  if (a < 100000) {
    const k = v / 1000
    const t =
      Math.abs(k % 1) < 1e-6 || Math.abs(k % 1 - 1) < 1e-6
        ? `${Math.round(k)}`
        : `${(Math.round(k * 10) / 10).toString().replace(/\.0$/, '')}`
    return `${t}k`
  }
  const L = v / 100000
  const t =
    Math.abs(L % 1) < 1e-6 || Math.abs(L % 1 - 1) < 1e-6
      ? `${Math.round(L)}`
      : `${(Math.round(L * 10) / 10).toString().replace(/\.0$/, '')}`
  return `${t}L`
}

export function parseAmountInput(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(/,/g, '').trim())
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function parseNonNegativeAmountInput(raw: string): number | null {
  const n = Number.parseFloat(raw.replace(/,/g, '').trim())
  if (!Number.isFinite(n) || n < 0) return null
  return n
}
