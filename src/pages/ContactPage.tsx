import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Phone, Mail, MapPin, Clock, CheckCircle, MessageSquare } from 'lucide-react'
import { contactService } from '@/services'
import { Badge } from '@/components/common/Badge'
import { CONTACT_INFO } from '@/constants'
import type { ContactFormData } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(20),
})

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0F4C81] transition-all"

export function ContactPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: contactService.submit,
    onSuccess: () => {
      setSubmitted(true)
      reset()
    },
  })

  const onSubmit: SubmitHandler<ContactFormData> = (data) => mutation.mutate(data)

  return (
    <div>
      <div className="bg-[#0F4C81] py-14">
        <div className="container-wide text-center">
          <Badge variant="accent" className="mb-4">{t('contact.badge')}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('contact.title')}</h1>
          <p className="text-blue-200">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="section-padding bg-neutral-50">
        <div className="container-wide max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-neutral-900">{t('contact.infoTitle')}</h2>

              {[
                { icon: Phone, labelKey: 'contact.mainHelpline', lines: [CONTACT_INFO.phone], color: 'text-[#0F4C81]', bg: 'bg-blue-50' },
                { icon: Phone, labelKey: 'contact.supportNumbers', lines: CONTACT_INFO.supportPhone.split(' / '), color: 'text-[#16A34A]', bg: 'bg-green-50' },
                { icon: Mail, labelKey: 'contact.emailSupport', lines: [CONTACT_INFO.email], color: 'text-amber-600', bg: 'bg-amber-50' },
                { icon: MapPin, labelKey: 'contact.officeAddress', lines: [CONTACT_INFO.address], color: 'text-purple-600', bg: 'bg-purple-50' },
                { icon: Clock, labelKey: 'contact.workingHours', lines: [CONTACT_INFO.hours], color: 'text-rose-500', bg: 'bg-rose-50' },
              ].map(({ icon: Icon, labelKey, lines, color, bg }) => (
                <div key={labelKey} className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-100">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">{t(labelKey)}</div>
                    {lines.map((line) => (
                      <div key={line} className="text-sm font-medium text-neutral-900">{line}</div>
                    ))}
                  </div>
                </div>
              ))}

              <a
                href="https://wa.me/917319222335"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#25D366] rounded-2xl text-white hover:bg-[#22bf5b] transition-colors"
              >
                <MessageSquare size={20} />
                <div>
                  <div className="font-semibold text-sm">{t('contact.whatsappTitle')}</div>
                  <div className="text-xs opacity-90">{t('contact.whatsappSubtitle')}</div>
                </div>
              </a>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">{t('contact.formTitle')}</h2>

                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-[#16A34A]" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{t('contact.successTitle')}</h3>
                    <p className="text-sm text-neutral-500 mb-5">{t('contact.successMsg')}</p>
                    <button onClick={() => setSubmitted(false)} className="text-sm text-[#0F4C81] font-semibold hover:underline">
                      {t('contact.sendAnother')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('contact.name')} <span className="text-red-500">*</span></label>
                        <input {...register('name')} className={inputClass} placeholder={t('contact.namePlaceholder')} />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('contact.mobile')} <span className="text-red-500">*</span></label>
                        <input {...register('mobile')} className={inputClass} placeholder={t('contact.mobilePlaceholder')} />
                        {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('contact.email')} <span className="text-red-500">*</span></label>
                      <input {...register('email')} type="email" className={inputClass} placeholder={t('contact.emailPlaceholder')} />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('contact.subject')} <span className="text-red-500">*</span></label>
                      <input {...register('subject')} className={inputClass} placeholder={t('contact.subjectPlaceholder')} />
                      {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{t('contact.message')} <span className="text-red-500">*</span></label>
                      <textarea {...register('message')} rows={5} className={inputClass} placeholder={t('contact.messagePlaceholder')} />
                      {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0d3d6b] transition-colors disabled:opacity-50"
                    >
                      {mutation.isPending ? tc('buttons.sending') : t('contact.send')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mt-8 bg-white border border-neutral-100 rounded-2xl overflow-hidden">
            <div className="bg-neutral-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-neutral-400 mx-auto mb-2" />
                <div className="text-neutral-500 text-sm font-medium">{tc('misc.mapPlaceholder')}</div>
                <div className="text-neutral-400 text-xs mt-1">{t('contact.mapAddress')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
