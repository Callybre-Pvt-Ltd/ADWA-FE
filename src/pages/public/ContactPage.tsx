import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle, Phone, Mail, MapPin } from 'lucide-react'
import { contactFormSchema, type ContactFormData } from '@/utils/validators'
import { contactService } from '@/services/mock/team.service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CONTACT_INFO } from '@/constants'
import { PageHero } from '@/components/shared/PageHero'

export default function ContactPage() {
  const { t } = useTranslation('pages')
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  })
  const mutation = useMutation({ mutationFn: contactService.submit, onSuccess: () => { setSubmitted(true); reset() } })

  return (
    <div className="bg-white">
      <PageHero title={t('contact.title')} subtitle={t('contact.subtitle')} />
      <section className="section-padding">
        <div className="container-wide max-w-5xl grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">{t('contact.infoTitle')}</h2>
            {[
              { icon: Phone, label: t('contact.mainHelpline'), value: CONTACT_INFO.phone },
              { icon: Mail, label: t('contact.emailSupport'), value: CONTACT_INFO.email },
              { icon: MapPin, label: t('contact.officeAddress'), value: CONTACT_INFO.address },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3 rounded-lg border border-neutral-200 p-4">
                <Icon className="h-5 w-5 text-navy-700" />
                <div>
                  <p className="text-xs text-neutral-500">{label}</p>
                  <p className="text-sm font-medium text-neutral-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-3 rounded-xl border border-neutral-200 p-6">
            <h2 className="text-xl font-bold text-neutral-900">{t('contact.formTitle')}</h2>
            {submitted ? (
              <div className="py-12 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-emerald-600" />
                <h3 className="mt-4 text-lg font-bold">{t('contact.successTitle')}</h3>
                <p className="mt-2 text-sm text-neutral-500">{t('contact.successMsg')}</p>
                <Button variant="ghost" className="mt-4" onClick={() => setSubmitted(false)}>{t('contact.sendAnother')}</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="name">{t('contact.name')}</Label>
                  <Input id="name" {...register('name')} className="mt-1" />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">{t('contact.email')}</Label>
                  <Input id="email" type="email" {...register('email')} className="mt-1" />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="subject">{t('contact.subject')}</Label>
                  <Input id="subject" {...register('subject')} className="mt-1" />
                  {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
                </div>
                <div>
                  <Label htmlFor="message">{t('contact.message')}</Label>
                  <Textarea id="message" {...register('message')} rows={5} className="mt-1" />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                </div>
                <Button type="submit" disabled={mutation.isPending} className="w-full">
                  {mutation.isPending ? 'Sending...' : t('contact.send')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
