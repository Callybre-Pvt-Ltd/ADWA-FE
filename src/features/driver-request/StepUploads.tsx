import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FileUploadZone } from '@/components/shared/FileUploadZone'
import type { DriverRequestFormData } from '@/utils/validators'
import { FormSection } from './FormField'

function fileToPreview(file: File): string {
  return URL.createObjectURL(file)
}

const UPLOAD_FIELDS: { field: keyof DriverRequestFormData; labelKey: string; hintKey?: string }[] = [
  { field: 'driverPhoto', labelKey: 'photo', hintKey: 'photoSize' },
  { field: 'aadhaarFront', labelKey: 'aadhaarFront', hintKey: 'docSize' },
  { field: 'aadhaarBack', labelKey: 'aadhaarBack', hintKey: 'docSize' },
  { field: 'licenseFront', labelKey: 'licenseFront', hintKey: 'docSize' },
  { field: 'licenseBack', labelKey: 'licenseBack', hintKey: 'docSize' },
  { field: 'vehicleRc', labelKey: 'vehicleRc', hintKey: 'docSize' },
]

export default function StepUploads() {
  const { t } = useTranslation('pages')
  const docs = (key: string) => t(`apply.docs.${key}`)

  const { setValue, formState: { errors } } = useFormContext<DriverRequestFormData>()
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const handleFile = (field: keyof DriverRequestFormData, file: File) => {
    setPreviews((current) => {
      const existingPreview = current[field]
      if (existingPreview) URL.revokeObjectURL(existingPreview)
      return {
        ...current,
        [field]: fileToPreview(file),
      }
    })
    setValue(field, file as never, { shouldValidate: true })
  }

  const handleRemoveFile = (field: keyof DriverRequestFormData) => {
    setValue(field, undefined as never, { shouldValidate: true, shouldDirty: true })
    setPreviews((current) => {
      const existingPreview = current[field]
      if (existingPreview) URL.revokeObjectURL(existingPreview)
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const fileFieldValue = (field: keyof DriverRequestFormData) => handleFile.bind(null, field)

  return (
    <FormSection title={t('apply.documentUpload')} singleCol>
      <p className="text-xs text-neutral-600 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3">
        {docs('noteText')} {t('apply.docs.optionalNote', '(All documents are optional for now — you can upload later.)')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {UPLOAD_FIELDS.map(({ field, labelKey, hintKey }) => (
          <FileUploadZone
            key={field}
            label={docs(labelKey)}
            hint={hintKey ? docs(hintKey) : undefined}
            accept="image/*,.pdf"
            maxSizeMB={field === 'driverPhoto' ? 1 : 2}
            preview={previews[field]}
            onFileSelect={fileFieldValue(field)}
            onFileRemove={() => handleRemoveFile(field)}
            error={errors[field]?.message as string | undefined}
          />
        ))}
      </div>
    </FormSection>
  )
}
