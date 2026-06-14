import { useTranslation } from 'react-i18next'
import { ShieldCheck, Users, FileText, RefreshCw, Lock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/common/Badge'

export function RulesPage() {
  const { t } = useTranslation('pages')

  const safetyRules = t('rules.safety', { returnObjects: true }) as string[]
  const membershipRules = t('rules.membership', { returnObjects: true }) as string[]
  const documentDocs = t('rules.docs', { returnObjects: true }) as Array<{ item: string; spec: string }>
  const renewalPolicy = t('rules.renewal', { returnObjects: true }) as string[]
  const privacyItems = t('rules.privacy', { returnObjects: true }) as string[]

  const sections = [
    {
      icon: ShieldCheck,
      titleKey: 'rules.safetyTitle',
      iconBg: 'bg-blue-50',
      iconColor: 'text-[#0F4C81]',
      content: (
        <ul className="space-y-2.5">
          {safetyRules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
              <CheckCircle size={15} className="text-[#16A34A] shrink-0 mt-0.5" />
              {rule}
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: Users,
      titleKey: 'rules.membershipTitle',
      iconBg: 'bg-green-50',
      iconColor: 'text-[#16A34A]',
      content: (
        <ul className="space-y-2.5">
          {membershipRules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
              <CheckCircle size={15} className="text-[#16A34A] shrink-0 mt-0.5" />
              {rule}
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: FileText,
      titleKey: 'rules.documentsTitle',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      content: (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide rounded-l-lg">
                  {t('rules.docColDocument')}
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide rounded-r-lg">
                  {t('rules.docColSpec')}
                </th>
              </tr>
            </thead>
            <tbody>
              {documentDocs.map((doc, i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-neutral-50/50'}>
                  <td className="px-4 py-3 font-medium text-neutral-800">{doc.item}</td>
                  <td className="px-4 py-3 text-neutral-500">{doc.spec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      icon: RefreshCw,
      titleKey: 'rules.renewalTitle',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      content: (
        <ul className="space-y-2.5">
          {renewalPolicy.map((rule, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
              <CheckCircle size={15} className="text-purple-500 shrink-0 mt-0.5" />
              {rule}
            </li>
          ))}
        </ul>
      ),
    },
    {
      icon: Lock,
      titleKey: 'rules.privacyTitle',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      content: (
        <div className="space-y-3 text-sm text-neutral-700 leading-relaxed">
          {privacyItems.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="bg-[#0F4C81] py-14">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('rules.badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('rules.title')}</h1>
          <p className="text-blue-200">{t('rules.subtitle')}</p>
        </div>
      </div>

      <div className="section-padding bg-neutral-50">
        <div className="container-wide max-w-4xl space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon
            return (
              <div key={sec.titleKey} className="bg-white border border-neutral-100 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 ${sec.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={sec.iconColor} />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900">{t(sec.titleKey)}</h2>
                </div>
                {sec.content}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
