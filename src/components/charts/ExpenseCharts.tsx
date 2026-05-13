import type { ReactNode } from 'react'
import { Activity, BarChart3, PieChart as PieChartGlyph } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ta } from '@/translations/ta'
import type { DailyBucket, MonthlyBucket } from '@/utils/expenseStats'
import { formatInr, formatInrAxisShort } from '@/utils/currency'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface PieDatum {
  id: string
  name: string
  value: number
  fill: string
}

/** Matches light-theme tokens for Recharts inline styles */
const tooltipStyles = {
  borderRadius: 14,
  border: '1px solid rgba(220,132,185,0.45)',
  background: '#fcf7fb',
  boxShadow: '0 12px 32px rgba(53,40,56,0.1)',
  padding: '10px 12px',
} as const

const tickColor = '#6a5564'
const GRID = '#edd4e8'
const BAR_PRIMARY = '#c55d9f'
const BAR_ALT = '#dc84b9'
const CURSOR_FILL = '#f3d5ea'

/** Top-rounded bars only — flat base on X-axis */
const BAR_RADIUS_TOP: [number, number, number, number] = [12, 12, 0, 0]

const legendChipStyle =
  '[&_.recharts-legend-wrapper]:outline-none [&_li]:!inline-flex [&_li]:!items-center [&_li]:!gap-2 [&_.recharts-legend-item-text]:!text-[0.6875rem] [&_.recharts-legend-item-text]:!leading-snug [&_.recharts-legend-item-text]:!text-muted-foreground'

function ChartShell({
  titleTamil,
  icon,
  children,
}: {
  titleTamil: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <Card className={cn('overflow-hidden transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/28 hover:shadow-lg hover:shadow-primary/8', legendChipStyle)}>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.11] text-primary [&_svg]:size-[1.15rem]"
          aria-hidden
        >
          {icon}
        </div>
        <CardTitle className="pt-1 text-base font-semibold leading-snug">{titleTamil}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/25 py-14 text-center',
      )}
    >
      <div className="size-10 rounded-full bg-muted/50" />
      <p className="max-w-[16rem] text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  )
}

interface PieLegendWithAmountsProps {
  data: PieDatum[]
}

/** Category names + INR amounts aligned with donut colors. */
function PieLegendWithAmounts({ data }: PieLegendWithAmountsProps) {
  return (
    <ul
      aria-label={ta.chartLegendLabel}
      className="mt-2 grid grid-cols-1 gap-2 border-t border-border/50 pt-3 sm:grid-cols-2"
    >
      {data.map((d) => (
        <li
          key={d.id}
          className="flex min-w-0 items-baseline justify-between gap-2 rounded-xl bg-muted/15 px-2.5 py-1.5 text-[0.6875rem] leading-snug"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full ring-1 ring-white shadow-sm"
              style={{ background: d.fill }}
              aria-hidden
            />
            <span className="min-w-0 break-words font-medium text-foreground">{d.name}</span>
          </span>
          <span className="shrink-0 tabular-nums font-semibold text-primary">{formatInr(d.value)}</span>
        </li>
      ))}
    </ul>
  )
}

/** Legend row below bar charts (outside SVG → no overlap with axis labels). */
function BarSeriesLegendTamil({
  dotColor,
  labelTamil,
}: {
  dotColor: string
  labelTamil: string
}) {
  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground">
      <span
        className="inline-block size-3 shrink-0 rounded-[3px] ring-1 ring-black/[0.06]"
        style={{ background: dotColor }}
        aria-hidden
      />
      <span>{labelTamil}</span>
    </div>
  )
}

