import { db, type ExpenseRecord } from '@/db/dexie'

export interface StatementMeta {
  appStartedAt: number
  generatedAt: number
  availableBalance: number
}

export async function resolveAppStartedAt(allExpenses: ExpenseRecord[]): Promise<number> {
  const settings = await db.settings.get(1)
  if (settings?.appStartedAt != null && Number.isFinite(settings.appStartedAt)) {
    return settings.appStartedAt
  }
  if (allExpenses.length === 0) return Date.now()
  return Math.min(...allExpenses.map((e) => e.createdAt))
}

export async function loadStatementMeta(allExpenses: ExpenseRecord[]): Promise<StatementMeta> {
  const [settings, appStartedAt] = await Promise.all([
    db.settings.get(1),
    resolveAppStartedAt(allExpenses),
  ])
  return {
    appStartedAt,
    generatedAt: Date.now(),
    availableBalance: settings?.currentAvailableAmount ?? 0,
  }
}

export function statementReportId(startDayKey: string, endDayKey: string): string {
  return `KNK-${startDayKey.replace(/-/g, '')}-${endDayKey.replace(/-/g, '')}`
}

export function formatStatementDateTime(ms: number): string {
  return new Date(ms).toLocaleString('ta-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatStatementDate(ms: number): string {
  return new Date(ms).toLocaleDateString('ta-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Split expense rows across PDF pages (first page has less room due to summary). */
export function paginateExpenseRows<T>(rows: T[], firstPageRows: number, nextPageRows: number): T[][] {
  if (rows.length === 0) return [[]]
  if (rows.length <= firstPageRows) return [rows]
  const pages: T[][] = [rows.slice(0, firstPageRows)]
  let i = firstPageRows
  while (i < rows.length) {
    pages.push(rows.slice(i, i + nextPageRows))
    i += nextPageRows
  }
  return pages
}
