import { cn } from '@/utils/cn'

type IdCardFormFieldsProps = {
  values: import('./idCardForm').IdCardFormValues
  onChange: (field: keyof import('./idCardForm').IdCardFormValues, value: string) => void
  disabled?: boolean
}

const FIELDS: { key: keyof import('./idCardForm').IdCardFormValues; label: string }[] = [
  { key: 'fullName', label: 'Full name' },
  { key: 'fatherName', label: 'Father / spouse name' },
  { key: 'designation', label: 'Designation' },
  { key: 'mobileNumber', label: 'Mobile' },
  { key: 'licenseNumber', label: 'License number' },
  { key: 'policeStation', label: 'Tehsil / PS' },
  { key: 'city', label: 'City / village' },
  { key: 'state', label: 'State' },
  { key: 'bloodGroup', label: 'Blood group' },
  { key: 'dateOfBirth', label: 'Date of birth (YYYY-MM-DD)' },
]

export function IdCardFormFields({ values, onChange, disabled }: IdCardFormFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FIELDS.map(({ key, label }) => (
        <label key={key} className={cn('block text-sm', key === 'fullName' && 'sm:col-span-2')}>
          <span className="text-neutral-500 text-xs font-medium uppercase tracking-wide">{label}</span>
          <input
            type="text"
            value={values[key]}
            disabled={disabled}
            onChange={(e) => onChange(key, e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 disabled:opacity-60"
          />
        </label>
      ))}
    </div>
  )
}
