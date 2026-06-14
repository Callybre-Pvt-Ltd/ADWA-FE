import { useTranslation } from 'react-i18next'
import { ShieldCheck, CheckCircle, AlertTriangle, Users, RefreshCw, Lock, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

export function SafetyRulesSection() {
  const { t } = useTranslation('pages')

  const safetyRules = (t('rules.safety', { returnObjects: true }) ?? []) as string[]
  const membershipRules = (t('rules.membership', { returnObjects: true }) ?? []) as string[]
  const renewalPolicy = (t('rules.renewal', { returnObjects: true }) ?? []) as string[]
  const documentDocs = (t('rules.docs', { returnObjects: true }) ?? []) as Array<{ item: string; spec: string }>
  const privacyItems = (t('rules.privacy', { returnObjects: true }) ?? []) as string[]

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#0F4C81] text-sm font-semibold uppercase tracking-widest mb-2">
            {t('rules.badge')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            {t('rules.title')}
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto">{t('rules.subtitle')}</p>
        </div>

        {/* Row 1: Safety + Membership side by side */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Safety Rules */}
          <div className="bg-[#0F4C81] rounded-3xl p-7 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-white text-base">{t('rules.safetyTitle')}</h3>
            </div>
            <ul className="space-y-2.5">
              {safetyRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[15px] text-blue-100 leading-snug">
                  <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Membership Rules */}
          <div className="bg-white rounded-3xl p-7 border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                <Users size={20} className="text-[#16A34A]" />
              </div>
              <h3 className="font-bold text-neutral-900 text-base">{t('rules.membershipTitle')}</h3>
            </div>
            <ul className="space-y-2.5">
              {membershipRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[15px] text-neutral-700 leading-snug">
                  <CheckCircle size={13} className="text-[#16A34A] shrink-0 mt-0.5" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 2: Documents table + Renewal + Privacy */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Document Requirements — spans 2 cols */}
          <div className="lg:col-span-2 bg-amber-50 rounded-3xl p-7 border border-amber-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                <FileText size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-neutral-900 text-base">{t('rules.documentsTitle')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[15px]">
                <thead>
                  <tr>
                    <th className="text-left pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {t('rules.docColDocument')}
                    </th>
                    <th className="text-left pb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      {t('rules.docColSpec')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {documentDocs.map((doc, i) => (
                    <tr key={i}>
                      <td className="py-2.5 pr-4 font-medium text-neutral-800">{doc.item}</td>
                      <td className="py-2.5 text-neutral-500 text-sm">{doc.spec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Renewal + Privacy stacked */}
          <div className="flex flex-col gap-5">
            <div className="bg-violet-50 rounded-3xl p-6 border border-violet-100 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shrink-0">
                  <RefreshCw size={17} className="text-white" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm">{t('rules.renewalTitle')}</h3>
              </div>
              <ul className="space-y-2">
                {renewalPolicy.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 leading-snug">
                    <CheckCircle size={12} className="text-violet-500 shrink-0 mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0a0f1c] rounded-3xl p-6 flex items-start gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={16} className="text-blue-300" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1.5">{t('rules.privacyTitle')}</h4>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {privacyItems[5] ?? privacyItems[0]}
                </p>
                <Link
                  to={ROUTES.RULES}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold mt-3 hover:text-amber-300 transition-colors"
                >
                  <AlertTriangle size={11} />
                  {t('rules.title')} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
