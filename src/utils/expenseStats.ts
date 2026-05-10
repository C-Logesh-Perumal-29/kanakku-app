import type { ExpenseRecord } from '@/db/dexie'
import {
  type CategoryKey,
  categoryLabelTamil,
  getCategoryDefinition,
} from '@/domain/categories'
import {
  isSameLocalDay,
  isSameLocalMonth,
  localDayKey,
  localMonthKey,
  startOfLocalDay,
} from '@/utils/dates'

export function sumAmount(expenses: ExpenseRecord[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0)
}

export function todayTotal(expenses: ExpenseRecord[], now = Date.now()): number {
  return sumAmount(expenses.filter((e) => isSameLocalDay(e.createdAt, now)))
}

export function monthTotal(
  expenses: ExpenseRecord[],
  ref: Date = new Date(),
): number {
  return sumAmount(expenses.filter((e) => isSameLocalMonth(e.createdAt, ref)))
}

export function totalsByMainCategoryThisMonth(
  expenses: ExpenseRecord[],
  ref: Date = new Date(),
): { key: CategoryKey; total: number }[] {
  const map = new Map<CategoryKey, number>()
  for (const e of expenses) {
    if (!isSameLocalMonth(e.createdAt, ref)) continue
    const k = e.category as CategoryKey
    map.set(k, (map.get(k) ?? 0) + e.amount)
  }
  return [...map.entries()]
    .map(([key, total]) => ({ key, total }))
    .sort((a, b) => b.total - a.total)
}

export function topCategoryThisMonth(
  expenses: ExpenseRecord[],
  ref: Date = new Date(),
): { key: CategoryKey; total: number } | null {
  const rows = totalsByMainCategoryThisMonth(expenses, ref)
  return rows[0] ?? null
}

export interface MonthlyBucket {
  monthKey: string
  labelTamil: string
  total: number
}

const TAMIL_MONTHS = [
  'ஜனவரி',
  'பிப்ரவரி',
  'மார்ச்',
  'ஏப்ரல்',
  'மே',
  'ஜூன்',
  'ஜூலை',
  'ஆகஸ்ட்',
  'செப்டம்பர்',
  'அக்டோபர்',
  'நவம்பர்',
  'டிசம்பர்',
]

function monthLabelTamil(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  const name = TAMIL_MONTHS[(m ?? 1) - 1] ?? ''
  return `${name} ${y}`
}

/** Last `count` calendar months including current */
export function monthlyTrend(
  expenses: ExpenseRecord[],
  count = 6,
  ref: Date = new Date(),
): MonthlyBucket[] {
  const keys: string[] = []
  const d = new Date(ref.getFullYear(), ref.getMonth(), 1)
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    const mk = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`
    keys.push(mk)
  }
  const totals = new Map<string, number>()
  for (const e of expenses) {
    const mk = localMonthKey(e.createdAt)
    totals.set(mk, (totals.get(mk) ?? 0) + e.amount)
  }
  return keys.map((monthKey) => ({
    monthKey,
    labelTamil: monthLabelTamil(monthKey),
    total: totals.get(monthKey) ?? 0,
  }))
}

export interface DailyBucket {
  dayKey: string
  labelTamil: string
  total: number
}

function dayLabelTamil(ts: number): string {
  const d = new Date(ts)
  return `${d.getDate()}`
}

/** Last `days` days including today */
export function dailyOverview(
  expenses: ExpenseRecord[],
  days = 7,
  ref: Date = new Date(),
): DailyBucket[] {
  const end = startOfLocalDay(ref.getTime())
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const x = new Date(end)
    x.setDate(x.getDate() - i)
    keys.push(localDayKey(x.getTime()))
  }
  const totals = new Map<string, number>()
  for (const e of expenses) {
    const dk = localDayKey(e.createdAt)
    totals.set(dk, (totals.get(dk) ?? 0) + e.amount)
  }
  return keys.map((dayKey) => {
    const parts = dayKey.split('-').map(Number)
    const y = parts[0] ?? ref.getFullYear()
    const m = (parts[1] ?? 1) - 1
    const day = parts[2] ?? 1
    const ts = new Date(y, m, day).getTime()
    return {
      dayKey,
      labelTamil: dayLabelTamil(ts),
      total: totals.get(dayKey) ?? 0,
    }
  })
}

export function recentExpenses(
  expenses: ExpenseRecord[],
  limit = 5,
): ExpenseRecord[] {
  return [...expenses]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}

export function isKnownCategory(cat: string): cat is CategoryKey {
  return Boolean(getCategoryDefinition(cat as CategoryKey))
}

export function pieDataThisMonth(expenses: ExpenseRecord[], ref: Date = new Date()) {
  const rows = totalsByMainCategoryThisMonth(expenses, ref).filter((r) => r.total > 0)
  return rows.map((r, i) => ({
    id: r.key,
    name: categoryLabelTamil(r.key),
    value: r.total,
    fill: CHART_HEX[i % CHART_HEX.length],
  }))
}

/** Aesthetic pink palette (SVG charts) */
const CHART_HEX = ['#c55d9f', '#dc84b9', '#e9a8cf', '#f3d5ea', '#9d4882']
