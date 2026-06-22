import { PageHeader } from '@/components/shared/PageHeader'
import { IdCardGenerationPanel } from '@/features/id-card/IdCardGenerationPanel'

export default function AdminIdCardGenerationPage() {
  return (
    <div className="p-4 pb-24">
      <PageHeader
        title="Generate ID Cards"
        subtitle="Review driver information, generate printable cards with QR verification"
      />
      <IdCardGenerationPanel />
    </div>
  )
}
