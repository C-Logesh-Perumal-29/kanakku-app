import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ta } from '@/translations/ta'

const APP_ICON_SRC = '/icon.png'

interface LoadingScreenProps {
  className?: string
  fullPage?: boolean
  titleTamil?: string
  subtitleTamil?: string
}

export function LoadingScreen({
  className,
  fullPage = false,
  titleTamil = ta.loadingTitle,
  subtitleTamil = ta.loadingSubtitle,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center px-4',
        fullPage ? 'min-h-dvh py-10' : 'min-h-[56vh] py-14',
        className,
      )}
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-border/60 bg-[color-mix(in_srgb,var(--card)_94%,white_6%)] px-6 py-7 shadow-[var(--card-shadow)]">
        <div className="pointer-events-none absolute -left-8 -top-10 size-32 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-8 size-28 rounded-full bg-aesthetic-bloom/20 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-[2rem] bg-primary/12 blur-md"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
            <div className="relative flex size-20 items-center justify-center rounded-[2rem] border border-white/50 bg-white/75 shadow-lg shadow-primary/10 backdrop-blur-sm">
              <img src={APP_ICON_SRC} alt="" className="size-16 rounded-[1.25rem] object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            </div>
          </div>

          <p className="mt-5 text-lg font-bold tracking-tight text-foreground">{titleTamil}</p>
          <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-muted-foreground">{subtitleTamil}</p>
        </div>
      </div>
    </div>
  )
}
