import { useMemo, useRef, useState } from 'react'
import {
  ArrowDownWideNarrow,
  CalendarDays,
  ChevronDown,
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ExpenseRecord } from '@/db/dexie'
import { CATEGORY_TREE, categoryLabelTamil, type CategoryKey } from '@/domain/categories'
import { useLiveExpenses } from '@/hooks/useLiveData'
import { toast } from 'sonner'
import { ta } from '@/translations/ta'
import { formatInr } from '@/utils/currency'
import { localDayKey } from '@/utils/dates'
import {
  type ExpenseSort,
  filterExpenses,
  insightsForFiltered,
  sortExpenses,
} from '@/utils/expenseFiltering'

const SORT_OPTIONS: { value: ExpenseSort; label: string }[] = [
  { value: 'newest', label: ta.sortNewest },
  { value: 'oldest', label: ta.sortOldest },
  { value: 'amount_high', label: ta.sortAmountHigh },
  { value: 'amount_low', label: ta.sortAmountLow },
]

const selectCls =
  'mt-1.5 flex h-12 w-full min-w-0 rounded-2xl border border-input bg-[color-mix(in_srgb,var(--background)_55%,var(--card)_45%)] px-3 py-2 text-base font-medium text-foreground shadow-inner shadow-black/[0.03] transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none disabled:opacity-60'
const controlCls = `${selectCls} mt-0`
const fieldCls = 'space-y-1.5'
const labelRowCls = 'flex min-h-6 items-center justify-between gap-2'
const labelTextCls = 'inline-flex items-center gap-2'
const labelIconCls = 'flex size-4 shrink-0 items-center justify-center text-muted-foreground'
const selectControlCls = `${controlCls} appearance-none pr-11`
const dateControlCls = `${controlCls} date-picker-control appearance-none pr-11`
const trailingIconCls =
  'pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground/80'
const dateTriggerBtnCls =
  'absolute inset-y-1 right-1 flex w-9 items-center justify-center rounded-xl text-muted-foreground/80 transition-colors hover:bg-primary/8 hover:text-primary focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none'

export function ExpensesPage() {
  const all = useLiveExpenses()
  const dayInputRef = useRef<HTMLInputElement | null>(null)
  const [dayKey, setDayKey] = useState<string | 'all'>('all')
  const [categoryKey, setCategoryKey] = useState<CategoryKey | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ExpenseSort>('newest')
  const [editTarget, setEditTarget] = useState<ExpenseRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRecord | null>(null)

  const filteredSorted = useMemo(() => {
    if (!all) return []
    const f = filterExpenses(all, { monthKey: 'all', dayKey, categoryKey, search })
    return sortExpenses(f, sort)
  }, [all, dayKey, categoryKey, search, sort])

  const insights = useMemo(
    () =>
      insightsForFiltered(filteredSorted, categoryKey === 'all'),
    [filteredSorted, categoryKey],
  )

  if (all == null) {
    return <LoadingScreen />
  }

  const expenses = all

  function handleDayChange(raw: string): void {
    const nextDayKey = raw || 'all'
    setDayKey(nextDayKey)

    if (raw) {
      if (!expenses.some((e) => localDayKey(e.createdAt) === raw)) {
        toast(ta.noExpensesSelectedDay, {
          duration: 3400,
          description: ta.noExpensesSelectedDayHint,
          icon: (
            <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <CalendarDays className="size-4" aria-hidden />
            </span>
          ),
          classNames: {
            toast:
              '!rounded-3xl !border !border-primary/18 !bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_94%,white_6%),color-mix(in_srgb,var(--palette-soft)_56%,white_44%))] !p-4 !shadow-[0_14px_40px_rgba(214,95,164,0.18)]',
            title: '!text-[0.95rem] !font-semibold !text-foreground',
            description: '!text-sm !leading-relaxed !text-muted-foreground',
          },
        })
      }
    }
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
        <CardContent className="grid items-start gap-4 sm:grid-cols-2">
          <div className={fieldCls}>
            <div className={labelRowCls}>
              <Label htmlFor="f-day" className={labelTextCls}>
                <span className={labelIconCls} aria-hidden>
                  <CalendarDays className="size-3.5" />
                </span>
                {ta.filterDate}
              </Label>
              {dayKey !== 'all' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="text-primary hover:bg-primary/8 hover:text-primary"
                  onClick={() => handleDayChange('')}
                >
                  {ta.clear}
                </Button>
              ) : (
                <span className="h-6" aria-hidden />
              )}
            </div>
            <div className="relative">
              <input
                ref={dayInputRef}
                id="f-day"
                type="date"
                className={dateControlCls}
                value={dayKey === 'all' ? '' : dayKey}
                onChange={(e) => handleDayChange(e.target.value)}
              />
              <button
                type="button"
                className={dateTriggerBtnCls}
                aria-label={ta.filterDate}
                onClick={() => {
                  dayInputRef.current?.showPicker?.()
                  dayInputRef.current?.focus()
                }}
              >
                <CalendarDays className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          <div className={fieldCls}>
            <div className={labelRowCls}>
              <Label htmlFor="f-cat" className={labelTextCls}>
                <span className={labelIconCls} aria-hidden>
                  <LayoutGrid className="size-3.5" />
                </span>
                {ta.filterCategory}
              </Label>
              <span className="h-6" aria-hidden />
            </div>
            <div className="relative">
              <select
                id="f-cat"
                className={selectControlCls}
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
              <span className={trailingIconCls} aria-hidden>
                <ChevronDown className="size-4" />
              </span>
            </div>
          </div>
          <div className={`${fieldCls} sm:col-span-2`}>
            <div className={labelRowCls}>
              <Label htmlFor="f-q" className={labelTextCls}>
                <span className={labelIconCls} aria-hidden>
                  <Search className="size-3.5" />
                </span>
                {ta.searchPlaceholder}
              </Label>
            </div>
            <Input
              id="f-q"
              type="search"
              enterKeyHint="search"
              placeholder={ta.searchPlaceholder}
              className={controlCls}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          <div className={`${fieldCls} sm:col-span-2`}>
            <div className={labelRowCls}>
              <Label htmlFor="f-sort" className={labelTextCls}>
                <span className={labelIconCls} aria-hidden>
                  <ArrowDownWideNarrow className="size-3.5" />
                </span>
                {ta.filterSort}
              </Label>
            </div>
            <div className="relative">
              <select
                id="f-sort"
                className={selectControlCls}
                value={sort}
                onChange={(e) => setSort(e.target.value as ExpenseSort)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className={trailingIconCls} aria-hidden>
                <ChevronDown className="size-4" />
              </span>
            </div>
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
