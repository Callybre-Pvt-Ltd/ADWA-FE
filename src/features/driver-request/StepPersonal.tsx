import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { User, Phone, Mail, Calendar, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DOBPicker } from '@/components/shared/DOBPicker'
import type { DriverRequestFormData } from '@/utils/validators'
import { FormField, FormSection } from './FormField'

const DISTRICTS = [
  'Lucknow', 'Ahmedabad', 'Mumbai', 'Delhi', 'Jaipur',
  'Agra', 'Kanpur', 'Varanasi', 'Allahabad', 'Meerut',
]

const THANAS: Record<string, string[]> = {
  Lucknow:   ['Hazratganj', 'Gomti Nagar', 'Alambagh', 'Chinhat', 'Sarojini Nagar'],
  Ahmedabad: ['Navrangpura', 'Maninagar', 'Vastrapur', 'Bapunagar'],
  Mumbai:    ['Andheri', 'Bandra', 'Dadar', 'Kurla', 'Borivali'],
  Delhi:     ['Connaught Place', 'Karol Bagh', 'Dwarka', 'Rohini', 'Saket'],
  Jaipur:    ['Malviya Nagar', 'Vaishali Nagar', 'C Scheme', 'Mansarovar'],
  Agra:      ['Taj Ganj', 'Shahganj', 'Lohamandi', 'Etmadpur'],
  Kanpur:    ['Swaroop Nagar', 'Kidwai Nagar', 'Armapur', 'Kalyanpur'],
  Varanasi:  ['Lanka', 'Sigra', 'Shivpur', 'Manduadih'],
  Allahabad: ['Civil Lines', 'George Town', 'Naini', 'Phaphamau'],
  Meerut:    ['Hapur Road', 'Lisari Gate', 'Daurala', 'Mawana'],
}

export default function StepPersonal() {
  const { t } = useTranslation('pages')
  const f = (key: string) => t(`apply.fields.${key}`)
  const s = (key: string) => t(`apply.sections.${key}`)

  const { register, setValue, watch, formState: { errors } } = useFormContext<DriverRequestFormData>()
  const district = watch('district')

  return (
    <div className="space-y-8">

      {/* Name & Contact — 3 fields → col1: Full Name, col2: Mobile, col-span-full: Email */}
      <FormSection icon={<User size={16} />} title={s('nameContact')}>
        <FormField label={f('fullName')} htmlFor="name" required hint={f('fullNameHint')} error={errors.name?.message}>
          <Input id="name" placeholder={f('fullNamePlaceholder')} {...register('name')} />
        </FormField>

        <FormField label={f('mobile')} htmlFor="mobile" required hint={f('mobileHint')} error={errors.mobile?.message}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Phone size={15} />
            </span>
            <Input id="mobile" type="tel" inputMode="numeric" placeholder={f('mobilePlaceholder')} className="pl-10" {...register('mobile')} />
          </div>
        </FormField>

        <FormField label={f('email')} htmlFor="email" optional hint={f('emailPlaceholder')} error={errors.email?.message} fullWidth>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Mail size={15} />
            </span>
            <Input id="email" type="email" placeholder={f('emailPlaceholder')} className="pl-10" {...register('email')} />
          </div>
        </FormField>
      </FormSection>

      {/* DOB — full width (3-part picker looks better unconstrained) */}
      <FormSection icon={<Calendar size={16} />} title={s('dateOfBirth')} singleCol>
        <FormField label={f('dateOfBirth')} required error={errors.dateOfBirth?.message}>
          <DOBPicker name="dateOfBirth" error={errors.dateOfBirth?.message} />
        </FormField>
      </FormSection>

      {/* Address */}
      <FormSection icon={<MapPin size={16} />} title={t('apply.addressDetails')}>
        <FormField label={f('district')} required error={errors.district?.message}>
          <Select
            value={district}
            onValueChange={v => { setValue('district', v, { shouldValidate: true }); setValue('thana', '') }}
          >
            <SelectTrigger>
              <SelectValue placeholder={f('selectDistrict')} />
            </SelectTrigger>
            <SelectContent>
              {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label={f('thana')}
          required
          hint={!district ? f('selectDistrictFirst') : undefined}
          error={errors.thana?.message}
        >
          <Select
            value={watch('thana')}
            onValueChange={v => setValue('thana', v, { shouldValidate: true })}
            disabled={!district}
          >
            <SelectTrigger>
              <SelectValue placeholder={f('selectThana')} />
            </SelectTrigger>
            <SelectContent>
              {(THANAS[district] ?? []).map(th => <SelectItem key={th} value={th}>{th}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={f('fullAddress')} htmlFor="address" required hint={f('addressHint')} error={errors.address?.message} fullWidth>
          <Textarea id="address" placeholder={f('addressPlaceholder')} rows={3} {...register('address')} />
        </FormField>
      </FormSection>

    </div>
  )
}
