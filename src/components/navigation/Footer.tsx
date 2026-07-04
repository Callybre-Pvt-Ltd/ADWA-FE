import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin } from "lucide-react";
import { CONTACT_INFO, SOCIAL_LINKS } from "@/constants";
import { getPrimaryNavRoutes } from "@/routes/routes.data";
import { AdwaSeal } from "@/components/shared/AdwaSeal";
import { WhatsAppLogo } from "@/components/shared/WhatsAppLogo";

export function Footer() {
  const { t } = useTranslation("nav");
  const { t: th } = useTranslation("home");
  const primaryRoutes = getPrimaryNavRoutes();

  return (
    <footer className="mt-auto bg-blue-900 text-white">
      <div className="container-wide section-padding">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-start gap-3">
              <AdwaSeal size="lg" />
              <div>
                <p className="text-lg font-bold">
                  All Drivers Welfare Association
                </p>
                <p className="mt-1 text-sm text-white/80">
                  Reg. No: ADWA/2019/INDIA
                </p>
                <p className="text-sm text-white/70 italic">
                  Serving Drivers Since 2019
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold mb-4 text-white">
              {th("footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {primaryRoutes.map((route) => (
                <li key={route.key}>
                  <Link
                    to={route.path}
                    className="text-base text-white/80 hover:text-white font-medium transition-colors"
                  >
                    {t(route.label.replace("nav.", ""))}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/services"
                  className="text-base text-white/80 hover:text-white font-medium transition-colors"
                >
                  {th("footer.districts")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold mb-4 text-white">
              {th("footer.contact")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-base text-white/80">
                <Phone
                  className="h-5 w-5 shrink-0 text-blue-300"
                  aria-hidden="true"
                />
                {CONTACT_INFO.phone}
              </li>
              <li className="flex items-center gap-2 text-base text-white/80">
                <Mail
                  className="h-5 w-5 shrink-0 text-blue-300"
                  aria-hidden="true"
                />
                {CONTACT_INFO.email}
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-white/80 hover:text-white font-medium"
                >
                  <WhatsAppLogo className="h-5 w-5 shrink-0 text-green-400" />
                  WhatsApp Help
                </a>
              </li>
              <li className="flex items-start gap-2 text-base text-white/80">
                <MapPin
                  className="h-5 w-5 shrink-0 text-blue-300 mt-0.5"
                  aria-hidden="true"
                />
                {CONTACT_INFO.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/district/login"
              className="inline-flex min-w-35 items-center justify-center border border-white/30 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              District Login
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex min-w-35 items-center justify-center bg-white px-5 py-2.5 text-sm font-medium text-blue-900 hover:bg-white/90 transition-colors"
            >
              Admin Login
            </Link>
          </div>
          <p className="mt-6 text-center text-sm text-white/60">
            © {new Date().getFullYear()} All Drivers Welfare Association. All
            rights reserved.
          </p>
        </div>
      </div>
      <div className="flag-stripe" aria-hidden="true" />
    </footer>
  );
}
