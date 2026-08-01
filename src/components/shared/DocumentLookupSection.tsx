import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, Download, FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { usePublicDocuments } from '@/hooks/usePublicDocuments'
import type { DocumentAvailability } from '@/services/api/publicDocuments.service'

type DownloadForm = { membershipNumber: string }

export function DocumentLookupSection() {
  const { t } = useTranslation('pages')
  const [searchParams] = useSearchParams()
  const refFromUrl = searchParams.get('ref') ?? ''

  const [memberNumber, setMemberNumber] = useState<string | null>(refFromUrl || null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DownloadForm>({
    defaultValues: { membershipNumber: refFromUrl },
  })

  useEffect(() => {
    if (refFromUrl) {
      setValue('membershipNumber', refFromUrl)
      setMemberNumber(refFromUrl.trim())
    }
  }, [refFromUrl, setValue])

  const { data, isLoading, isFetching, isError, refetch } = usePublicDocuments(
    memberNumber ?? '',
    !!memberNumber,
  )

  const onSearch = handleSubmit((form) => {
    setMemberNumber(form.membershipNumber.trim())
  })

  const documents: { id: string; label: string; doc: DocumentAvailability }[] = data
    ? [
        { id: 'id-card', label: t('downloads.idCard'), doc: data.idCard },
        { id: 'receipt', label: t('downloads.receipt'), doc: data.paymentReceipt },
        { id: 'certificate', label: t('downloads.certificate'), doc: data.certificate },
      ]
    : []

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={onSearch} className="surface-card p-6 space-y-4 mb-8">
        <p className="text-sm text-neutral-600">{t('downloads.note')}</p>
        <div>
          <Label htmlFor="membershipNumber">{t('renewal.membershipNumber')}</Label>
          <Input
            id="membershipNumber"
            {...register('membershipNumber', { required: true, minLength: 3 })}
            placeholder={t('renewal.membershipPlaceholder')}
            className="mt-1"
          />
          {errors.membershipNumber && (
            <p className="text-sm text-red-600 mt-1">{t('downloads.requiredMsg')}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          loading={isFetching && !!memberNumber}
          loadingText={t('common:buttons.searching', 'Searching…')}
        >
          <Search className="h-4 w-4 mr-1" /> {t('track.searchBtn')}
        </Button>
      </form>

      {memberNumber && isLoading && (
        <div className="surface-card p-6 text-center text-neutral-500">
          {t('common:buttons.searching', 'Searching…')}
        </div>
      )}

      {memberNumber && isError && (
        <div className="surface-card p-6 text-center mb-8">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="mt-3 font-bold text-neutral-900">{t('downloads.notFoundTitle')}</h3>
          <p className="mt-2 text-sm text-neutral-500">{t('downloads.notFoundMsg')}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refetch()}
            loading={isFetching}
            loadingText={t('common:buttons.searching', 'Trying again…')}
          >
            Try Again
          </Button>
        </div>
      )}

      {data && (
        <>
          <p className="mb-4 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-900">
            {t('downloads.foundFor', { name: data.fullName })}
          </p>
          <div className="space-y-3">
            {documents.map(({ id, label, doc }) => (
              <div
                key={id}
                className="surface-card flex items-center justify-between gap-3 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-royal-700" />
                  <div className="min-w-0">
                    <span className="block font-medium text-neutral-900">{label}</span>
                    {!doc.available && doc.reason && (
                      <span className="text-xs text-neutral-500">{doc.reason}</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!doc.available}
                  onClick={() => {
                    if (doc.downloadUrl) window.open(doc.downloadUrl, '_blank')
                  }}
                >
                  <Download className="h-4 w-4 mr-1" /> {t('downloads.download')}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
