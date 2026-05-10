import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutList, Plus, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteAllExpensesDialog } from '@/components/layout/DeleteAllExpensesDialog'
import { cn } from '@/lib/utils'
import { ta } from '@/translations/ta'

/** Must match favicon + PWA icons: replace `public/icon.png` only. */
const APP_ICON_SRC = '/icon.png'

interface AppLayoutProps {
  appTitleTamil: string
  homeSubtitleTamil: string
  addExpenseLabelTamil: string
}

export function AppLayout({
  appTitleTamil,
  homeSubtitleTamil,
  addExpenseLabelTamil,
}: AppLayoutProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const isHome = pathname === '/'
  const showFab = isHome
  const routeSubtitle =
    pathname === '/expenses'
      ? ta.expensesPageSubtitle
      : pathname === '/add'
        ? addExpenseLabelTamil
        : isHome
          ? homeSubtitleTamil
          : ''

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-[color-mix(in_srgb,var(--popover)_82%,transparent)] shadow-[var(--header-shadow)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--popover)_65%,transparent)]">
        <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-3.5">
          {!isHome ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="back"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft />
            </Button>
          ) : (
            <Link
              to="/"
              className={cn(
                'shrink-0',
                'flex size-11 items-center justify-center overflow-hidden rounded-2xl',
                'bg-linear-to-br from-aesthetic-soft via-aesthetic-bloom to-aesthetic-petal',
                'shadow-md shadow-aesthetic-berry/20 ring-1 ring-aesthetic-soft',
                'transition-all duration-200 ease-out',
                'hover:brightness-[1.02] hover:shadow-lg hover:shadow-aesthetic-petal/30 hover:ring-aesthetic-petal/80',
                'active:scale-95',
              )}
            >
              <img
                src={APP_ICON_SRC}
                alt=""
                className="size-10 rounded-[10px] object-cover shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]"
              />
            </Link>
          )}

          <div className="min-w-0 flex-1">
            <Link to="/" className="group block rounded-md">
              <h1 className="truncate text-[1.15rem] font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {appTitleTamil}
              </h1>
            </Link>
            <p className="text-[0.8125rem] leading-snug text-muted-foreground">{routeSubtitle}</p>
          </div>

          {isHome ? (
            <div className="flex shrink-0 items-center gap-0.5">
              <Link
                to="/expenses"
                className={cn(
                  'shrink-0 rounded-2xl p-2.5 text-primary transition-all duration-200',
                  'hover:bg-primary/10 hover:text-primary hover:shadow-sm',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                )}
                aria-label={ta.viewAllExpenses}
              >
                <LayoutList className="size-6" aria-hidden />
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 rounded-2xl text-destructive hover:bg-destructive/12 hover:text-destructive active:bg-destructive/18"
                aria-label={ta.deleteAllExpensesAria}
                title={ta.deleteAllExpensesAria}
                onClick={() => setDeleteAllOpen(true)}
              >
                <TriangleAlert className="size-[1.35rem]" aria-hidden strokeWidth={2.25} />
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <DeleteAllExpensesDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen} />

      <main
        className={cn(
          'mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))]',
          showFab ? 'pb-[max(7.25rem,calc(env(safe-area-inset-bottom)+6rem))]' : '',
        )}
      >
        <Outlet />
      </main>

      {showFab ? (
        <div className="pointer-events-none fixed inset-x-0 z-[100] mx-auto flex w-full max-w-lg justify-center px-5 bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))]">
          <button
            type="button"
            onClick={() => navigate('/add')}
            className={cn(
              'pointer-events-auto relative isolate flex min-h-[3.5rem] items-center justify-center gap-2.5 rounded-full px-10 py-3.5',
              'overflow-hidden border border-white/30 bg-clip-padding',
              'bg-linear-to-br from-aesthetic-berry via-aesthetic-petal to-aesthetic-bloom text-primary-foreground antialiased subpixel-antialiased',
              'text-base font-semibold leading-none tracking-wide',
              'shadow-[0_3px_0_0_color-mix(in_srgb,var(--palette-berry)_38%,#4a2840),0_14px_36px_-8px_color-mix(in_srgb,var(--palette-berry)_50%,transparent),inset_0_1px_0_rgba(255,255,255,0.35)]',
              'transition-[transform,box-shadow,filter,border-color] duration-200 ease-out',
              'hover:-translate-y-0.5 hover:border-white/45 hover:brightness-[1.04]',
              'hover:shadow-[0_2px_0_0_#4a2840,0_20px_44px_-6px_color-mix(in_srgb,var(--palette-petal)_45%,transparent),inset_0_1px_0_rgba(255,255,255,0.42)]',
              'active:translate-y-0 active:scale-[0.98] active:brightness-[0.97]',
              'focus-visible:ring-4 focus-visible:ring-aesthetic-petal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--palette-wash)] focus-visible:outline-none',
              'max-w-[min(22rem,calc(100vw-3rem))]',
            )}
          >
            <Plus className="relative z-10 size-6 shrink-0" strokeWidth={2.25} aria-hidden />
            <span className="relative z-10 block min-w-0 px-0.5 text-center">{addExpenseLabelTamil}</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
