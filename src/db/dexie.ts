import Dexie, { type Table } from 'dexie'
import { DEFAULT_FONT_SIZE_LEVEL, normalizeFontSizeLevel, type FontSizeLevel } from '@/utils/fontSize'

export interface ExpenseRecord {
  id?: number
  category: string
  subcategory?: string | null
  amount: number
  description?: string
  createdAt: number
}

export interface SettingsRecord {
  id?: number
  currentAvailableAmount: number
  fontSizeLevel?: FontSizeLevel
}

export class KanakkuDB extends Dexie {
  expenses!: Table<ExpenseRecord, number>
  settings!: Table<SettingsRecord, number>

  constructor() {
    super('kanakku_db')
    this.version(1).stores({
      expenses: '++id, category, subcategory, createdAt, amount',
      settings: 'id',
    })
  }
}

export const db = new KanakkuDB()

export function resolveSettingsRecord(
  current?: SettingsRecord | null,
  patch: Partial<SettingsRecord> = {},
): Required<Pick<SettingsRecord, 'id' | 'currentAvailableAmount' | 'fontSizeLevel'>> {
  const currentAmount = patch.currentAvailableAmount ?? current?.currentAvailableAmount ?? 0
  return {
    id: 1,
    currentAvailableAmount:
      Number.isFinite(currentAmount) && currentAmount >= 0 ? currentAmount : 0,
    fontSizeLevel: normalizeFontSizeLevel(patch.fontSizeLevel ?? current?.fontSizeLevel),
  }
}

export async function updateSettings(patch: Partial<SettingsRecord>): Promise<void> {
  const current = await db.settings.get(1)
  await db.settings.put(resolveSettingsRecord(current, patch))
}

export async function ensureDefaultSettings(): Promise<void> {
  const row = await db.settings.get(1)
  if (!row || row.fontSizeLevel == null) {
    await db.settings.put(resolveSettingsRecord(row, { fontSizeLevel: row?.fontSizeLevel ?? DEFAULT_FONT_SIZE_LEVEL }))
  }
}
