import { ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface ExpenseRowProps {
  expense: ExpenseRecord
  editLabelTamil?: string
  deleteLabelTamil?: string
  onEdit?: (expense: ExpenseRecord) => void
  onDelete?: (expense: ExpenseRecord) => void
}

export function ExpenseRow({
  expense,
  editLabelTamil,
  deleteLabelTamil,
  onEdit,
  onDelete,
}: ExpenseRowProps) {
  const def = getCategoryDefinition(expense.category as CategoryKey)
  const label = def
    ? expenseDisplayLabel(expense.category as CategoryKey, expense.subcategory)
    : expense.category

  const id = expense.id
  const showActions = id != null && (onEdit != null || onDelete != null)

  return (
    <li className="group flex gap-2 rounded-2xl py-3 pl-1 pr-1 transition-colors duration-200 hover:bg-primary/[0.06] sm:gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] font-semibold leading-snug break-words text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{timeTamil(expense.createdAt)}</p>
        {expense.description ? (
          <p className="mt-1 text-xs text-muted-foreground leading-snug break-words">{expense.description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-1.5">
        {showActions ? (
          <div className="flex shrink-0 items-center gap-0.5">
            {onEdit != null ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-primary"
                aria-label={editLabelTamil}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit(expense)
                }}
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
            ) : null}
            {onDelete != null ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                aria-label={deleteLabelTamil}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(expense)
                }}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        ) : null}
        <div className="flex items-center gap-1.5">
          <p className="rounded-xl bg-primary/12 px-2.5 py-1.5 text-[0.95rem] font-bold tabular-nums text-primary">
            {formatInr(expense.amount)}
          </p>
          {!showActions ? (
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground/35 transition-opacity group-hover:text-muted-foreground/60"
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </li>
  )
}
