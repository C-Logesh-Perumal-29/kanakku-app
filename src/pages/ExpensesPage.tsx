import { useMemo, useState } from 'react'
import {
  ArrowDownWideNarrow,
  CalendarDays,
  LayoutGrid,
  List,
  Receipt,
  Search,
  SearchX,
  SlidersHorizontal,
} from 'lucide-react'
import { ExpenseDeleteDialog } from '@/components/expense/ExpenseDeleteDialog'
import { ExpenseEditDialog } from '@/components/expense/ExpenseEditDialog'
import { ExpenseRow } from '@/components/expense/ExpenseRow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ExpenseRecord } from '@/db/dexie'
import { CATEGORY_TREE, categoryLabelTamil, type CategoryKey } from '@/domain/categories'
import { useLiveExpenses } from '@/hooks/useLiveData'
import { ta } from '@/translations/ta'
import { formatInr } from '@/utils/currency'
import {
  type ExpenseSort,
  filterExpenses,
  insightsForFiltered,
  sortExpenses,
  tamilMonthLabelFromKey,
  uniqueExpenseMonthKeys,
} from '@/utils/expenseFiltering'

const SORT_OPTIONS: { value: ExpenseSort; label: string }[] = [
  { value: 'newest', label: ta.sortNewest },
  { value: 'oldest', label: ta.sortOldest },
  { value: 'amount_high', label: ta.sortAmountHigh },
  { value: 'amount_low', label: ta.sortAmountLow },
]

const selectCls =
  'mt-1.5 flex h-12 w-full min-w-0 rounded-2xl border border-input bg-[color-mix(in_srgb,var(--background)_55%,var(--card)_45%)] px-3 py-2 text-base font-medium text-foreground shadow-inner shadow-black/[0.03] transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none disabled:opacity-60'

