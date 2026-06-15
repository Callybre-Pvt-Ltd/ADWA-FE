import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { Download, FileText } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type DownloadForm = { membershipNumber: string }

const DOCUMENTS = [
  { id: 'id-card', label: 'ADWA Driver ID Card' },
  { id: 'receipt', label: 'Payment Receipt' },
  { id: 'certificate', label: 'Membership Certificate' },
]

export default function DownloadPage() {
  const { t } = useTranslation('pages')
  const { register, handleSubmit } = useForm<DownloadForm>()

  return (
    <div className="bg-white">
      <PageHero title={t('downloads.title')} subtitle={t('downloads.subtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(() => {})} className="surface-card p-6 space-y-4 mb-8">
            <p className="text-sm text-neutral-600">{t('downloads.note')}</p>
            <div>
              <Label htmlFor="membershipNumber">{t('renewal.membershipNumber')}</Label>
              <Input id="membershipNumber" {...register('membershipNumber')} placeholder={t('renewal.membershipPlaceholder')} className="mt-1" />
            </div>
            <Button type="submit" className="w-full">{t('track.searchBtn')}</Button>
          </form>
          <div className="space-y-3">
            {DOCUMENTS.map((doc) => (
              <div key={doc.id} className="surface-card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-royal-700" />
                  <span className="font-medium text-neutral-900">{doc.label}</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" /> {t('downloads.download')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
