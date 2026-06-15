import { FileDown } from 'lucide-react'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { PageHero } from '@/components/shared/PageHero'
import { Button } from '@/components/ui/button'

const SECTIONS = [
  {
    id: 'application',
    title: 'Application Guidelines',
    content: 'Complete all form fields accurately. Upload clear document scans in JPG/PNG format under 300KB. Ensure your driving license is valid for at least 6 months.',
    pdf: 'ADWA-Application-Guidelines.pdf',
  },
  {
    id: 'documents',
    title: 'Document Requirements',
    content: 'Required documents: passport photo, Aadhar copy (front & back), driving license copy (front & back), and signature. All documents must match the name on your application.',
    pdf: 'ADWA-Document-Checklist.pdf',
  },
  {
    id: 'payment',
    title: 'Payment Guidelines',
    content: 'Membership fee of ₹250 must be paid at your district office after application approval. Keep the payment receipt for tracking. Online payment options coming soon.',
    pdf: 'ADWA-Payment-Guidelines.pdf',
  },
  {
    id: 'renewal',
    title: 'Renewal Guidelines',
    content: 'Renew membership before expiry or within 90 days grace period. After 90 days, a fresh application is required. Renewal fee is ₹250 per year.',
    pdf: 'ADWA-Renewal-Guidelines.pdf',
  },
]

export default function GuidelinesPage() {
  return (
    <div className="bg-white">
      <PageHero title="Guidelines" subtitle="Official guidelines for ADWA membership and ID card" />
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {SECTIONS.map((s) => (
              <AccordionItem key={s.id} value={s.id} className="rounded-lg border border-neutral-200 px-4">
                <AccordionTrigger className="text-left font-semibold">{s.title}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-neutral-600">{s.content}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => window.open(`#${s.pdf}`, '_blank')}>
                    <FileDown className="h-4 w-4" /> Download {s.pdf}
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  )
}
