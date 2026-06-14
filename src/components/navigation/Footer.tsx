import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin, Share2, MessageCircle, Video, Radio } from 'lucide-react'
import { ROUTES, CONTACT_INFO } from '@/constants'

export function Footer() {
  const { t } = useTranslation('common')

  return (
    <footer className="bg-[#0f172a] text-neutral-300">
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#0F4C81] flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">{t('footer.brandName')}</div>
                <div className="text-xs text-neutral-400 leading-tight">{t('footer.brandSub')}</div>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed mb-5">
              {t('footer.aboutText')}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Share2, labelKey: 'footer.social.facebook' },
                { icon: MessageCircle, labelKey: 'footer.social.twitter' },
                { icon: Radio, labelKey: 'footer.social.instagram' },
                { icon: Video, labelKey: 'footer.social.youtube' },
              ].map(({ icon: Icon, labelKey }) => (
                <a
                  key={labelKey}
                  href="#"
                  aria-label={t(labelKey)}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2.5">
              {[
                { key: 'home', path: ROUTES.HOME },
                { key: 'about', path: ROUTES.ABOUT },
                { key: 'services', path: ROUTES.SERVICES },
                { key: 'apply', path: ROUTES.APPLY },
                { key: 'track', path: ROUTES.TRACK },
              ].map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2.5">
              {[
                { labelKey: 'footer.serviceLinks.driverIdReg', path: ROUTES.APPLY },
                { labelKey: 'footer.serviceLinks.membershipRenewal', path: ROUTES.RENEWAL },
                { labelKey: 'footer.serviceLinks.appTracking', path: ROUTES.TRACK },
                { labelKey: 'footer.serviceLinks.downloadCenter', path: ROUTES.DOWNLOADS },
                { labelKey: 'footer.serviceLinks.rulesGuidelines', path: ROUTES.RULES },
              ].map((item) => (
                <li key={item.labelKey}>
                  <Link
                    to={item.path}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 text-[#16A34A] shrink-0" />
                <span className="text-sm text-neutral-400">{CONTACT_INFO.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="mt-0.5 text-[#16A34A] shrink-0" />
                <span className="text-sm text-neutral-400 break-all">{CONTACT_INFO.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 text-[#16A34A] shrink-0" />
                <span className="text-sm text-neutral-400">{CONTACT_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">{t('footer.copyright')}</p>
          <p className="text-xs text-neutral-500">{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
