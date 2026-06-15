import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FileUploadZone } from '@/components/shared/FileUploadZone'
import type { DriverRequestFormData } from '@/utils/validators'
import { FormSection } from './FormField'

function fileToPreview(file: File): string {
  return URL.createObjectURL(file)
}

export default function StepUploads() {
  const { t } = useTranslation('pages')
  const docs = (key: string) => t(`apply.docs.${key}`)

  const { setValue, formState: { errors } } = useFormContext<DriverRequestFormData>()
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const handleFile = (field: keyof DriverRequestFormData, file: File) => {
    setValue(field, file as never, { shouldValidate: true })
    setPreviews(p => ({ ...p, [field]: fileToPreview(file) }))
  }

  return (
    <FormSection title={t('apply.documentUpload')} singleCol>
      <p className="text-xs text-neutral-600 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3">
        {docs('noteText')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FileUploadZone
          label={docs('photo')}
          hint={docs('photoSize')}
          accept="image/*"
          maxSizeMB={1}
          preview={previews.passportPhoto}
          onFileSelect={f => handleFile('passportPhoto', f)}
          error={errors.passportPhoto?.message}
        />
        <FileUploadZone
          label={docs('aadhaarFront')}
          hint={docs('docSize')}
          accept="image/*,.pdf"
          maxSizeMB={2}
          preview={previews.aadharCopy}
          onFileSelect={f => handleFile('aadharCopy', f)}
          error={errors.aadharCopy?.message}
        />
        <FileUploadZone
          label={docs('licenseFront')}
          hint={docs('docSize')}
          accept="image/*,.pdf"
          maxSizeMB={2}
          preview={previews.licenseCopy}
          onFileSelect={f => handleFile('licenseCopy', f)}
          error={errors.licenseCopy?.message}
        />
      </div>
    </FormSection>
  )
}
