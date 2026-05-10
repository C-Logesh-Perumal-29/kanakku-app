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
import { ta } from '@/translations/ta'
import { toast } from 'sonner'

/** User must enter this uppercase code exactly (trimmed). */
export const DELETE_ALL_EXPENSES_CODE = 'GLRC'

interface DeleteAllExpensesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAllExpensesDialog({
  open,
  onOpenChange,
}: DeleteAllExpensesDialogProps) {
  const [code, setCode] = useState('')

  async function handleErase(): Promise<void> {
    if (code.trim() !== DELETE_ALL_EXPENSES_CODE) {
      toast.error(ta.deleteAllExpensesWrongCode, { duration: 3800 })
      return
    }
    await db.expenses.clear()
    await db.settings.put({ id: 1, currentAvailableAmount: 0 })
    toast.success(ta.deleteAllExpensesSuccess, { duration: 3400 })
    setCode('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (next) setCode('')
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-md" aria-describedby="delete-all-expenses-desc">
        <DialogHeader className="space-y-2 text-start">
          <DialogTitle className="text-balance leading-snug text-destructive">
            {ta.deleteAllExpensesTitle}
          </DialogTitle>
          <DialogDescription
            id="delete-all-expenses-desc"
            className="text-pretty leading-relaxed text-muted-foreground"
          >
            {ta.deleteAllExpensesBody}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="purge-code">{ta.deleteAllExpensesCodeLabel}</Label>
          <Input
            id="purge-code"
            name="purge-code"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder={DELETE_ALL_EXPENSES_CODE}
            className="h-11 rounded-xl font-mono text-base uppercase tracking-[0.2em]"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleErase()
            }}
          />
          <p className="text-xs text-muted-foreground">{ta.deleteAllExpensesCodeHint}</p>
        </div>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-xl text-base sm:min-w-[7rem]"
            onClick={() => {
              setCode('')
              onOpenChange(false)
            }}
          >
            {ta.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 rounded-xl text-base sm:min-w-[7rem]"
            onClick={() => void handleErase()}
          >
            {ta.deleteAllExpensesConfirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
