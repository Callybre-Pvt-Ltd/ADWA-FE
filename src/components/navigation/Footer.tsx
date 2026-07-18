import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin } from "lucide-react";
import { CONTACT_INFO, SOCIAL_LINKS } from "@/constants";
import { getPrimaryNavRoutes } from "@/routes/routes.data";
import { AdwaSeal } from "@/components/shared/AdwaSeal";
import { WhatsAppLogo } from "@/components/shared/WhatsAppLogo";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

export function Footer() {
  const { t, i18n } = useTranslation("nav");
  const { t: th } = useTranslation("home");
  const primaryRoutes = getPrimaryNavRoutes();

  return (
    <footer className="mt-auto bg-blue-900 text-white">
      <div className="container-wide section-padding">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 justify-between items-start">
          {/* Logo Column */}
          <div className="w-full lg:w-1/3 max-w-sm shrink-0">
            <div className="flex items-start gap-3">
              <AdwaSeal size="lg" />
              <div>
                <p className="text-lg font-bold">
                  {t('title')}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {t('regNo')}
                </p>
                <p className="text-sm text-white/70 italic">
                  {t('servingSince')}
                </p>
              </div>
            </div>
          </div>

          {/* Links and Contact side-by-side on mobile */}
          <div className="w-full lg:w-2/3 flex flex-row gap-6 sm:gap-10 justify-between items-start flex-wrap sm:flex-nowrap">
            {/* Quick Links Column */}
            <div className="min-w-[120px] max-w-[200px]">
              <h4 className="text-sm md:text-base font-bold mb-3 md:mb-4 text-white">
                {th("footer.quickLinks")}
              </h4>
              <ul className="space-y-2">
                {primaryRoutes.map((route) => (
                  <li key={route.key}>
                    <Link
                      to={route.path}
                      className="text-sm md:text-base text-white/80 hover:text-orange-400 font-medium transition-colors"
                    >
                      {t(route.label.replace("nav.", ""))}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm md:text-base font-bold mb-3 md:mb-4 text-white">
                {th("footer.contact")}
              </h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-white/80">
                <li className="group flex items-start gap-3">
                  <Phone
                    className="h-4.5 w-4.5 md:h-5 md:w-5 shrink-0 text-blue-300 group-hover:text-orange-400 transition-colors mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="leading-normal">{CONTACT_INFO.phone}</span>
                </li>
                <li className="group flex items-start gap-3">
                  <Mail
                    className="h-4.5 w-4.5 md:h-5 md:w-5 shrink-0 text-blue-300 group-hover:text-orange-400 transition-colors mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="leading-normal break-all">{CONTACT_INFO.email}</span>
                </li>
                <li>
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 font-medium transition-colors"
                  >
                    <WhatsAppLogo className="h-4.5 w-4.5 md:h-5 md:w-5 shrink-0 text-green-400 group-hover:text-orange-400 transition-colors mt-0.5" />
                    <span className="leading-normal">{t('whatsappHelp')}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 transition-colors"
                  >
                    <MapPin
                      className="h-4.5 w-4.5 md:h-5 md:w-5 shrink-0 text-blue-300 group-hover:text-orange-400 transition-colors mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="leading-normal hover:underline">
                      {i18n.language === 'hi' ? 'मकान नं. 199/1, करतार नगर, अमन अस्पताल के पास, भारत' : CONTACT_INFO.address}
                    </span>
                  </a>
                </li>
              </ul>
              
              {/* Social Connection */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h5 className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2.5">
                  {i18n.language === 'hi' ? 'सोशल कनेक्शन' : 'Social Connection'}
                </h5>
                <div className="flex items-center gap-2.5">
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center h-8.5 w-8.5 rounded-full bg-white/5 text-white/60 hover:bg-orange-500 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="h-4.5 w-4.5" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center h-8.5 w-8.5 rounded-full bg-white/5 text-white/60 hover:bg-orange-500 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="h-4.5 w-4.5" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center h-8.5 w-8.5 rounded-full bg-white/5 text-white/60 hover:bg-orange-500 hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <YoutubeIcon className="h-4.5 w-4.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 pb-6">
          <p className="mt-4 text-center text-sm text-white/60">
            © {new Date().getFullYear()} All Drivers Welfare Association. All
            rights reserved.
          </p>
        </div>
      </div>
      <div className="flag-stripe" aria-hidden="true" />
    </footer>
  );
}
