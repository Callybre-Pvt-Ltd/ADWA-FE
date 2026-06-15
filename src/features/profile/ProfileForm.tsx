import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { profileFormSchema, type ProfileFormData } from '@/utils/validators'
import { toast } from 'sonner'

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>
}

export default function ProfileForm({ defaultValues }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: 'District Incharge',
      email: 'incharge@adwa.org',
      mobile: '9876543210',
      designation: 'District Coordinator',
      ...defaultValues,
    },
  })

  const onSubmit = handleSubmit(() => {
    toast.success('Profile updated successfully')
  })

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      {(['name', 'email', 'mobile', 'designation'] as const).map((field) => (
        <div key={field}>
          <Label htmlFor={field} className="capitalize">{field}</Label>
          <Input id={field} {...register(field)} className="mt-1" type={field === 'email' ? 'email' : 'text'} />
          {errors[field] && <p className="mt-1 text-sm text-red-600">{errors[field]?.message}</p>}
        </div>
      ))}
      <Button type="submit">Save Profile</Button>
    </form>
  )
}
