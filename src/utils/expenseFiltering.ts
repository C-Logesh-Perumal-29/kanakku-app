import type { ExpenseRecord } from '@/db/dexie'
import {
  categoryLabelTamil,
  expenseDisplayLabel,
  type CategoryKey,
  getCategoryDefinition,
} from '@/domain/categories'
import { localDayKey, localMonthKey } from '@/utils/dates'
import { isKnownCategory } from '@/utils/expenseStats'

const TA_MONTHS = [
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
] as const

export function tamilMonthLabelFromKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  const name = TA_MONTHS[(m ?? 1) - 1] ?? monthKey
  return `${name} ${y}`
}

export function uniqueExpenseMonthKeys(expenses: ExpenseRecord[]): string[] {
  const s = new Set<string>()
  for (const e of expenses) {
    s.add(localMonthKey(e.createdAt))
  }
  return [...s].sort().reverse()
}

export function uniqueExpenseDayKeys(expenses: ExpenseRecord[]): string[] {
  const s = new Set<string>()
  for (const e of expenses) {
    s.add(localDayKey(e.createdAt))
  }
  return [...s].sort().reverse()
}

export function tamilDayLabelFromKey(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number)
  const dt = new Date(y ?? 0, (m ?? 1) - 1, d ?? 1)
  return dt.toLocaleDateString('ta-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export type ExpenseSort = 'newest' | 'oldest' | 'amount_high' | 'amount_low'

export interface ExpenseFilterState {
  monthKey: string | 'all'
  dayKey: string | 'all'
  categoryKey: CategoryKey | 'all'
  search: string
  sort: ExpenseSort
}

export function filterExpensesByDateRange(
  expenses: ExpenseRecord[],
  startDayKey: string,
  endDayKey: string,
): ExpenseRecord[] {
  if (startDayKey > endDayKey) return []
  return expenses.filter((e) => {
    const dk = localDayKey(e.createdAt)
    return dk >= startDayKey && dk <= endDayKey
  })
}

export function filterExpenses(
  expenses: ExpenseRecord[],
  f: Omit<ExpenseFilterState, 'sort'>,
): ExpenseRecord[] {
  let rows = [...expenses]
  const q = f.search.trim().toLowerCase()

  if (f.monthKey !== 'all') {
    rows = rows.filter((e) => localMonthKey(e.createdAt) === f.monthKey)
  }

  if (f.dayKey !== 'all') {
    rows = rows.filter((e) => localDayKey(e.createdAt) === f.dayKey)
  }

  if (f.categoryKey !== 'all') {
    rows = rows.filter((e) => e.category === f.categoryKey)
  }

  if (q) {
    rows = rows.filter((e) => {
      const def = getCategoryDefinition(e.category as CategoryKey)
      const lab = def
        ? expenseDisplayLabel(e.category as CategoryKey, e.subcategory)
        : e.category
      const blob = `${lab} ${e.description ?? ''}`.toLowerCase()
      return blob.includes(q)
    })
  }

  return rows
}

export function sortExpenses(rows: ExpenseRecord[], sort: ExpenseSort): ExpenseRecord[] {
  const out = [...rows]
  switch (sort) {
    case 'newest':
      return out.sort((a, b) => b.createdAt - a.createdAt)
    case 'oldest':
      return out.sort((a, b) => a.createdAt - b.createdAt)
    case 'amount_high':
      return out.sort((a, b) => b.amount - a.amount || b.createdAt - a.createdAt)
    case 'amount_low':
      return out.sort((a, b) => a.amount - b.amount || b.createdAt - a.createdAt)
    default:
      return out
  }
}

export interface FilteredInsights {
  total: number
  count: number
  avg: number
  highest: { amount: number; labelTamil: string } | null
  topCategories: { key: CategoryKey; total: number; labelTamil: string }[]
}

export function insightsForFiltered(
  filtered: ExpenseRecord[],
  categoryFilterIsAll: boolean,
): FilteredInsights {
  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const count = filtered.length
  const avg = count > 0 ? total / count : 0

  let highest: FilteredInsights['highest'] = null
  for (const e of filtered) {
    if (!highest || e.amount > highest.amount) {
      const def = getCategoryDefinition(e.category as CategoryKey)
      const labelTamil = def
        ? expenseDisplayLabel(e.category as CategoryKey, e.subcategory)
        : e.category
      highest = { amount: e.amount, labelTamil }
    }
  }

  const byCat = new Map<CategoryKey, number>()
  for (const e of filtered) {
    if (!isKnownCategory(e.category)) continue
    const k = e.category as CategoryKey
    byCat.set(k, (byCat.get(k) ?? 0) + e.amount)
  }

  let topCategories = [...byCat.entries()]
    .map(([key, t]) => ({ key, total: t, labelTamil: categoryLabelTamil(key) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  if (!categoryFilterIsAll && topCategories.length <= 1) {
    topCategories = []
  }

  return { total, count, avg, highest, topCategories }
}
