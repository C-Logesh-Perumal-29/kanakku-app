import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SummaryStatCardProps {
  titleTamil: string
  value: string
  hintTamil?: string
  onClick?: () => void
  className?: string
  icon?: ReactNode
}

export function SummaryStatCard({
  titleTamil,
  value,
  hintTamil,
  onClick,
  className,
  icon,
}: SummaryStatCardProps) {
  const interactive = Boolean(onClick)

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10',
        interactive &&
          'cursor-pointer hover:ring-2 hover:ring-primary/20 active:scale-[0.99]',
        className,
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
    >
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="min-w-0 flex-1 text-[0.8125rem] font-medium leading-snug text-muted-foreground">
            {titleTamil}
          </CardTitle>
          {icon ? (
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary',
                '[&_svg]:size-[1.1rem] [&_svg]:stroke-[2.25px]',
              )}
              aria-hidden
            >
              {icon}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        <p className="text-[1.35rem] font-bold tracking-tight text-foreground tabular-nums leading-none sm:text-[1.45rem]">
          {value}
        </p>
        {hintTamil ? (
          <p className="text-[0.7rem] leading-snug text-muted-foreground line-clamp-2 sm:text-xs">
            {hintTamil}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
