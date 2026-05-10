import { categoryImageUrl } from '@/assets/icons/categoryImages'
import { cn } from '@/lib/utils'

interface CategoryVisualCardProps {
  labelTamil: string
  imageKey: string
  onClick: () => void
  className?: string
}

export function CategoryVisualCard({
  labelTamil,
  imageKey,
  onClick,
  className,
}: CategoryVisualCardProps) {
  const src = categoryImageUrl[imageKey]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[118px] min-w-0 w-full touch-manipulation flex-col items-stretch gap-2 rounded-3xl border border-border/70 bg-card p-2.5 text-left shadow-[var(--card-shadow)] sm:p-3',
        'transition-all duration-300 ease-out will-change-transform',
        'hover:z-10 hover:-translate-y-1 hover:border-primary/35 hover:bg-linear-to-b hover:from-card hover:to-aesthetic-wash',
        'hover:shadow-xl hover:shadow-primary/12 hover:ring-2 hover:ring-primary/15',
        'active:translate-y-0 active:scale-[0.99]',
        className,
      )}
    >
      <div className="relative flex min-h-[124px] w-full items-center justify-center px-1 py-2">
        {src ? (
          <img
            src={src}
            alt=""
            className="h-auto max-h-[140px] w-full object-contain object-center select-none"
            loading="lazy"
            draggable={false}
          />
        ) : null}
      </div>
      <p
        lang="ta"
        className={cn(
          'min-h-[2.5rem] min-w-0 w-full px-0.5 text-center font-medium leading-tight tracking-tight text-card-foreground',
          'break-words text-pretty [overflow-wrap:anywhere]',
          'text-[0.78rem] sm:text-[0.85rem] md:text-[0.9rem]',
        )}
      >
        {labelTamil}
      </p>
    </button>
  )
}
