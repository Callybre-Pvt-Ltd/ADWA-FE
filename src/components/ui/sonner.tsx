import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'bg-white border border-neutral-200 shadow-md rounded-xl text-neutral-900',
          title: 'text-neutral-900 font-semibold',
          description: 'text-violet-600',
          success: 'border-emerald-300',
          error: 'border-red-300',
        },
      }}
      mobileOffset={{ top: 16 }}
    />
  )
}
