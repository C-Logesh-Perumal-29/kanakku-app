import { ChevronRight } from 'lucide-react'
import type { ExpenseRecord } from '@/db/dexie'
import {
  type CategoryKey,
  expenseDisplayLabel,
  getCategoryDefinition,
} from '@/domain/categories'
import { formatInr } from '@/utils/currency'

function timeTamil(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString('ta-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ExpenseRow({ expense }: { expense: ExpenseRecord }) {
  const def = getCategoryDefinition(expense.category as CategoryKey)
  const label = def
    ? expenseDisplayLabel(expense.category as CategoryKey, expense.subcategory)
    : expense.category

  return (
    <li className="group flex gap-3 rounded-2xl py-3 pl-1 pr-1 transition-colors duration-200 hover:bg-primary/[0.06]">
      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] font-semibold leading-snug break-words text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{timeTamil(expense.createdAt)}</p>
        {expense.description ? (
          <p className="mt-1 text-xs text-muted-foreground leading-snug break-words">{expense.description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <p className="rounded-xl bg-primary/12 px-2.5 py-1.5 text-[0.95rem] font-bold tabular-nums text-primary">
          {formatInr(expense.amount)}
        </p>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground/35 transition-opacity group-hover:text-muted-foreground/60"
          aria-hidden
        />
      </div>
    </li>
  )
}
