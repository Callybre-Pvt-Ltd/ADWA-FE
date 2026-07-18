import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { profileFormSchema, type ProfileFormData } from '@/utils/validators'
import { toast } from 'sonner'
import { User, Mail, Phone, Shield, BadgeCheck } from 'lucide-react'

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>
}

export default function ProfileForm({ defaultValues }: ProfileFormProps) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  const translateDefault = (val?: string) => {
    if (!isHi || !val) return val
    if (val === 'System Admin') return 'सिस्टम एडमिन'
    if (val === 'National Administrator') return 'राष्ट्रीय प्रशासक'
    if (val === 'District Incharge') return 'जिला प्रभारी'
    if (val === 'District Coordinator') return 'जिला समन्वयक'
    return val
  }

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: translateDefault(defaultValues?.name ?? 'District Incharge'),
      email: defaultValues?.email ?? 'incharge@adwa.org',
      mobile: defaultValues?.mobile ?? '9876543210',
      designation: translateDefault(defaultValues?.designation ?? 'District Coordinator'),
    },
  })

  // Watch inputs for real-time synchronization in the left card
  const nameValue = watch('name')
  const emailValue = watch('email')
  const mobileValue = watch('mobile')
  const designationValue = watch('designation')

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'DI'
    if (nameStr.includes('प्रभारी') || nameStr.includes('District') || nameStr.includes('जिला')) {
      return 'DI'
    }
    if (nameStr.includes('Admin') || nameStr.includes('एडमिन')) {
      return 'SA'
    }
    const parts = nameStr.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const onSubmit = handleSubmit(() => {
    toast.success(isHi ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई' : 'Profile updated successfully')
  })

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-12 w-full">
      {/* Left Card: Avatar and Details */}
      <div className="col-span-1 md:col-span-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-blue-900 bg-neutral-50 text-3xl font-black text-blue-900 shadow-inner">
          {getInitials(nameValue)}
          <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white border-2 border-white shadow-md">
            <User className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-neutral-900 leading-snug">{nameValue}</h2>
          <p className="text-sm font-semibold text-neutral-400">{designationValue}</p>
        </div>

        <div className="w-full pt-4 border-t border-neutral-100 space-y-3.5 text-sm text-neutral-600">
          <div className="flex items-center gap-3">
            <Mail className="h-4.5 w-4.5 shrink-0 text-neutral-400" />
            <span className="truncate font-semibold">{emailValue}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4.5 w-4.5 shrink-0 text-neutral-400" />
            <span className="font-semibold">{mobileValue}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
              <BadgeCheck className="h-4 w-4 shrink-0 text-blue-600" />
              <span>{isHi ? 'सत्यापित खाता' : 'Verified Account'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Card: Form inputs */}
      <div className="col-span-1 md:col-span-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-neutral-950 border-b border-neutral-100 pb-3">
            {isHi ? 'खाता विवरण' : 'Account Details'}
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="font-semibold text-neutral-700">
                {isHi ? 'पूरा नाम' : 'Full Name'}
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <User className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="name"
                  {...register('name')}
                  className="pl-10.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-neutral-800"
                />
              </div>
              {errors.name && <p className="text-xs text-red-600">{errors.name?.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold text-neutral-700">
                {isHi ? 'ईमेल पता' : 'Email Address'}
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="pl-10.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-neutral-800"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email?.message}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="font-semibold text-neutral-700">
                {isHi ? 'मोबाइल नंबर' : 'Mobile Number'}
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="mobile"
                  {...register('mobile')}
                  className="pl-10.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-neutral-800"
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-600">{errors.mobile?.message}</p>}
            </div>

            {/* Designation / Role */}
            <div className="space-y-1.5">
              <Label htmlFor="designation" className="font-semibold text-neutral-700">
                {isHi ? 'पद / भूमिका' : 'Designation / Role'}
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
                  <Shield className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="designation"
                  {...register('designation')}
                  className="pl-10.5 rounded-xl border border-neutral-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold text-neutral-800"
                />
              </div>
              {errors.designation && <p className="text-xs text-red-600">{errors.designation?.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 w-full">
          <Button
            type="submit"
            className="w-full sm:w-auto rounded-full bg-blue-950 px-8 py-2.5 text-sm font-black text-white hover:bg-blue-900 transition-all cursor-pointer shadow-md active:scale-95"
          >
            {isHi ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </form>
  )
}
