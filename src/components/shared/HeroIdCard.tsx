import { motion } from 'framer-motion'
import { CheckCircle2, QrCode, ShieldCheck } from 'lucide-react'
import { float } from '@/utils/animations'

export function HeroIdCard() {
  return (
    <motion.div
      {...float}
      className="relative mx-auto w-full max-w-[300px]"
      aria-hidden="true"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-4 rounded-3xl bg-orange-400/20 blur-2xl" />
      <div className="absolute -inset-2 rounded-3xl bg-blue-400/25 blur-xl" />

      <div className="relative overflow-hidden rounded-2xl border-2 border-white/30 bg-white shadow-2xl shadow-blue-900/40">
        {/* Saffron accent stripe */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600" />

        <div className="bg-gradient-to-br from-blue-800 to-blue-900 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">All Drivers Welfare</p>
              <p className="text-sm font-bold">Association</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 bg-white/10">
              <ShieldCheck className="h-5 w-5 text-orange-300" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex gap-4">
            <div className="h-20 w-16 shrink-0 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 flex items-center justify-center">
              <span className="text-2xl">👨‍✈️</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase">Driver Name</p>
              <p className="text-lg font-bold text-blue-900 truncate">Rajesh Kumar</p>
              <p className="text-sm text-neutral-600 mt-0.5">Truck Driver · UP</p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-2.5">
            <div>
              <p className="text-[10px] font-semibold text-neutral-500">ID Number</p>
              <p className="text-sm font-bold text-blue-900 font-mono">ADWA-2025-48291</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900 text-white">
              <QrCode className="h-7 w-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -right-3 top-8 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-green-500/40"
      >
        ✓ Active
      </motion.div>
    </motion.div>
  )
}
