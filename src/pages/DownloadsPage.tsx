import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Award, CreditCard, FileText, Receipt, Download, Lock } from 'lucide-react'
import { downloadService } from '@/services'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'

const ICON_MAP: Record<string, React.ElementType> = {
  award: Award,
  'credit-card': CreditCard,
  'file-text': FileText,
  receipt: Receipt,
}

const ICON_COLORS = [
  { bg: 'bg-blue-50', text: 'text-[#0F4C81]' },
  { bg: 'bg-green-50', text: 'text-[#16A34A]' },
  { bg: 'bg-amber-50', text: 'text-amber-600' },
  { bg: 'bg-purple-50', text: 'text-purple-600' },
]

export function DownloadsPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const { data: items, isLoading } = useQuery({
    queryKey: ['downloads'],
    queryFn: downloadService.getItems,
    staleTime: 1000 * 60 * 10,
  })

  const downloadMutation = useMutation({
    mutationFn: (id: string) => downloadService.downloadFile(id),
  })

  const howSteps = [
    { n: '1', titleKey: 'downloads.howStep1Title', descKey: 'downloads.howStep1Desc' },
    { n: '2', titleKey: 'downloads.howStep2Title', descKey: 'downloads.howStep2Desc' },
    { n: '3', titleKey: 'downloads.howStep3Title', descKey: 'downloads.howStep3Desc' },
  ]

  return (
    <div>
      <div className="bg-[#0F4C81] py-14">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('downloads.badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('downloads.title')}</h1>
          <p className="text-blue-200">{t('downloads.subtitle')}</p>
        </div>
      </div>

      <div className="section-padding bg-neutral-50">
        <div className="container-wide max-w-4xl">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 mb-8">
            <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <strong>{tc('misc.note')}</strong> {t('downloads.note')} {t('downloads.noteExtra')}
            </div>
          </div>

          {isLoading ? <Spinner /> : (
            <div className="grid sm:grid-cols-2 gap-5">
              {(items ?? []).map((item, i) => {
                const Icon = ICON_MAP[item.icon] ?? FileText
                const color = ICON_COLORS[i % ICON_COLORS.length]
                return (
                  <div key={item.id} className="bg-white border border-neutral-100 rounded-2xl p-6 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${color.bg} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon size={22} className={color.text} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 text-base mb-1">{item.title}</h3>
                        <p className="text-sm text-neutral-500 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-neutral-400">
                            <span className="bg-neutral-100 px-2 py-0.5 rounded">{item.type}</span>
                            <span>{item.size}</span>
                          </div>
                          <button
                            onClick={() => downloadMutation.mutate(item.id)}
                            disabled={downloadMutation.isPending}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${color.text} ${color.bg} hover:opacity-80`}
                          >
                            <Download size={14} />
                            {t('downloads.download')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-10 bg-white border border-neutral-100 rounded-2xl p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">{t('downloads.howTitle')}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {howSteps.map((s) => (
                <div key={s.n} className="text-center p-4 bg-neutral-50 rounded-xl">
                  <div className="w-8 h-8 bg-[#0F4C81] text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                    {s.n}
                  </div>
                  <div className="text-sm font-semibold text-neutral-900 mb-1">{t(s.titleKey)}</div>
                  <div className="text-xs text-neutral-500">{t(s.descKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
