import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, Phone, Mail, MapPin, User, Tag, Send, MessageSquare, Info } from 'lucide-react'
import { contactFormSchema, type ContactFormData } from '@/utils/validators'
import { contactService } from '@/services'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CONTACT_INFO } from '@/constants'
import { PageHero } from '@/components/shared/PageHero'

export default function ContactPage() {
  const { t, i18n } = useTranslation('pages')
  const isHi = i18n.language === 'hi'
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })
  const mutation = useMutation({
    mutationFn: contactService.submit,
    onSuccess: () => { setSubmitted(true); reset() },
    onError: (err: Error) => toast.error(err.message),
  })

  return (
    <div className="bg-neutral-50 min-h-screen">
      <PageHero title={t('contact.title')} subtitle={t('contact.subtitle')} />
      
      <section className="section-padding py-12 md:py-16">
        <div className="container-wide max-w-5xl grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">{t('contact.infoTitle')}</h2>
              <div className="h-1 w-12 bg-blue-900 rounded-full mt-2" />
            </div>
            
            <div className="space-y-4">
              {[
                { 
                  icon: Phone, 
                  label: t('contact.mainHelpline'), 
                  value: CONTACT_INFO.phone, 
                  isLink: false,
                  colorClass: 'bg-orange-50 text-orange-600 border-orange-100/50'
                },
                { 
                  icon: Mail, 
                  label: t('contact.emailSupport'), 
                  value: CONTACT_INFO.email, 
                  isLink: false,
                  colorClass: 'bg-blue-50 text-blue-600 border-blue-100/50'
                },
                { 
                  icon: MapPin, 
                  label: t('contact.officeAddress'), 
                  value: isHi ? 'मकान नं. 199/1, करतार नगर, अमन अस्पताल के पास, भारत' : CONTACT_INFO.address, 
                  isLink: true,
                  colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                },
              ].map(({ icon: Icon, label, value, isLink, colorClass }) => (
                <div 
                  key={label} 
                  className="flex gap-4 rounded-2xl border border-neutral-200 p-5 bg-white shadow-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                >
                  <div className={`rounded-xl p-3 shrink-0 border ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-wider leading-none">{label}</p>
                    {isLink ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-blue-700 hover:text-blue-900 leading-relaxed block truncate hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-neutral-900 leading-relaxed break-words">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Support Message Alert Banner */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4.5 flex gap-3 text-sm text-blue-800">
              <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-xs tracking-wider uppercase text-blue-900">{isHi ? 'सहायता समय' : 'Support Hours'}</span>
                <span className="text-xs text-blue-700/90 leading-relaxed block">
                  {isHi 
                    ? 'हमारा सहायता डेस्क सोमवार से शनिवार सुबह 10:00 बजे से शाम 6:00 बजे तक सक्रिय रहता है।'
                    : 'Our support desk is active from Monday to Saturday, 10:00 AM to 6:00 PM.'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 p-6 md:p-8 bg-white shadow-card">
            <div className="border-b border-neutral-100 pb-5 mb-5">
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">{t('contact.formTitle')}</h2>
              <p className="text-xs text-neutral-500 mt-1">{isHi ? 'हमारे प्रतिनिधि जल्द ही आपसे संपर्क करेंगे।' : 'Our support representatives will get back to you shortly.'}</p>
            </div>

            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
                  <div className="relative rounded-full bg-emerald-50 p-4 text-emerald-600 border border-emerald-100">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-950">{t('contact.successTitle')}</h3>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">{t('contact.successMsg')}</p>
                </div>
                <Button 
                  variant="ghost" 
                  className="mt-2 rounded-xl text-blue-800 hover:text-blue-900 hover:bg-blue-50 font-bold border border-neutral-200" 
                  onClick={() => setSubmitted(false)}
                >
                  {t('contact.sendAnother')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <fieldset disabled={mutation.isPending} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-black text-neutral-600 uppercase tracking-wider">{t('contact.name')}</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                      <User className="h-4 w-4" />
                    </span>
                    <Input 
                      id="name" 
                      placeholder={isHi ? 'आपका पूरा नाम दर्ज करें' : 'Enter your full name'}
                      {...register('name')} 
                      className="pl-10 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl" 
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-black text-neutral-600 uppercase tracking-wider">{t('contact.email')}</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={isHi ? 'उदा. name@example.com' : 'e.g., name@example.com'}
                      {...register('email')} 
                      className="pl-10 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl" 
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs font-black text-neutral-600 uppercase tracking-wider">{t('contact.subject')}</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                      <Tag className="h-4 w-4" />
                    </span>
                    <Input 
                      id="subject" 
                      placeholder={isHi ? 'अनुरोध या प्रश्न का विषय' : 'Subject of request or inquiry'}
                      {...register('subject')} 
                      className="pl-10 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl" 
                    />
                  </div>
                  {errors.subject && <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">{errors.subject.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-black text-neutral-600 uppercase tracking-wider">{t('contact.message')}</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-neutral-400">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <Textarea 
                      id="message" 
                      placeholder={isHi ? 'आपका विस्तृत संदेश यहाँ लिखें...' : 'Type your detailed message here...'}
                      {...register('message')} 
                      rows={4} 
                      className="pl-10 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all rounded-xl resize-none" 
                    />
                  </div>
                  {errors.message && <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">{errors.message.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  loading={mutation.isPending}
                  loadingText={isHi ? 'संदेश भेजा जा रहा है...' : 'Sending Message...'}
                  className="w-full rounded-xl bg-blue-950 hover:bg-blue-900 py-3 text-sm font-black text-white transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  <Send className="h-4 w-4" />
                  {t('contact.send')}
                </Button>
                </fieldset>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
