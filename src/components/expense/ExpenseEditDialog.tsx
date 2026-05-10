import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { db, type ExpenseRecord } from '@/db/dexie'
import {
  CATEGORY_TREE,
  categoryLabelTamil,
  type CategoryKey,
  getCategoryDefinition,
  subcategoryLabelTamil,
  type SubcategoryKey,
} from '@/domain/categories'
import { ta } from '@/translations/ta'
import { parseAmountInput } from '@/utils/currency'
import { toast } from 'sonner'

const selectCls =
  'mt-1.5 flex h-12 w-full min-w-0 rounded-2xl border border-input bg-[color-mix(in_srgb,var(--background)_55%,var(--card)_45%)] px-3 py-2 text-base font-medium text-foreground shadow-inner shadow-black/[0.03] transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none disabled:opacity-60'

function toDatetimeLocal(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(raw: string): number {
  const t = new Date(raw).getTime()
  return Number.isFinite(t) ? t : Date.now()
}

interface ExpenseEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: ExpenseRecord | null
}

export function ExpenseEditDialog({ open, onOpenChange, expense }: ExpenseEditDialogProps) {
  const [amountRaw, setAmountRaw] = useState('')
  const [description, setDescription] = useState('')
  const [categoryKey, setCategoryKey] = useState<CategoryKey>(CATEGORY_TREE[0]?.key ?? 'grocery')
  const [subKey, setSubKey] = useState<SubcategoryKey | null>(null)
  const [createdLocal, setCreatedLocal] = useState('')

  const def = getCategoryDefinition(categoryKey)
  const subs = def?.subcategories

  useEffect(() => {
    if (!open || expense == null || expense.id == null) return

    setAmountRaw(String(expense.amount))
    setDescription(expense.description ?? '')

    const known = CATEGORY_TREE.some((c) => c.key === expense.category)
    const nextCat = known ? (expense.category as CategoryKey) : CATEGORY_TREE[0]?.key ?? 'grocery'
    setCategoryKey(nextCat)

    const nextDef = getCategoryDefinition(nextCat)
    if (nextDef?.subcategories?.length) {
      const sub = expense.subcategory as SubcategoryKey | null | undefined
      const ok =
        sub && nextDef.subcategories.some((s) => s.key === sub)
          ? sub
          : nextDef.subcategories[0].key
      setSubKey(ok)
    } else {
      setSubKey(null)
    }

    setCreatedLocal(toDatetimeLocal(expense.createdAt))
  }, [open, expense])

  function handleCategory(next: CategoryKey): void {
    setCategoryKey(next)
    const d = getCategoryDefinition(next)
    if (d?.subcategories?.length) {
      setSubKey(d.subcategories[0].key)
    } else {
      setSubKey(null)
    }
  }

  const canSave = useMemo(() => expense?.id != null, [expense])

  async function handleSave(): Promise<void> {
    if (expense?.id == null) return
    const amount = parseAmountInput(amountRaw)
    if (amount == null) {
      toast.error(ta.invalidAmount, { duration: 4000 })
      return
    }
    const desc = description.trim()
    await db.expenses.where('id').equals(expense.id).modify((r) => {
      r.category = categoryKey
      r.subcategory = subs?.length && subKey ? subKey : null
      r.amount = amount
      r.createdAt = fromDatetimeLocal(createdLocal)
      if (desc) r.description = desc
      else delete r.description
    })
    toast.success(ta.expenseUpdated, { duration: 2800 })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto rounded-3xl sm:max-w-md">
        <DialogHeader className="space-y-2 text-start">
          <DialogTitle className="text-balance text-lg leading-snug font-semibold">
            {ta.editExpenseTitle}
          </DialogTitle>
          <DialogDescription className="text-pretty text-sm leading-relaxed">
            {ta.editExpenseHint}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <Label htmlFor="edit-amt">{ta.amount}</Label>
            <Input
              id="edit-amt"
              inputMode="decimal"
              enterKeyHint="done"
              className="mt-1.5 h-14 rounded-2xl border-border/80 text-lg shadow-inner shadow-black/[0.04]"
              value={amountRaw}
              onChange={(e) => setAmountRaw(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-desc">{ta.description}</Label>
            <Textarea
              id="edit-desc"
              rows={2}
              className="mt-1.5 min-h-[4.25rem] rounded-2xl border-border/80 text-base shadow-inner shadow-black/[0.04]"
              placeholder={ta.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-cat">{ta.categories}</Label>
            <select
              id="edit-cat"
              className={selectCls}
              value={categoryKey}
              onChange={(e) => handleCategory(e.target.value as CategoryKey)}
            >
              {CATEGORY_TREE.map((c) => (
                <option key={c.key} value={c.key}>
                  {categoryLabelTamil(c.key)}
                </option>
              ))}
            </select>
          </div>
          {subs?.length ? (
            <div>
              <Label htmlFor="edit-sub">{ta.subcategories}</Label>
              <select
                id="edit-sub"
                className={selectCls}
                value={subKey ?? subs[0].key}
                onChange={(e) => setSubKey(e.target.value as SubcategoryKey)}
              >
                {subs.map((s) => (
                  <option key={s.key} value={s.key}>
                    {subcategoryLabelTamil(s.key)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            <Label htmlFor="edit-when">{ta.editExpenseDateLabel}</Label>
            <Input
              id="edit-when"
              type="datetime-local"
              className="mt-1.5 h-12 rounded-2xl border-border/80 shadow-inner shadow-black/[0.04]"
              value={createdLocal}
              onChange={(e) => setCreatedLocal(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {ta.cancel}
          </Button>
          <Button type="button" className="h-11 px-6 text-base" disabled={!canSave} onClick={handleSave}>
            {ta.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
