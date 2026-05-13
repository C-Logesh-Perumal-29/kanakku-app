import { useRef, useState } from 'react'
import { CalendarRange, Coins, Download, Sun, Trophy, Upload } from 'lucide-react'
import { AvailableAmountDialog } from '@/components/dashboard/AvailableAmountDialog'
import { ExpenseDeleteDialog } from '@/components/expense/ExpenseDeleteDialog'
import { ExpenseEditDialog } from '@/components/expense/ExpenseEditDialog'
import { RecentExpenseList } from '@/components/dashboard/RecentExpenseList'
import { SummaryStatCard } from '@/components/dashboard/SummaryStatCard'
import {
  CategoryPieChart,
  DailySpendChart,
  MonthlyTrendChart,
} from '@/components/charts/ExpenseCharts'
import { Button } from '@/components/ui/button'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import type { ExpenseRecord } from '@/db/dexie'
import { categoryLabelTamil } from '@/domain/categories'
import { useLiveExpenses, useLiveSettings } from '@/hooks/useLiveData'
import { downloadBackupFile, exportBackupJson, importBackupJson } from '@/services/backup'
import { ta } from '@/translations/ta'
import { formatInr } from '@/utils/currency'
import { fontScaleForLevel } from '@/utils/fontSize'
import {
  dailyOverview,
  monthTotal,
  monthlyTrend,
  pieDataThisMonth,
  recentExpenses,
  sumAmount,
  todayTotal,
  topCategoryThisMonth,
} from '@/utils/expenseStats'

export function DashboardPage() {
  const expenses = useLiveExpenses()
  const settings = useLiveSettings()
  const [editOpen, setEditOpen] = useState(false)
  const [editExpenseTarget, setEditExpenseTarget] = useState<ExpenseRecord | null>(null)
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState<ExpenseRecord | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement | null>(null)

  if (expenses == null || settings == null) {
    return <LoadingScreen />
  }

  const totalExpenseAllTime = sumAmount(expenses)
  const remaining = settings.currentAvailableAmount - totalExpenseAllTime
  const fontScale = fontScaleForLevel(settings.fontSizeLevel)

  const top = topCategoryThisMonth(expenses)
  const topLabel = top ? categoryLabelTamil(top.key) : ta.noneYet
  const topValue = top ? formatInr(top.total) : '—'

  const pie = pieDataThisMonth(expenses)
  const trend = monthlyTrend(expenses, 6)
  const daily = dailyOverview(expenses, 7)

  const latest = recentExpenses(expenses, 5)

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          role="status"
          className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <section className="rounded-2xl border border-border/60 bg-[color-mix(in_srgb,var(--card)_90%,transparent)] p-3 shadow-sm backdrop-blur-sm">
        <p className="mb-2.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {ta.backupSection}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl gap-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:border-primary/35 hover:bg-aesthetic-soft/80 hover:shadow-md"
            onClick={async () => {
              const data = await exportBackupJson()
              downloadBackupFile(data)
            }}
          >
            <Download className="size-4 shrink-0 opacity-90" aria-hidden />
            {ta.exportBackup}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11 flex-1 rounded-xl gap-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-aesthetic-bloom/55 hover:text-foreground hover:shadow-md"
            onClick={() => importRef.current?.click()}
          >
            <Upload className="size-4 shrink-0 opacity-90" aria-hidden />
            {ta.importBackup}
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              try {
                const text = await file.text()
                await importBackupJson(text)
                setToast(ta.importSuccess)
                window.setTimeout(() => setToast(null), 2600)
              } catch {
                setToast(ta.importError)
                window.setTimeout(() => setToast(null), 3600)
              }
            }}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="px-0.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {ta.analytics}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <SummaryStatCard
            titleTamil={ta.todayExpense}
            value={formatInr(todayTotal(expenses))}
            icon={<Sun />}
          />
          <SummaryStatCard
            titleTamil={ta.monthExpense}
            value={formatInr(monthTotal(expenses))}
            icon={<CalendarRange />}
          />
          <SummaryStatCard
            titleTamil={ta.remainingAmount}
            value={formatInr(remaining)}
            hintTamil={ta.editAvailableHint}
            onClick={() => setEditOpen(true)}
            icon={<Coins />}
            className="border-primary/35"
          />
          <SummaryStatCard
            titleTamil={ta.topCategoryMonth}
            value={topValue}
            hintTamil={topLabel}
            icon={<Trophy />}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="px-0.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {ta.chartInsightsHeading}
        </h2>
        <div className="grid gap-5">
        <CategoryPieChart titleTamil={ta.chartCategoryPie} emptyTamil={ta.noData} data={pie} fontScale={fontScale} />
        <MonthlyTrendChart titleTamil={ta.chartMonthlyTrend} emptyTamil={ta.noData} data={trend} fontScale={fontScale} />
        <DailySpendChart titleTamil={ta.chartDailyOverview} emptyTamil={ta.noData} data={daily} fontScale={fontScale} />
        </div>
      </section>

      <RecentExpenseList
        titleTamil={ta.recentExpenses}
        emptyTamil={ta.noneYet}
        items={latest}
        viewAllHref="/expenses"
        viewAllLabelTamil={ta.viewAllExpenses}
        editLabelTamil={ta.ariaEditExpense}
        deleteLabelTamil={ta.ariaDeleteExpense}
        onEditExpense={(e) => setEditExpenseTarget(e)}
        onDeleteExpense={(e) => setDeleteExpenseTarget(e)}
      />

      <AvailableAmountDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        currentAmount={settings.currentAvailableAmount}
        titleTamil={ta.editAvailableTitle}
        descriptionTamil={ta.editAvailableHint}
        labelTamil={ta.availableAmountLabel}
        saveTamil={ta.save}
        cancelTamil={ta.cancel}
      />

      <ExpenseEditDialog
        open={editExpenseTarget != null}
        expense={editExpenseTarget}
        onOpenChange={(next) => {
          if (!next) setEditExpenseTarget(null)
        }}
      />
      <ExpenseDeleteDialog
        open={deleteExpenseTarget != null}
        expense={deleteExpenseTarget}
        onOpenChange={(next) => {
          if (!next) setDeleteExpenseTarget(null)
        }}
      />
    </div>
  )
}
