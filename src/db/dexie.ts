import Dexie, { type Table } from 'dexie'

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

export async function ensureDefaultSettings(): Promise<void> {
  const row = await db.settings.get(1)
  if (!row) {
    await db.settings.put({ id: 1, currentAvailableAmount: 0 })
  }
}
