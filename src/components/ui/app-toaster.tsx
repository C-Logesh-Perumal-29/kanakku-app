import { Toaster } from 'sonner'

/** Auto-dismiss toasts (no OK button); swipe to dismiss on mobile */
export function AppToaster() {
  return (
    <Toaster
      theme="light"
      position="top-center"
      richColors={false}
      expand={false}
      closeButton={false}
      duration={3400}
      gap={10}
      offset={{ top: '4.5rem' }}
      mobileOffset={{ top: '4.25rem' }}
      toastOptions={{
        closeButton: false,
        classNames: {
          toast:
            '!rounded-2xl !border !shadow-lg !p-4 !gap-3 !font-sans !backdrop-blur-sm',
          title: '!text-[0.9375rem] !font-semibold !leading-snug sm:!text-base',
          success:
            '!border-white/25 !bg-linear-to-br !from-aesthetic-berry !via-aesthetic-petal !to-aesthetic-bloom !text-primary-foreground',
          error:
            '!border-white/20 !bg-linear-to-br !from-red-600 !to-[color-mix(in_srgb,var(--palette-berry)_28%,#450a0a)] !text-white',
          icon: '!text-current',
        },
      }}
    />
  )
}
