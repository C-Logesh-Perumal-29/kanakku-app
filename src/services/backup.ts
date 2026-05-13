import { db, resolveSettingsRecord, type ExpenseRecord, type SettingsRecord } from '@/db/dexie'
import { normalizeFontSizeLevel } from '@/utils/fontSize'
import { getCategoryDefinition, type CategoryKey } from '@/domain/categories'

const BACKUP_VERSION = 1 as const

export interface KanakkuBackup {
  version: typeof BACKUP_VERSION
  exportedAt: number
  expenses: ExpenseRecord[]
  settings: SettingsRecord | null
}

function isCategoryKey(v: string): v is CategoryKey {
  return Boolean(getCategoryDefinition(v as CategoryKey))
}

function validateExpense(row: unknown): row is ExpenseRecord {
  if (!row || typeof row !== 'object') return false
  const e = row as ExpenseRecord
  if (typeof e.category !== 'string' || !isCategoryKey(e.category)) return false
  if (e.subcategory != null && typeof e.subcategory !== 'string') return false
  if (typeof e.amount !== 'number' || !Number.isFinite(e.amount) || e.amount <= 0)
    return false
  if (e.description != null && typeof e.description !== 'string') return false
  if (typeof e.createdAt !== 'number' || !Number.isFinite(e.createdAt)) return false
  return true
}

export async function exportBackupJson(): Promise<KanakkuBackup> {
  const expenses = await db.expenses.toArray()
  const settings = (await db.settings.get(1)) ?? null
  return {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    expenses,
    settings,
  }
}

export function downloadBackupFile(data: KanakkuBackup): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kanakku-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackupJson(text: string): Promise<void> {
  const parsed: unknown = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') throw new Error('invalid')
  const body = parsed as Partial<KanakkuBackup>
  if (body.version !== BACKUP_VERSION) throw new Error('version')
  if (!Array.isArray(body.expenses)) throw new Error('expenses')
  for (const row of body.expenses) {
    if (!validateExpense(row)) throw new Error('expense')
  }

  await db.transaction('rw', db.expenses, db.settings, async () => {
    await db.expenses.clear()
    for (const e of body.expenses as ExpenseRecord[]) {
      await db.expenses.add({
        category: e.category,
        subcategory: e.subcategory ?? undefined,
        amount: e.amount,
        description: e.description,
        createdAt: e.createdAt,
      })
    }
    if (body.settings && typeof body.settings === 'object') {
      const s = body.settings as SettingsRecord
      if (
        typeof s.currentAvailableAmount === 'number' &&
        Number.isFinite(s.currentAvailableAmount) &&
        s.currentAvailableAmount >= 0
      ) {
        const current = await db.settings.get(1)
        await db.settings.put(
          resolveSettingsRecord(current, {
            currentAvailableAmount: s.currentAvailableAmount,
            fontSizeLevel: normalizeFontSizeLevel(s.fontSizeLevel),
          }),
        )
      }
    }
  })
}
