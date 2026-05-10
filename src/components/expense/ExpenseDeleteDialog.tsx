import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { db, type ExpenseRecord } from '@/db/dexie'
import {
  type CategoryKey,
  expenseDisplayLabel,
  getCategoryDefinition,
} from '@/domain/categories'
import { ta } from '@/translations/ta'
import { formatInr } from '@/utils/currency'
import { toast } from 'sonner'

interface ExpenseDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: ExpenseRecord | null
}

export function ExpenseDeleteDialog({ open, onOpenChange, expense }: ExpenseDeleteDialogProps) {
  const def = expense ? getCategoryDefinition(expense.category as CategoryKey) : undefined
  const label = expense
    ? def
      ? expenseDisplayLabel(expense.category as CategoryKey, expense.subcategory)
      : expense.category
    : ''

  async function handleDelete(): Promise<void> {
    if (expense?.id == null) return
    await db.expenses.delete(expense.id)
    toast.success(ta.expenseDeleted, { duration: 2800 })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-sm">
        <DialogHeader className="space-y-2 text-start">
          <DialogTitle className="text-balance text-lg leading-snug font-semibold">
            {ta.deleteExpenseTitle}
          </DialogTitle>
          <DialogDescription className="text-pretty text-sm leading-relaxed">
            {ta.deleteExpenseBody}
          </DialogDescription>
        </DialogHeader>
        {expense ? (
          <div className="rounded-2xl border border-border/70 bg-muted/40 px-3 py-2.5 text-sm">
            <p className="font-semibold text-foreground">{label}</p>
            <p className="mt-1 font-bold tabular-nums text-primary">{formatInr(expense.amount)}</p>
          </div>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {ta.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 px-6 text-base"
            disabled={expense?.id == null}
            onClick={handleDelete}
          >
            {ta.deleteExpenseConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
