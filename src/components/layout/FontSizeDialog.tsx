import { useEffect, useState } from 'react'
import { Check, Type } from 'lucide-react'
import { updateSettings } from '@/db/dexie'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ta } from '@/translations/ta'
import { normalizeFontSizeLevel, type FontSizeLevel } from '@/utils/fontSize'
import { toast } from 'sonner'

interface FontSizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLevel?: FontSizeLevel
}

const OPTIONS: { value: FontSizeLevel; label: string; hint: string; sampleClassName: string }[] = [
  {
    value: 'default',
    label: ta.fontSizeDefault,
    hint: ta.fontSizeDefaultHint,
    sampleClassName: 'text-base',
  },
  {
    value: 'large',
    label: ta.fontSizeLarge,
    hint: ta.fontSizeLargeHint,
    sampleClassName: 'text-lg',
  },
  {
    value: 'xlarge',
    label: ta.fontSizeXLarge,
    hint: ta.fontSizeXLargeHint,
    sampleClassName: 'text-xl',
  },
]

export function FontSizeDialog({
  open,
  onOpenChange,
  currentLevel = 'default',
}: FontSizeDialogProps) {
  const [selected, setSelected] = useState<FontSizeLevel>(normalizeFontSizeLevel(currentLevel))

  useEffect(() => {
    if (open) {
      setSelected(normalizeFontSizeLevel(currentLevel))
    }
  }, [open, currentLevel])

  async function handleSave(): Promise<void> {
    await updateSettings({ fontSizeLevel: selected })
    toast.success(ta.fontSizeSaved, { duration: 2600 })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader className="space-y-2 text-start">
          <DialogTitle className="inline-flex items-center gap-2 text-balance text-lg leading-snug font-semibold">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Type className="size-4" aria-hidden />
            </span>
            {ta.fontSizeTitle}
          </DialogTitle>
          <DialogDescription className="text-pretty text-sm leading-relaxed">
            {ta.fontSizeHint}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-2">
          {OPTIONS.map((option) => {
            const active = selected === option.value
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border px-4 py-3 text-start transition-all duration-200',
                  active
                    ? 'border-primary/40 bg-primary/8 shadow-sm shadow-primary/10'
                    : 'border-border/70 bg-card hover:border-primary/20 hover:bg-primary/[0.04]',
                )}
                onClick={() => setSelected(option.value)}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{option.label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{option.hint}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('font-bold text-foreground', option.sampleClassName)} aria-hidden>
                    அ
                  </span>
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-transparent',
                    )}
                    aria-hidden
                  >
                    <Check className="size-3.5" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {ta.cancel}
          </Button>
          <Button type="button" className="h-11 px-6 text-base" onClick={handleSave}>
            {ta.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
