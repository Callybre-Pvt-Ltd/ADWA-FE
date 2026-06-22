import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { toast } from 'sonner'
import { Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/shared/PageHero'
import { popIn } from '@/utils/animations'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const { t } = useTranslation('pages')
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: LoginFormData) => login('admin', data.email, data.password),
    onSuccess: () => {
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  if (isAuthenticated('admin')) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="min-h-screen">
      <PageHero title={t('login.adminTitle')} subtitle={t('login.adminSubtitle')} />
      <div className="container-wide max-w-md py-10">
        <motion.div {...popIn} className="surface-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-royal-800 text-white shadow-sm">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-neutral-900">Super Admin</p>
              <p className="text-sm text-neutral-600">Sign in with your ADWA admin credentials</p>
            </div>
          </div>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} className="mt-1" />
              {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register('password')} className="mt-1" />
              {errors.password && <p className="mt-1 text-sm text-danger">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </motion.div>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-royal-700 hover:text-orange-600">
          <ArrowLeft className="h-4 w-4" /> Back to public site
        </Link>
      </div>
    </div>
  )
}
