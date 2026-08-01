import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, RefreshCw, CheckCircle, ArrowRight, Download } from 'lucide-react'
import { DocumentLookupSection } from '@/components/shared/DocumentLookupSection'

const SERVICE_LINKS = [
  { icon: FileText, titleKey: 'driverIdTitle', descKey: 'driverIdDesc', to: '/apply' },
  { icon: RefreshCw, titleKey: 'renewalTitle', descKey: 'renewalDesc', to: '/renewal' },
  { icon: CheckCircle, titleKey: 'trackingTitle', descKey: 'trackingDesc', to: '/status' },
  { icon: Download, titleKey: 'downloadTitle', descKey: 'downloadDesc', to: '#download-section' },
] as const

export default function ServicesPage() {
  const { t } = useTranslation(['pages', 'home'])

  return (
    <div className="bg-white pt-6">
      <section className="section-padding hero-gradient">
        <div className="container-wide">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_LINKS.map(({ icon: Icon, titleKey, descKey, to }) => (
              to.startsWith('#') ? (
                <a key={to} href={to} className="surface-card block p-6 group">
                  <div className="icon-tile h-11 w-11">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-neutral-900">{t(`home:services.${titleKey}`)}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{t(`home:services.${descKey}`)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-royal-700 group-hover:text-orange-600">
                    {t('pages:services.getStarted')} <ArrowRight className="h-4 w-4" />
                  </span>
                </a>
              ) : (
                <Link key={to} to={to} className="surface-card block p-6 group">
                  <div className="icon-tile h-11 w-11">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-neutral-900">{t(`home:services.${titleKey}`)}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{t(`home:services.${descKey}`)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-royal-700 group-hover:text-orange-600">
                    {t('pages:services.getStarted')} <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>

      <section id="download-section" className="section-padding bg-neutral-50/50 border-t border-neutral-100">
        <div className="container-wide max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">{t('pages:downloads.title', 'Document & Receipt Download')}</h2>
            <p className="mt-2 text-sm text-neutral-600">{t('pages:downloads.subtitle', 'Lookup and download your official receipts, ID cards, and certificates')}</p>
          </div>
          <DocumentLookupSection />
        </div>
      </section>
    </div>
  )
}
