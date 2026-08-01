import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/shared/PageHero'
import { DocumentLookupSection } from '@/components/shared/DocumentLookupSection'

export default function DownloadPage() {
  const { t } = useTranslation('pages')

  return (
    <div className="bg-white">
      <PageHero title={t('downloads.title')} subtitle={t('downloads.subtitle')} />
      <section className="section-padding">
        <div className="container-wide">
          <DocumentLookupSection />
        </div>
      </section>
    </div>
  )
}