export function CategoryPieChart({
  titleTamil,
  emptyTamil,
  data,
  fontScale = 1,
}: {
  titleTamil: string
  emptyTamil: string
  data: PieDatum[]
  fontScale?: number
}) {
  const sum = data.reduce((s, d) => s + d.value, 0)

  return (
    <ChartShell titleTamil={titleTamil} icon={<PieChartGlyph strokeWidth={2.25} />}>
      {data.length === 0 ? (
        <EmptyChart message={emptyTamil} />
      ) : (
        <>
          {/* HTML overlay centers totals; avoids stray SVG typography / wedge gaps from padding + thick strokes */}
          <div className="relative mx-auto w-full max-w-[280px]">
            <div className="relative h-[224px] w-full shrink-0 sm:h-[238px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="92%"
                    paddingAngle={0}
                    stroke="transparent"
                    label={false}
                    isAnimationActive={false}
                    cornerRadius={4}
                  >
                    {data.map((slice) => (
                      <Cell key={slice.id} fill={slice.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatInr(Number(value ?? 0))}
                    labelFormatter={(_, payload) =>
                      typeof payload?.[0]?.payload === 'object' &&
                      payload[0]?.payload !== null &&
                      typeof (payload[0].payload as { name?: string }).name === 'string'
                        ? (payload[0].payload as { name: string }).name
                        : ''
                    }
                    contentStyle={tooltipStyles}
                    labelStyle={{ fontWeight: 700, marginBottom: 6 }}
                    itemStyle={{ color: '#352830' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 w-[85%] max-w-[9.5rem] -translate-x-1/2 -translate-y-1/2 text-center"
              aria-hidden
            >
              <p
                className="font-medium leading-tight text-[#6a5564]"
                style={{ fontSize: `${11 * fontScale}px` }}
                lang="ta"
              >
                {ta.chartDonutCenterCaption}
              </p>
              <p className="mt-1 text-[1.0625rem] font-bold tabular-nums leading-none text-[#352830]" lang="ta">
                {formatInr(sum)}
              </p>
            </div>
          </div>

          <PieLegendWithAmounts data={data} />

          <p className="sr-only">
            {[...data.map((d) => `${d.name}: ${formatInr(d.value)}`), `${ta.chartDonutCenterCaption}: ${formatInr(sum)}`].join('; ')}
          </p>
        </>
      )}
    </ChartShell>
  )
}

export function MonthlyTrendChart({
  titleTamil,
  emptyTamil,
  data,
  fontScale = 1,
}: {
  titleTamil: string
  emptyTamil: string
  data: MonthlyBucket[]
  fontScale?: number
}) {
  const hasSpend = data.some((d) => d.total > 0)
  const chartData = data.map((d) => ({
    ...d,
    short: d.labelTamil.replace(/\d+/g, '').trim(),
  }))
  const maxSpend = chartData.reduce((m, d) => Math.max(m, d.total), 0)

  return (
    <ChartShell titleTamil={titleTamil} icon={<BarChart3 strokeWidth={2.25} />}>
      {!hasSpend ? (
        <EmptyChart message={emptyTamil} />
      ) : (
        <>
          <div className="h-[220px] w-full sm:h-[236px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, bottom: 6, left: 6, right: 10 }} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="4 10" stroke={GRID} strokeOpacity={0.88} vertical={false} />
                <XAxis
                  dataKey="short"
                  tick={{ fill: tickColor, fontSize: 11 * fontScale }}
                  interval={0}
                  tickMargin={10}
                  height={52}
                  angle={-16}
                  textAnchor="end"
                  stroke={tickColor}
                  strokeOpacity={0.35}
                />
                <YAxis
                  tickFormatter={(v: number | string) => formatInrAxisShort(Number(v))}
                  tick={{ fill: tickColor, fontSize: 11 * fontScale }}
                  width={44}
                  stroke="transparent"
                  domain={[0, Math.max(Math.ceil(maxSpend * 1.08), 1)]}
                />
                <Tooltip
                  formatter={(value) => [formatInr(Number(value ?? 0)), ta.chartLegendMonthlySpend]}
                  labelFormatter={(_, payload) =>
                    typeof payload?.[0]?.payload === 'object' &&
                    payload[0]?.payload !== null &&
                    'labelTamil' in payload[0].payload
                      ? String((payload[0].payload as { labelTamil: string }).labelTamil)
                      : ''
                  }
                  contentStyle={tooltipStyles}
                  cursor={{ fill: CURSOR_FILL, opacity: 0.45 }}
                />
                <Bar
                  name={ta.chartLegendMonthlySpend}
                  dataKey="total"
                  fill={BAR_PRIMARY}
                  radius={BAR_RADIUS_TOP}
                  maxBarSize={52}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <BarSeriesLegendTamil dotColor={BAR_PRIMARY} labelTamil={ta.chartLegendMonthlySpend} />
        </>
      )}
    </ChartShell>
  )
}

export function DailySpendChart({
  titleTamil,
  emptyTamil,
  data,
  fontScale = 1,
}: {
  titleTamil: string
  emptyTamil: string
  data: DailyBucket[]
  fontScale?: number
}) {
  const hasSpend = data.some((d) => d.total > 0)
  const maxSpend = data.reduce((m, d) => Math.max(m, d.total), 0)

  return (
    <ChartShell titleTamil={titleTamil} icon={<Activity strokeWidth={2.25} />}>
      {!hasSpend ? (
        <EmptyChart message={emptyTamil} />
      ) : (
        <>
          {/* Legend lives below SVG so it never clashes with ticks (வ previously overlapped série legend). */}
          <div className="h-[220px] w-full sm:h-[232px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, bottom: 14, left: 6, right: 10 }} barCategoryGap="16%">
                <CartesianGrid strokeDasharray="4 10" stroke={GRID} strokeOpacity={0.88} vertical={false} />
                <XAxis
                  dataKey="labelTamil"
                  tick={{ fill: tickColor, fontSize: 12 * fontScale }}
                  tickMargin={6}
                  stroke={tickColor}
                  strokeOpacity={0.35}
                />
                <YAxis
                  tickFormatter={(v: number | string) => formatInrAxisShort(Number(v))}
                  tick={{ fill: tickColor, fontSize: 11 * fontScale }}
                  width={44}
                  stroke="transparent"
                  domain={[0, Math.max(Math.ceil(maxSpend * 1.08), 1)]}
                />
                <Tooltip
                  formatter={(value) => [formatInr(Number(value ?? 0)), ta.chartLegendDailySpend]}
                  labelFormatter={(_, payload) =>
                    typeof payload?.[0]?.payload === 'object' &&
                    payload[0]?.payload !== null &&
                    typeof (payload[0].payload as { labelTamil?: string }).labelTamil === 'string'
                      ? `${ta.chartDailyAxisDay} ${(payload[0].payload as { labelTamil: string }).labelTamil}`
                      : ''
                  }
                  contentStyle={tooltipStyles}
                  cursor={{ fill: CURSOR_FILL, opacity: 0.45 }}
                />
                <Bar
                  name={ta.chartLegendDailySpend}
                  dataKey="total"
                  fill={BAR_ALT}
                  radius={BAR_RADIUS_TOP}
                  maxBarSize={54}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <BarSeriesLegendTamil dotColor={BAR_ALT} labelTamil={ta.chartLegendDailySpend} />
        </>
      )}
    </ChartShell>
  )
}
