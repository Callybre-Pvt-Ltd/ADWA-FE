import { useTranslation } from 'react-i18next'
import { districtMapEnToHi, nameTranslations } from '@/utils/translations'
import type { IdCardFormValues } from './idCardForm'

type IdCardFormFieldsProps = {
  values: IdCardFormValues
  onChange: (field: keyof IdCardFormValues, value: string) => void
  disabled?: boolean
}

const labelTranslations: Record<string, { en: string; hi: string }> = {
  fullName: { en: 'Full name', hi: 'पूरा नाम' },
  fatherName: { en: 'Father / spouse name', hi: 'पिता / पति का नाम' },
  designation: { en: 'Designation', hi: 'पद' },
  mobileNumber: { en: 'Mobile', hi: 'मोबाइल नंबर' },
  licenseNumber: { en: 'License number', hi: 'लाइसेंस संख्या' },
  policeStation: { en: 'Tehsil / PS', hi: 'तहसील / थाना' },
  city: { en: 'City / village', hi: 'शहर / गाँव' },
  state: { en: 'State', hi: 'राज्य' },
  bloodGroup: { en: 'Blood group', hi: 'रक्त समूह' },
  dateOfBirth: { en: 'Date of birth', hi: 'जन्म तिथि' },
  issueDate: { en: 'Issue date', hi: 'जारी तिथि' },
  expiryDate: { en: 'Expiry date', hi: 'समाप्ति तिथि' },
}

const valueTranslations: Record<string, string> = {
  MEMBER: 'सदस्य',
  DISTRICT_INCHARGE: 'जिला प्रभारी',
  ADMIN: 'प्रशासक',
  SUPER_ADMIN: 'सुपर एडमिन',
  'Madhya Pradesh': 'मध्य प्रदेश',
  Maharashtra: 'महाराष्ट्र',
  Delhi: 'दिल्ली',
  Karnataka: 'कर्नाटक',
  Telangana: 'तेलंगाना',
  'Tamil Nadu': 'तमिलनाडु',
  'West Bengal': 'पश्चिम बंगाल',
}

const bloodGroupTranslations: Record<string, string> = {
  'A+': 'ए+',
  'A-': 'ए-',
  'B+': 'बी+',
  'B-': 'बी-',
  'O+': 'ओ+',
  'O-': 'ओ-',
  'AB+': 'एबी+',
  'AB-': 'एबी-',
}

const TEXT_FIELDS: { key: keyof IdCardFormValues }[] = [
  { key: 'fullName' },
  { key: 'fatherName' },
  { key: 'designation' },
  { key: 'mobileNumber' },
  { key: 'licenseNumber' },
  { key: 'policeStation' },
  { key: 'city' },
  { key: 'state' },
  { key: 'bloodGroup' },
]

const DATE_FIELDS: { key: keyof IdCardFormValues }[] = [
  { key: 'dateOfBirth' },
  { key: 'issueDate' },
  { key: 'expiryDate' },
]

export function IdCardFormFields({ values, onChange, disabled }: IdCardFormFieldsProps) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TEXT_FIELDS.map(({ key }) => {
        const trans = labelTranslations[key]
        const labelText = isHi ? trans.hi : trans.en
        let displayVal = values[key]
        if (isHi && displayVal) {
          if (valueTranslations[displayVal]) displayVal = valueTranslations[displayVal]
          else if (nameTranslations[displayVal]) displayVal = nameTranslations[displayVal]
          else if (districtMapEnToHi[displayVal]) displayVal = districtMapEnToHi[displayVal]
          else if (bloodGroupTranslations[displayVal]) displayVal = bloodGroupTranslations[displayVal]
        }
        return (
          <label key={key} className="block text-sm">
            <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wide">{labelText}</span>
            <input
              type="text"
              value={displayVal}
              disabled={disabled}
              onChange={(e) => onChange(key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 disabled:opacity-60 font-semibold"
            />
          </label>
        )
      })}
      {DATE_FIELDS.map(({ key }) => {
        const trans = labelTranslations[key]
        return (
          <label key={key} className="block text-sm">
            <span className="text-neutral-500 text-xs font-semibold uppercase tracking-wide">
              {isHi ? trans.hi : trans.en}
            </span>
            <input
              type="date"
              value={values[key]}
              min={key === 'expiryDate' && values.issueDate ? values.issueDate : undefined}
              disabled={disabled}
              onChange={(e) => onChange(key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 disabled:opacity-60 font-semibold"
            />
          </label>
        )
      })}
    </div>
  )
}
