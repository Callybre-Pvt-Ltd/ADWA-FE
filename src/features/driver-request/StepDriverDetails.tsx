import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CreditCard, Car, Lock, ShieldCheck, Droplets } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BloodGroupSelector } from '@/components/shared/BloodGroupSelector'
import { AadharInput } from '@/components/shared/AadharInput'
import { DOBPicker } from '@/components/shared/DOBPicker'
import type { DriverRequestFormData } from '@/utils/validators'
import { FormField, FormSection } from './FormField'

const LICENSE_TYPE_KEYS = ['LMV', 'HMV', 'Transport', 'Commercial'] as const
const currentYear = new Date().getFullYear()

export default function StepDriverDetails() {
  const { t } = useTranslation('pages')
  const f = (key: string) => t(`apply.fields.${key}`)
  const s = (key: string) => t(`apply.sections.${key}`)

  const { register, setValue, watch, formState: { errors } } = useFormContext<DriverRequestFormData>()

  return (
    <div className="space-y-8">

      <FormSection icon={<Car size={16} />} title={s('licenseDetails')}>
        {/* License number */}
        <FormField label={f('license')} htmlFor="licenseNumber" required hint={f('licenseHint')} error={errors.licenseNumber?.message}>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <CreditCard size={15} />
            </span>
            <Input
              id="licenseNumber"
              placeholder={f('licensePlaceholder')}
              className="pl-10 uppercase"
              {...register('licenseNumber', {
                onChange: e => { e.target.value = e.target.value.toUpperCase() },
              })}
            />
          </div>
        </FormField>

        {/* License type */}
        <FormField label={f('licenseType')} required error={errors.licenseType?.message}>
          <Select
            value={watch('licenseType')}
            onValueChange={v => setValue('licenseType', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder={f('selectLicenseType')} />
            </SelectTrigger>
            <SelectContent>
              {LICENSE_TYPE_KEYS.map(k => (
                <SelectItem key={k} value={k}>
                  {t(`apply.licenseTypes.${k}`, k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Expiry — full width, 3-part picker */}
        <FormField label={f('licenseExpiry')} required error={errors.licenseExpiryDate?.message} fullWidth>
          <DOBPicker
            name="licenseExpiryDate"
            error={errors.licenseExpiryDate?.message}
            minYear={currentYear}
            maxYear={currentYear + 20}
          />
        </FormField>
      </FormSection>

      {/* Blood group — full width tile selector */}
      <FormSection icon={<Droplets size={16} />} title={s('healthInfo')} singleCol>
        <FormField label={f('bloodGroup')} required error={errors.bloodGroup?.message}>
          <BloodGroupSelector name="bloodGroup" error={errors.bloodGroup?.message} />
        </FormField>
      </FormSection>

      {/* Aadhaar */}
      <FormSection icon={<Lock size={16} />} title={s('aadharDetails')} singleCol>
        <FormField label={f('aadhaar')} htmlFor="aadharNumber" required hint={f('aadhaarHint')} error={errors.aadharNumber?.message}>
          <AadharInput name="aadharNumber" error={errors.aadharNumber?.message} />
        </FormField>

        <div className="flex items-start gap-2.5 bg-green-50 border-2 border-green-200 rounded-2xl px-4 py-3">
          <ShieldCheck size={16} className="text-green-600 mt-0.5 shrink-0" />
          <p className="text-xs text-green-800 leading-relaxed">{f('aadharSecurity')}</p>
        </div>
      </FormSection>

    </div>
  )
}
