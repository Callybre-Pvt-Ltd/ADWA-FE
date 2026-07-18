import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { toast } from 'sonner'
import { Shield, ArrowLeft, Globe, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AdwaSeal } from '@/components/shared/AdwaSeal'
import { popIn } from '@/utils/animations'

const getLoginSchema = (isHi: boolean) => z.object({
  email: z.string().email(isHi ? 'कृपया एक वैध ईमेल दर्ज करें' : 'Enter a valid email'),
  password: z.string().min(6, isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>

function LangToggle() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={ref}
      className="relative z-50 py-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-white transition-all duration-250 border border-white/20 active:scale-95 cursor-pointer ${
          open ? 'bg-white/20 border-white/30' : 'bg-white/10 hover:bg-white/20 hover:border-white/30'
        }`}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 text-white/90" />
        <span>{i18n.language === 'en' ? 'English' : 'हिन्दी'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1 w-36 rounded-xl bg-white p-1.5 shadow-xl border border-neutral-100 focus:outline-none z-50 text-neutral-800"
          >
            <button
              onClick={() => {
                void i18n.changeLanguage('en')
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                i18n.language === 'en'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm leading-none">🇬🇧</span>
                <span>English</span>
              </span>
              {i18n.language === 'en' && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
            </button>
            <button
              onClick={() => {
                void i18n.changeLanguage('hi')
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-bold transition-colors cursor-pointer ${
                i18n.language === 'hi'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm leading-none">🇮🇳</span>
                <span>हिन्दी</span>
              </span>
              {i18n.language === 'hi' && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DistrictLoginPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/district/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema(isHi)),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: LoginFormData) => login('district', data.email, data.password),
    onSuccess: () => {
      toast.success(isHi ? 'आपका स्वागत है!' : 'Welcome back!')
      navigate(from, { replace: true })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isAuthenticated('district')) {
    return <Navigate to="/district/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Premium Header */}
      <header className="bg-blue-900 text-white relative shadow-sm z-40">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <AdwaSeal size="sm" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide">
              {isHi ? 'ऑल ड्राइवर्स कल्याण संगठन (जिला पोर्टल)' : 'All Drivers Welfare Association (District Portal)'}
            </span>
          </div>
          <LangToggle />
        </div>
        <div className="flag-stripe" />
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900 tracking-tight">
              {isHi ? 'जिला पोर्टल लॉगिन' : 'District Portal Login'}
            </h1>
            <p className="mt-2 text-sm text-neutral-600 max-w-xs mx-auto leading-relaxed">
              {isHi ? 'ड्राइवर अनुरोध और भुगतान प्रबंधित करने के लिए साइन इन करें' : 'Sign in to manage driver requests and payments'}
            </p>
          </div>

          <motion.div {...popIn} className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl shadow-neutral-100 p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3.5 pb-5 border-b border-neutral-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900/10 border border-blue-900/30 text-blue-900 shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold text-neutral-900">{isHi ? 'जिला प्रभारी' : 'District Incharge'}</p>
                <p className="text-xs text-neutral-500">{isHi ? 'अपने जिला कार्यालय क्रेडेंशियल के साथ साइन इन करें' : 'Sign in with your district office credentials'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <div>
                <Label htmlFor="email" className="font-bold text-neutral-700">
                  {isHi ? 'ईमेल' : 'Email'}
                </Label>
                <Input id="email" type="email" autoComplete="email" {...register('email')} className="mt-1 font-semibold" />
                {errors.email && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="font-bold text-neutral-700">
                  {isHi ? 'पासवर्ड' : 'Password'}
                </Label>
                <Input id="password" type="password" autoComplete="current-password" {...register('password')} className="mt-1 font-semibold" />
                {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-bold bg-blue-900 hover:bg-blue-800 transition-colors cursor-pointer" disabled={mutation.isPending}>
                {mutation.isPending ? (isHi ? 'साइन इन किया जा रहा है...' : 'Signing in...') : (isHi ? 'साइन इन करें' : 'Sign in')}
              </Button>
            </form>
          </motion.div>

          <div className="text-center mt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-blue-900 hover:text-orange-600 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> {isHi ? 'सार्वजनिक साइट पर वापस जाएं' : 'Back to public site'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
