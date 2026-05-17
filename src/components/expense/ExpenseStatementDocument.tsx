import { useMemo } from 'react'
import type { ExpenseRecord } from '@/db/dexie'
import {
  expenseDisplayLabel,
  type CategoryKey,
  getCategoryDefinition,
} from '@/domain/categories'
import { ta } from '@/translations/ta'
import { formatInr } from '@/utils/currency'
import {
  insightsForFiltered,
  sortExpenses,
  tamilDayLabelFromKey,
} from '@/utils/expenseFiltering'
import {
  formatStatementDate,
  formatStatementDateTime,
  paginateExpenseRows,
  statementReportId,
  type StatementMeta,
} from '@/utils/statementMeta'
import { STATEMENT_FONT_FAMILY } from '@/utils/statementFonts'

const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
const PAGE_PAD_X = 40
const PAGE_PAD_Y = 36
const FIRST_PAGE_ROWS = 9
const NEXT_PAGE_ROWS = 15

const INK = '#352830'
const MUTED = '#6a5564'
const PRIMARY = '#c55d9f'
const WASH = '#fdf5fb'
const BORDER = '#e9c4dc'
const CARD = '#fffefa'

const pageShell: React.CSSProperties = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
  boxSizing: 'border-box',
  padding: `${PAGE_PAD_Y}px ${PAGE_PAD_X}px`,
  fontFamily: STATEMENT_FONT_FAMILY,
  fontFeatureSettings: '"liga" 1, "kern" 1',
  fontSize: '13px',
  lineHeight: 1.5,
  color: INK,
  background: WASH,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

function formatExpenseDateTime(ms: number): string {
  const d = new Date(ms)
  const day = d.toLocaleDateString('ta-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const time = d.toLocaleTimeString('ta-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return `${day}, ${time}`
}

function expenseRowLabel(e: ExpenseRecord): string {
  const def = getCategoryDefinition(e.category as CategoryKey)
  if (def) {
    return expenseDisplayLabel(e.category as CategoryKey, e.subcategory)
  }
  return e.category
}

export interface ExpenseStatementDocumentProps {
  expenses: ExpenseRecord[]
  startDayKey: string
  endDayKey: string
  logoSrc: string
  meta: StatementMeta
}

export function ExpenseStatementDocument({
  expenses,
  startDayKey,
  endDayKey,
  logoSrc,
  meta,
}: ExpenseStatementDocumentProps) {
  const rows = useMemo(() => sortExpenses(expenses, 'oldest'), [expenses])
  const insights = useMemo(() => insightsForFiltered(rows, true), [rows])
  const rowPages = useMemo(
    () => paginateExpenseRows(rows, FIRST_PAGE_ROWS, NEXT_PAGE_ROWS),
    [rows],
  )
  const totalPages = rowPages.length
  const periodLabel = `${tamilDayLabelFromKey(startDayKey)} — ${tamilDayLabelFromKey(endDayKey)}`
  const reportId = statementReportId(startDayKey, endDayKey)
  const generatedLabel = formatStatementDateTime(meta.generatedAt)
  const appStartedLabel = formatStatementDate(meta.appStartedAt)

  return (
    <div lang="ta" data-statement-root style={{ width: PAGE_WIDTH, background: WASH }}>
      {rowPages.map((pageRows, pageIndex) => {
        const isFirst = pageIndex === 0
        const isLast = pageIndex === totalPages - 1
        const pageNum = pageIndex + 1

        return (
          <article
            key={`page-${pageIndex}`}
            data-statement-page
            style={pageShell}
          >
            <StatementHeader
              logoSrc={logoSrc}
              isFirst={isFirst}
              pageNum={pageNum}
              totalPages={totalPages}
              periodLabel={periodLabel}
              reportId={reportId}
              appStartedLabel={appStartedLabel}
              generatedLabel={generatedLabel}
            />

            {isFirst ? (
              <>
                <SummaryStrip insights={insights} availableBalance={meta.availableBalance} />
                {insights.topCategories.length > 0 ? (
                  <TopCategoriesStrip categories={insights.topCategories} />
                ) : null}
                {insights.highest ? (
                  <HighestExpenseStrip
                    label={insights.highest.labelTamil}
                    amount={insights.highest.amount}
                  />
                ) : null}
              </>
            ) : (
              <ContinuedBanner pageNum={pageNum} periodLabel={periodLabel} />
            )}

            <ExpenseTable
              rows={pageRows}
              showHeader
              showFooter={isLast}
              total={insights.total}
              flexGrow
            />

            <PageFooter
              pageNum={pageNum}
              totalPages={totalPages}
              generatedLabel={isLast ? generatedLabel : undefined}
            />
          </article>
        )
      })}
    </div>
  )
}

function StatementHeader({
  logoSrc,
  isFirst,
  pageNum,
  totalPages,
  periodLabel,
  reportId,
  appStartedLabel,
  generatedLabel,
}: {
  logoSrc: string
  isFirst: boolean
  pageNum: number
  totalPages: number
  periodLabel: string
  reportId: string
  appStartedLabel: string
  generatedLabel: string
}) {
  return (
    <header style={{ flexShrink: 0, marginBottom: isFirst ? 18 : 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
          <div
            style={{
              flexShrink: 0,
              width: isFirst ? 68 : 48,
              height: isFirst ? 68 : 48,
              borderRadius: isFirst ? 18 : 14,
              overflow: 'hidden',
              boxShadow: '0 8px 22px rgba(197, 93, 159, 0.28)',
              border: '3px solid #fffefa',
              background: CARD,
            }}
          >
            <img
              src={logoSrc}
              alt=""
              width={isFirst ? 68 : 48}
              height={isFirst ? 68 : 48}
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: isFirst ? 26 : 18,
                fontWeight: 700,
                color: PRIMARY,
                lineHeight: 1.2,
              }}
            >
              {ta.appName}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: isFirst ? 16 : 13, fontWeight: 600 }}>
              {ta.statementTitle}
              {!isFirst ? ` · ${ta.statementContinued}` : ''}
            </p>
            {isFirst ? (
              <p style={{ margin: '5px 0 0', fontSize: 11, color: MUTED }}>
                {ta.statementPeriodLabel}: {periodLabel}
              </p>
            ) : null}
          </div>
        </div>

        <MetaPanel
          appStartedLabel={appStartedLabel}
          generatedLabel={generatedLabel}
          periodLabel={periodLabel}
          reportId={reportId}
          pageNum={pageNum}
          totalPages={totalPages}
          compact={!isFirst}
        />
      </div>
      <div style={{ marginTop: 14, height: 2, borderRadius: 1, background: BORDER }} />
    </header>
  )
}

