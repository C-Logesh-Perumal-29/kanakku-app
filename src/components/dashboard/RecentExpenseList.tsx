import { Link } from 'react-router-dom'
import { ChevronRight, ListTree } from 'lucide-react'
import { ExpenseRow } from '@/components/expense/ExpenseRow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ExpenseRecord } from '@/db/dexie'

interface RecentExpenseListProps {
  titleTamil: string
  emptyTamil: string
  items: ExpenseRecord[]
  viewAllHref?: string
  viewAllLabelTamil?: string
  editLabelTamil?: string
  deleteLabelTamil?: string
  onEditExpense?: (expense: ExpenseRecord) => void
  onDeleteExpense?: (expense: ExpenseRecord) => void
}

export function RecentExpenseList({
  titleTamil,
  emptyTamil,
  items,
  viewAllHref,
  viewAllLabelTamil,
  editLabelTamil,
  deleteLabelTamil,
  onEditExpense,
  onDeleteExpense,
}: RecentExpenseListProps) {
  return (
    <Card className="bg-[color-mix(in_srgb,var(--card)_94%,transparent)] transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-2">
        <CardTitle className="inline-flex items-center gap-2 text-base leading-snug">
          <ListTree className="size-4 shrink-0 text-primary" aria-hidden />
          {titleTamil}
        </CardTitle>
        {viewAllHref && viewAllLabelTamil ? (
          <Link
            to={viewAllHref}
            className="inline-flex shrink-0 items-center gap-0.5 rounded-lg py-1 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {viewAllLabelTamil}
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-0 pt-1">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyTamil}</p>
        ) : (
          <div className="max-h-[min(320px,42svh)] overflow-y-auto overscroll-contain pr-2 touch-pan-y">
            <ul className="divide-y divide-border/70 pb-1">
              {items.map((e) => (
                <ExpenseRow
                  key={e.id ?? `${e.createdAt}-${e.category}`}
                  expense={e}
                  editLabelTamil={editLabelTamil}
                  deleteLabelTamil={deleteLabelTamil}
                  onEdit={onEditExpense}
                  onDelete={onDeleteExpense}
                />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
