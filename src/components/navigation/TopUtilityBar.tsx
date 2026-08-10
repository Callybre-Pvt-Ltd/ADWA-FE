import { Phone, Mail } from 'lucide-react'
import { CONTACT_INFO, SOCIAL_LINKS } from '@/constants'

const SOCIAL = [
  { key: 'facebook', url: SOCIAL_LINKS.facebook, label: 'FB' },
  { key: 'instagram', url: SOCIAL_LINKS.instagram, label: 'IG' },
  { key: 'youtube', url: SOCIAL_LINKS.youtube, label: 'YT' },
].filter((s) => Boolean(s.url))

export function TopUtilityBar() {
  return (
    <div className="hidden md:block bg-blue-900 text-white text-sm border-b border-blue-800">
      <div className="container-wide flex h-8 items-center justify-between">
        <div className="flex items-center gap-4">
          <a href={`tel:${CONTACT_INFO.phoneTel}`} className="flex items-center gap-1 hover:text-orange-300 transition-colors">
            <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
            {CONTACT_INFO.phone}
          </a>
          <a href={`mailto:${CONTACT_INFO.email}`} className="hidden lg:flex items-center gap-1 hover:text-orange-300 transition-colors">
            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
            {CONTACT_INFO.email}
          </a>
          <a
            href={SOCIAL_LINKS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1 hover:text-orange-300 transition-colors"
          >
            WhatsApp {CONTACT_INFO.whatsapp}
          </a>
        </div>
        <div className="flex items-center gap-2">
          {SOCIAL.map(({ key, url, label }) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={key}
              className="font-semibold hover:text-orange-300 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
