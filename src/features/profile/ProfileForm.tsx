import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { profileFormSchema, type ProfileFormData } from '@/utils/validators'
import { toast } from 'sonner'

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>
}

const labelMap: Record<string, { en: string; hi: string }> = {
  name: { en: 'Name', hi: 'नाम' },
  email: { en: 'Email', hi: 'ईमेल' },
  mobile: { en: 'Mobile', hi: 'मोबाइल' },
  designation: { en: 'Designation', hi: 'पद' },
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

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: translateDefault(defaultValues?.name ?? 'District Incharge'),
      email: defaultValues?.email ?? 'incharge@adwa.org',
      mobile: defaultValues?.mobile ?? '9876543210',
      designation: translateDefault(defaultValues?.designation ?? 'District Coordinator'),
    },
  })

  const onSubmit = handleSubmit(() => {
    toast.success(isHi ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई' : 'Profile updated successfully')
  })

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      {(['name', 'email', 'mobile', 'designation'] as const).map((field) => (
        <div key={field}>
          <Label htmlFor={field} className="font-semibold text-neutral-700">
            {isHi ? labelMap[field].hi : labelMap[field].en}
          </Label>
          <Input id={field} {...register(field)} className="mt-1 font-semibold" type={field === 'email' ? 'email' : 'text'} />
          {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]?.message}</p>}
        </div>
      ))}
      <Button type="submit" className="w-full sm:w-auto cursor-pointer">
        {isHi ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
      </Button>
    </form>
  )
}
