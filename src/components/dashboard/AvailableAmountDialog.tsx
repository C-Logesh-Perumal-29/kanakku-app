import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { db } from '@/db/dexie'
import { parseNonNegativeAmountInput } from '@/utils/currency'

interface AvailableAmountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAmount: number
  titleTamil: string
  descriptionTamil: string
  labelTamil: string
  saveTamil: string
  cancelTamil: string
}

export function AvailableAmountDialog({
  open,
  onOpenChange,
  currentAmount,
  titleTamil,
  descriptionTamil,
  labelTamil,
  saveTamil,
  cancelTamil,
}: AvailableAmountDialogProps) {
  const [raw, setRaw] = useState(String(Math.max(0, Math.round(currentAmount))))

  async function handleSave(): Promise<void> {
    const n = parseNonNegativeAmountInput(raw)
    if (n == null) return
    await db.settings.put({ id: 1, currentAvailableAmount: n })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (next) setRaw(String(Math.max(0, Math.round(currentAmount))))
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader className="space-y-2 text-start">
          <DialogTitle className="text-balance text-lg leading-snug font-semibold">
            {titleTamil}
          </DialogTitle>
          <DialogDescription className="text-pretty text-sm leading-relaxed">
            {descriptionTamil}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="avail" className="text-sm">
            {labelTamil}
          </Label>
          <Input
            id="avail"
            inputMode="decimal"
            enterKeyHint="done"
            className="h-14 rounded-2xl border-border/80 text-lg shadow-inner shadow-black/[0.04]"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {cancelTamil}
          </Button>
          <Button type="button" className="h-11 px-6 text-base" onClick={handleSave}>
            {saveTamil}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
