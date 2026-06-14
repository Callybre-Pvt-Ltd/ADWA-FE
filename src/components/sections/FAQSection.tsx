import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { homeService } from '@/services'
import type { FAQ } from '@/types'

function AccordionItem({ item, open, onToggle }: { item: FAQ; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left"
      aria-expanded={open}
    >
      <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        open
          ? 'border-[#0F4C81]/30 bg-[#0F4C81]/5 shadow-sm'
          : 'border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <span className={`text-base font-semibold leading-snug text-left ${open ? 'text-[#0F4C81]' : 'text-neutral-800'}`}>
            {item.question}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-[#0F4C81]' : 'text-neutral-400'}`}
          />
        </div>
        {open && (
          <div className="px-5 pb-4">
            <p className="text-[15px] text-neutral-600 leading-relaxed">{item.answer}</p>
          </div>
        )}
      </div>
    </button>
  )
}

export function FAQSection() {
  const { t } = useTranslation('home')
  const [openId, setOpenId] = useState<string | null>(null)

  const { data: faqs } = useQuery({
    queryKey: ['faqs'],
    queryFn: homeService.getFAQs,
    staleTime: 1000 * 60 * 10,
  })

  const list = faqs ?? []
  const half = Math.ceil(list.length / 2)
  const left = list.slice(0, half)
  const right = list.slice(half)

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id)

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-blue-50/60">
      <div className="container-wide">
        <div className="text-center mb-14">
          <p className="text-[#0F4C81] text-sm font-semibold uppercase tracking-widest mb-2">{t('faq.eyebrow')}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">{t('faq.title')}</h2>
          <p className="text-neutral-500 max-w-lg mx-auto">{t('faq.subtitle')}</p>
        </div>

        {list.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-3 max-w-5xl mx-auto">
            <div className="flex flex-col gap-3">
              {left.map(item => (
                <AccordionItem key={item.id} item={item} open={openId === item.id} onToggle={() => toggle(item.id)} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {right.map(item => (
                <AccordionItem key={item.id} item={item} open={openId === item.id} onToggle={() => toggle(item.id)} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-base text-neutral-500">
            {t('faq.stillQuestion')}{' '}
            <a href="/contact" className="text-[#0F4C81] font-semibold hover:underline">
              {t('faq.contactTeam')}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