export function ExpensesPage() {
  const all = useLiveExpenses()
  const [monthKey, setMonthKey] = useState<string | 'all'>('all')
  const [categoryKey, setCategoryKey] = useState<CategoryKey | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ExpenseSort>('newest')
  const [editTarget, setEditTarget] = useState<ExpenseRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRecord | null>(null)

  const months = useMemo(() => (all ? uniqueExpenseMonthKeys(all) : []), [all])

  const filteredSorted = useMemo(() => {
    if (!all) return []
    const f = filterExpenses(all, { monthKey, categoryKey, search })
    return sortExpenses(f, sort)
  }, [all, monthKey, categoryKey, search, sort])

  const insights = useMemo(
    () =>
      insightsForFiltered(filteredSorted, categoryKey === 'all'),
    [filteredSorted, categoryKey],
  )

  if (all == null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <div className="size-12 animate-pulse rounded-2xl bg-primary/15" />
        <p className="text-sm text-muted-foreground">…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-5 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-border/55 bg-card px-4 py-5 shadow-[var(--card-shadow)]">
        <div className="pointer-events-none absolute -left-6 -top-10 size-36 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -right-4 size-28 rounded-full bg-aesthetic-bloom/25 blur-2xl" />
        <div className="relative">
          <h2 className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/11 text-primary [&_svg]:size-5">
              <Receipt aria-hidden />
            </span>
            {ta.expensesPageTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ta.expensesPageSubtitle}</p>
        </div>
      </div>

      <Card className="border-border/60 bg-[color-mix(in_srgb,var(--card)_92%,var(--palette-soft)_8%)]">
        <CardHeader className="pb-2">
          <CardTitle className="inline-flex items-center gap-2 text-base font-semibold">
            <SlidersHorizontal className="size-4 shrink-0 text-primary" aria-hidden />
            {ta.filtersCardTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="f-month" className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden />
              {ta.filterMonth}
            </Label>
            <select
              id="f-month"
              className={selectCls}
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value === 'all' ? 'all' : e.target.value)}
            >
              <option value="all">{ta.filterAllMonths}</option>
              {months.map((mk) => (
                <option key={mk} value={mk}>
                  {tamilMonthLabelFromKey(mk)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="f-cat" className="inline-flex items-center gap-1.5">
              <LayoutGrid className="size-3.5 text-muted-foreground" aria-hidden />
              {ta.filterCategory}
            </Label>
            <select
              id="f-cat"
              className={selectCls}
              value={categoryKey}
              onChange={(e) =>
                setCategoryKey(e.target.value === 'all' ? 'all' : (e.target.value as CategoryKey))
              }
            >
              <option value="all">{ta.filterAllCategories}</option>
              {CATEGORY_TREE.map((c) => (
                <option key={c.key} value={c.key}>
                  {categoryLabelTamil(c.key)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="f-q" className="inline-flex items-center gap-1.5">
              <Search className="size-3.5 text-muted-foreground" aria-hidden />
              {ta.searchPlaceholder}
            </Label>
            <input
              id="f-q"
              type="search"
              enterKeyHint="search"
              placeholder={ta.searchPlaceholder}
              className={selectCls}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="f-sort" className="inline-flex items-center gap-1.5">
              <ArrowDownWideNarrow className="size-3.5 text-muted-foreground" aria-hidden />
              {ta.filterSort}
            </Label>
            <select
              id="f-sort"
              className={selectCls}
              value={sort}
              onChange={(e) => setSort(e.target.value as ExpenseSort)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <InsightMini title={ta.insightTotalFiltered} value={formatInr(insights.total)} />
        <InsightMini title={ta.insightCount} value={`${insights.count}`} />
        <InsightMini title={ta.insightAverage} value={formatInr(Math.round(insights.avg))} />
        <InsightMini
          title={ta.insightHighest}
          value={insights.highest ? formatInr(insights.highest.amount) : '—'}
          hint={insights.highest?.labelTamil}
        />
      </div>

      {insights.topCategories.length > 0 ? (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{ta.insightTopCategories}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {insights.topCategories.map((row) => (
              <div
                key={row.key}
                className="rounded-2xl border border-primary/18 bg-primary/6 px-3 py-2.5 text-xs font-medium text-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <span className="block max-w-[10rem] truncate sm:max-w-none">{row.labelTamil}</span>
                <span className="font-bold tabular-nums text-primary">{formatInr(row.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="min-h-0 flex-1">
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <List className="size-4 shrink-0 text-primary" aria-hidden />
          {ta.expensesListHeading}
        </p>
        <Card className="overflow-hidden border-border/60">
          <CardContent className="p-0">
            {filteredSorted.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
                  <SearchX className="size-7" aria-hidden />
                </div>
                <p className="max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
                  {ta.noMatchingExpenses}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[min(52dvh,420px)] touch-pan-y sm:h-[min(56dvh,480px)]">
                <ul className="divide-y divide-border/70 px-3 py-1">
                  {filteredSorted.map((e) => (
                    <ExpenseRow
                      key={e.id ?? `${e.createdAt}-${e.category}`}
                      expense={e}
                      editLabelTamil={ta.ariaEditExpense}
                      deleteLabelTamil={ta.ariaDeleteExpense}
                      onEdit={(row) => setEditTarget(row)}
                      onDelete={(row) => setDeleteTarget(row)}
                    />
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <ExpenseEditDialog
        open={editTarget != null}
        expense={editTarget}
        onOpenChange={(next) => {
          if (!next) setEditTarget(null)
        }}
      />
      <ExpenseDeleteDialog
        open={deleteTarget != null}
        expense={deleteTarget}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
      />
    </div>
  )
}

function InsightMini({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 border-l-[3px] border-l-primary/45 bg-[color-mix(in_srgb,var(--card)_88%,var(--secondary)_12%)] px-3 py-3 shadow-sm transition-transform hover:-translate-y-0.5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-1.5 text-base font-bold tabular-nums text-foreground">{value}</p>
      {hint ? (
        <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-snug text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
