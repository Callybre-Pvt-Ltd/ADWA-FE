import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Shield, FileText, RefreshCw, Lock } from 'lucide-react'

function RuleList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-3 pl-5 text-base leading-relaxed text-neutral-800 marker:font-bold marker:text-royal-700 text-justify">
      {items.map((rule, i) => (
        <li key={i}>{rule}</li>
      ))}
    </ol>
  )
}

function RuleCard({
  icon: Icon,
  title,
  children,
  variant = 'default',
}: {
  icon: typeof Shield
  title: string
  children: ReactNode
  variant?: 'default' | 'warning' | 'info'
}) {
  const styles = {
    default: 'border-neutral-300 bg-white',
    warning: 'border-amber-400 bg-amber-50',
    info: 'border-royal-300 bg-royal-50',
  }
  const iconStyles = {
    default: 'bg-royal-700 text-white',
    warning: 'bg-amber-600 text-white',
    info: 'bg-royal-700 text-white',
  }

  return (
    <div className={`rounded-xl border p-5 md:p-6 ${styles[variant]}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
      </div>
      <div className="min-w-0">
        {children}
      </div>
    </div>
  )
}

export function RulesRegulationsPanel() {
  const { t } = useTranslation('pages')
  const safety = t('rules.safety', { returnObjects: true }) as string[]
  const membership = t('rules.membership', { returnObjects: true }) as string[]
  const renewal = t('rules.renewal', { returnObjects: true }) as string[]
  const privacy = t('rules.privacy', { returnObjects: true }) as string[]
  const docs = t('rules.docs', { returnObjects: true }) as { item: string; spec: string }[]

  return (
    <section id="rules-regulations" className="mt-10 scroll-mt-28">
      <div className="surface-card p-6 md:p-8">
        <div className="flex items-start gap-4 border-b border-neutral-200 pb-5 mb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900">{t('rules.title')}</h2>
            <p className="mt-2 text-base text-neutral-700">{t('rules.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-8">
          <RuleCard icon={Shield} title={t('rules.safetyTitle')} variant="warning">
            <RuleList items={safety} />
          </RuleCard>

          <RuleCard icon={FileText} title={t('rules.membershipTitle')} variant="info">
            <RuleList items={membership} />
          </RuleCard>


          <RuleCard icon={RefreshCw} title={t('rules.renewalTitle')}>
            <RuleList items={renewal} />
          </RuleCard>

          <RuleCard icon={Lock} title={t('rules.privacyTitle')}>
            <RuleList items={privacy} />
          </RuleCard>
        </div>
      </div>
    </section>
  )
}
