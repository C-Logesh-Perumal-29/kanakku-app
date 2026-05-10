import { db, type ExpenseRecord, type SettingsRecord } from '@/db/dexie'
import { useLiveQuery } from 'dexie-react-hooks'

export function useLiveExpenses(): ExpenseRecord[] | undefined {
  return useLiveQuery(() => db.expenses.orderBy('createdAt').reverse().toArray(), [])
}

export function useLiveSettings(): SettingsRecord | undefined {
  return useLiveQuery(() => db.settings.get(1), [])
}