function MetaPanel({
  appStartedLabel,
  generatedLabel,
  periodLabel,
  reportId,
  pageNum,
  totalPages,
  compact,
}: {
  appStartedLabel: string
  generatedLabel: string
  periodLabel: string
  reportId: string
  pageNum: number
  totalPages: number
  compact: boolean
}) {
  const rows: { label: string; value: string }[] = [
    { label: ta.statementAppStarted, value: appStartedLabel },
    { label: ta.statementReportDate, value: generatedLabel },
    { label: ta.statementReportPeriod, value: periodLabel },
    { label: ta.statementReportId, value: reportId },
    { label: ta.statementPageOf, value: `${pageNum} / ${totalPages}` },
  ]

  return (
    <aside
      style={{
        flexShrink: 0,
        width: compact ? 220 : 248,
        padding: compact ? '10px 12px' : '12px 14px',
        borderRadius: 14,
        background: CARD,
        border: `1px solid ${BORDER}`,
        boxShadow: '0 4px 16px rgba(53, 40, 48, 0.06)',
      }}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: compact ? 6 : 8,
            fontSize: compact ? 9.5 : 10,
            lineHeight: 1.35,
          }}
        >
          <span style={{ color: MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>{row.label}</span>
          <span
            style={{
              color: INK,
              fontWeight: 600,
              textAlign: 'right',
              maxWidth: compact ? 120 : 140,
            }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </aside>
  )
}

function SummaryStrip({
  insights,
  availableBalance,
}: {
  insights: ReturnType<typeof insightsForFiltered>
  availableBalance: number
}) {
  return (
    <section style={{ flexShrink: 0, marginBottom: 14 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        <SummaryBox label={ta.statementSummaryTotal} value={formatInr(insights.total)} accent />
        <SummaryBox label={ta.statementSummaryCount} value={`${insights.count}`} />
        <SummaryBox label={ta.statementSummaryAvg} value={formatInr(Math.round(insights.avg))} />
        <SummaryBox label={ta.statementAvailableBalance} value={formatInr(availableBalance)} />
      </div>
    </section>
  )
}

function TopCategoriesStrip({
  categories,
}: {
  categories: { key: CategoryKey; total: number; labelTamil: string }[]
}) {
  return (
    <section style={{ flexShrink: 0, marginBottom: 12 }}>
      <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: MUTED }}>
        {ta.statementTopCategories}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {categories.slice(0, 5).map((row) => (
          <span
            key={row.key}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(197, 93, 159, 0.1)',
              border: `1px solid ${BORDER}`,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {row.labelTamil}{' '}
            <span style={{ color: PRIMARY }}>{formatInr(row.total)}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function HighestExpenseStrip({ label, amount }: { label: string; amount: number }) {
  return (
    <section
      style={{
        flexShrink: 0,
        marginBottom: 12,
        padding: '10px 14px',
        borderRadius: 12,
        background: CARD,
        border: `1px solid ${BORDER}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: MUTED }}>{ta.statementHighestExpense}</span>
      <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>
        {label}{' '}
        <span style={{ color: PRIMARY }}>{formatInr(amount)}</span>
      </span>
    </section>
  )
}

function ContinuedBanner({ pageNum, periodLabel }: { pageNum: number; periodLabel: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        marginBottom: 12,
        padding: '8px 14px',
        borderRadius: 10,
        background: 'rgba(197, 93, 159, 0.08)',
        border: `1px dashed ${BORDER}`,
        fontSize: 11,
        color: MUTED,
        fontWeight: 600,
      }}
    >
      {ta.statementContinued} · {ta.statementPageOf} {pageNum} · {periodLabel}
    </div>
  )
}

function ExpenseTable({
  rows,
  showHeader,
  showFooter,
  total,
  flexGrow,
}: {
  rows: ExpenseRecord[]
  showHeader: boolean
  showFooter: boolean
  total: number
  flexGrow?: boolean
}) {
  return (
    <section style={{ flexShrink: 0, flexGrow: flexGrow ? 1 : 0, minHeight: 0 }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 11.5,
          background: CARD,
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 14px rgba(53, 40, 48, 0.07)',
          tableLayout: 'fixed',
        }}
      >
        {showHeader ? (
          <thead>
            <tr style={{ background: PRIMARY }}>
              {[
                { h: ta.statementColDate, w: '26%' },
                { h: ta.statementColCategory, w: '30%' },
                { h: ta.statementColDescription, w: '28%' },
                { h: ta.statementColAmount, w: '16%', align: 'right' as const },
              ].map((col) => (
                <th
                  key={col.h}
                  style={{
                    width: col.w,
                    padding: '10px 11px',
                    textAlign: col.align ?? 'left',
                    color: '#fffefa',
                    fontWeight: 700,
                    fontSize: 10.5,
                  }}
                >
                  {col.h}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((e, idx) => (
            <tr
              key={e.id ?? `${e.createdAt}-${e.category}-${idx}`}
              style={{
                background: idx % 2 === 0 ? CARD : '#fdf8fc',
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <td style={{ padding: '9px 11px', verticalAlign: 'top', fontSize: 10.5, lineHeight: 1.4 }}>
                {formatExpenseDateTime(e.createdAt)}
              </td>
              <td
                style={{
                  padding: '9px 11px',
                  verticalAlign: 'top',
                  fontWeight: 600,
                  wordBreak: 'break-word',
                }}
              >
                {expenseRowLabel(e)}
              </td>
              <td
                style={{
                  padding: '9px 11px',
                  verticalAlign: 'top',
                  color: MUTED,
                  fontSize: 10.5,
                  wordBreak: 'break-word',
                }}
              >
                {e.description?.trim() || ta.statementNoDescription}
              </td>
              <td
                style={{
                  padding: '9px 11px',
                  verticalAlign: 'top',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: PRIMARY,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatInr(e.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        {showFooter ? (
          <tfoot>
            <tr style={{ background: '#f0dde8' }}>
              <td
                colSpan={3}
                style={{ padding: '11px', textAlign: 'right', fontWeight: 700, fontSize: 12 }}
              >
                {ta.statementSummaryTotal}
              </td>
              <td
                style={{
                  padding: '11px',
                  textAlign: 'right',
                  fontWeight: 700,
                  fontSize: 14,
                  color: PRIMARY,
                }}
              >
                {formatInr(total)}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </section>
  )
}

function PageFooter({
  pageNum,
  totalPages,
  generatedLabel,
}: {
  pageNum: number
  totalPages: number
  generatedLabel?: string
}) {
  return (
    <footer
      style={{
        flexShrink: 0,
        marginTop: 'auto',
        paddingTop: 14,
        borderTop: `1px solid ${BORDER}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 12,
        fontSize: 10,
        color: MUTED,
      }}
    >
      <span>{ta.statementFooterNote}</span>
      <span style={{ textAlign: 'right' }}>
        {generatedLabel ? (
          <>
            {ta.statementGeneratedAt}: {generatedLabel}
            <br />
          </>
        ) : null}
        {ta.statementPageOf} {pageNum} / {totalPages}
      </span>
    </footer>
  )
}

function SummaryBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      style={{
        padding: '12px 10px',
        borderRadius: 14,
        background: accent ? PRIMARY : CARD,
        border: accent ? 'none' : `1px solid ${BORDER}`,
        boxShadow: accent ? '0 6px 18px rgba(197, 93, 159, 0.22)' : 'none',
        minHeight: 72,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: accent ? 'rgba(255,254,250,0.9)' : MUTED,
          lineHeight: 1.3,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: '5px 0 0',
          fontSize: 17,
          fontWeight: 700,
          color: accent ? '#fffefa' : INK,
          lineHeight: 1.2,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </p>
    </div>
  )
}
