import { useEffect, useRef, useState } from 'react'
import { CalendarDays, FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { ExpenseRecord } from '@/db/dexie'
import { downloadExpenseStatementPdf } from '@/services/downloadExpenseStatement'
import { toast } from 'sonner'
import { ta } from '@/translations/ta'
import { localDayKey } from '@/utils/dates'
import { filterExpensesByDateRange } from '@/utils/expenseFiltering'

const fieldCls = 'space-y-1.5'
const labelCls = 'text-sm font-medium text-foreground'
const dateControlCls =
  'flex h-12 w-full min-w-0 rounded-2xl border border-input bg-[color-mix(in_srgb,var(--background)_55%,var(--card)_45%)] px-3 py-2 pr-11 text-base font-medium text-foreground shadow-inner shadow-black/[0.03] transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:outline-none disabled:opacity-60 date-picker-control appearance-none'
const dateTriggerBtnCls =
  'absolute inset-y-1 right-1 flex w-9 items-center justify-center rounded-xl text-muted-foreground/80 transition-colors hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25'

function defaultStartDayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function defaultEndDayKey(): string {
  return localDayKey(Date.now())
}

interface ExpenseStatementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenses: ExpenseRecord[]
}

export function ExpenseStatementDialog({
  open,
  onOpenChange,
  expenses,
}: ExpenseStatementDialogProps) {
  const startRef = useRef<HTMLInputElement | null>(null)
  const endRef = useRef<HTMLInputElement | null>(null)
  const [startDayKey, setStartDayKey] = useState(defaultStartDayKey)
  const [endDayKey, setEndDayKey] = useState(defaultEndDayKey)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!open) return
    setStartDayKey(defaultStartDayKey())
    setEndDayKey(defaultEndDayKey())
  }, [open])

  async function handleDownload(): Promise<void> {
    if (!startDayKey || !endDayKey) {
      toast.error(ta.statementMissingDates)
      return
    }
    if (startDayKey > endDayKey) {
      toast.error(ta.statementInvalidRange)
      return
    }

    const inRange = filterExpensesByDateRange(expenses, startDayKey, endDayKey)
    if (inRange.length === 0) {
      toast(ta.statementNoExpenses, {
        duration: 3400,
        description: ta.statementNoExpensesHint,
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
      return
    }

    setGenerating(true)
    try {
      await downloadExpenseStatementPdf(inRange, startDayKey, endDayKey, expenses)
      toast.success(ta.statementSuccess)
      onOpenChange(false)
    } catch (err) {
      console.error('[statement-pdf]', err)
      toast.error(ta.statementDownloadError)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,640px)] w-[calc(100%-1.5rem)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b border-border/50 bg-[color-mix(in_srgb,var(--card)_90%,var(--palette-soft)_10%)] px-5 pb-4 pt-5">
          <DialogTitle className="flex items-start gap-3 pr-8 text-left text-lg leading-snug">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/11 text-primary">
              <FileDown className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 pt-0.5">{ta.statementDialogTitle}</span>
          </DialogTitle>
          <DialogDescription className="pl-[3.25rem] text-left text-sm leading-relaxed">
            {ta.statementDialogHint}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              id="stmt-start"
              label={ta.statementStartDate}
              value={startDayKey}
              disabled={generating}
              inputRef={startRef}
              onChange={setStartDayKey}
            />
            <DateField
              id="stmt-end"
              label={ta.statementEndDate}
              value={endDayKey}
              disabled={generating}
              inputRef={endRef}
              onChange={setEndDayKey}
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 !flex-row !justify-stretch gap-2 border-t border-border/50 bg-muted/20 px-5 py-4 sm:!justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-2xl sm:flex-none sm:min-w-[7rem]"
            disabled={generating}
            onClick={() => onOpenChange(false)}
          >
            {ta.cancel}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 rounded-2xl sm:flex-none sm:min-w-[10.5rem]"
            disabled={generating}
            onClick={() => void handleDownload()}
          >
            {generating ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {ta.statementGenerating}
              </>
            ) : (
              <>
                <FileDown className="size-4" aria-hidden />
                {ta.statementDownload}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DateField({
  id,
  label,
  value,
  disabled,
  inputRef,
  onChange,
}: {
  id: string
  label: string
  value: string
  disabled: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (value: string) => void
}) {
  return (
    <div className={fieldCls}>
      <Label htmlFor={id} className={labelCls}>
        {label}
      </Label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="date"
          className={dateControlCls}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={dateTriggerBtnCls}
          aria-label={label}
          disabled={disabled}
          onClick={() => {
            inputRef.current?.showPicker?.()
            inputRef.current?.focus()
          }}
        >
          <CalendarDays className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
