import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategoryVisualCard } from '@/components/expense/CategoryVisualCard'
import { ExpenseFlowBreadcrumb } from '@/components/expense/ExpenseFlowBreadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/db/dexie'
import {
  CATEGORY_TREE,
  categoryLabelTamil,
  type CategoryDef,
  type CategoryKey,
  type SubcategoryDef,
  type SubcategoryKey,
  getCategoryDefinition,
  subcategoryLabelTamil,
} from '@/domain/categories'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ta } from '@/translations/ta'
import { parseAmountInput } from '@/utils/currency'

export type AddExpenseStep =
  | { name: 'category' }
  | { name: 'subcategory'; category: CategoryDef }
  | { name: 'details'; category: CategoryKey; subcategory: SubcategoryKey | null }

type Step = AddExpenseStep

function stepIndex(s: Step): number {
  if (s.name === 'category') return 0
  if (s.name === 'subcategory') return 1
  return 2
}

export function AddExpensePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>({ name: 'category' })
  const [amountRaw, setAmountRaw] = useState('')
  const [description, setDescription] = useState('')

  const title = useMemo(() => {
    if (step.name === 'category') return ta.chooseCategoryStep
    if (step.name === 'subcategory') return ta.chooseSubcategoryStep
    return ta.expenseDetailsStep
  }, [step])

  const activeIdx = stepIndex(step)

  async function saveExpense(): Promise<void> {
    if (step.name !== 'details') return
    const amount = parseAmountInput(amountRaw)
    if (amount == null) {
      toast.error(ta.invalidAmount, { duration: 4000 })
      return
    }
    await db.expenses.add({
      category: step.category,
      subcategory: step.subcategory,
      amount,
      description: description.trim() ? description.trim() : undefined,
      createdAt: Date.now(),
    })
    toast.success(ta.expenseSaved, { duration: 2800 })
    navigate('/')
  }

  function goBackFromDetails(): void {
    if (step.name !== 'details') return
    const def = getCategoryDefinition(step.category)
    if (def?.subcategories?.length) {
      setStep({ name: 'subcategory', category: def })
      return
    }
    setStep({ name: 'category' })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ExpenseFlowBreadcrumb
          step={step}
          onGoCategoryStep={() => setStep({ name: 'category' })}
          onGoSubcategoryStep={(def) => setStep({ name: 'subcategory', category: def })}
        />

        <div
          className="flex justify-center gap-2 pt-0.5"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 ease-out',
                i === activeIdx
                  ? 'w-9 bg-primary shadow-sm shadow-primary/35'
                  : i < activeIdx
                    ? 'w-1.5 bg-primary/35'
                    : 'w-1.5 bg-muted-foreground/15',
              )}
            />
          ))}
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-primary/12 bg-linear-to-br from-card via-card to-primary/[0.07] p-4 shadow-[var(--card-shadow)]">
          <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-primary/10 blur-3xl" />
          <p className="relative text-[0.9375rem] font-semibold leading-snug text-foreground">
            {title}
          </p>
        </div>
      </div>

      {step.name === 'category' ? (
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORY_TREE.map((c) => (
            <CategoryVisualCard
              key={c.key}
              labelTamil={categoryLabelTamil(c.key)}
              imageKey={c.imageKey}
              onClick={() => {
                if (c.subcategories?.length) {
                  setStep({ name: 'subcategory', category: c })
                } else {
                  setStep({ name: 'details', category: c.key, subcategory: null })
                }
              }}
            />
          ))}
        </div>
      ) : null}

      {step.name === 'subcategory' ? (
        <div className="space-y-4">
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
            {(step.category.subcategories ?? []).map((s: SubcategoryDef) => (
              <CategoryVisualCard
                key={s.key}
                labelTamil={subcategoryLabelTamil(s.key)}
                imageKey={s.imageKey}
                onClick={() =>
                  setStep({
                    name: 'details',
                    category: step.category.key,
                    subcategory: s.key,
                  })
                }
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-2xl text-base shadow-sm"
            onClick={() => setStep({ name: 'category' })}
          >
            {ta.back}
          </Button>
        </div>
      ) : null}

      {step.name === 'details' ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-border/70 bg-[color-mix(in_srgb,var(--card)_94%,var(--palette-soft)_6%)] p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {ta.categories}
            </p>
            <p className="mt-1.5 text-lg font-bold leading-snug text-foreground">
              {categoryLabelTamil(step.category)}
              {step.subcategory ? ` · ${subcategoryLabelTamil(step.subcategory)}` : ''}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amt" className="text-base font-medium">
              {ta.amount}
            </Label>
            <Input
              id="amt"
              inputMode="decimal"
              enterKeyHint="done"
              placeholder={ta.amountPlaceholder}
              className="h-[4.25rem] rounded-3xl border-border/80 bg-[color-mix(in_srgb,var(--background)_70%,var(--card)_30%)] px-4 text-2xl font-semibold tracking-tight shadow-inner shadow-black/[0.03] focus-visible:border-primary/50 focus-visible:ring-primary/25"
              value={amountRaw}
              onChange={(e) => setAmountRaw(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-base font-medium">
              {ta.description}
            </Label>
            <Textarea
              id="note"
              rows={3}
              placeholder={ta.descriptionPlaceholder}
              className="rounded-3xl border-border/80 bg-[color-mix(in_srgb,var(--background)_70%,var(--card)_30%)] px-4 py-3 text-base shadow-inner shadow-black/[0.03] focus-visible:border-primary/50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-14 rounded-2xl text-base shadow-sm"
              onClick={goBackFromDetails}
            >
              {ta.back}
            </Button>
            <Button type="button" className="h-14 rounded-2xl text-base shadow-md" onClick={saveExpense}>
              {ta.save}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
