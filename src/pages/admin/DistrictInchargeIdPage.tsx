import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader'
import { DistrictInchargeIdPanel } from '@/features/district-id-card/DistrictInchargeIdPanel'

export default function DistrictInchargeIdPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'जिला प्रभारी आईडी कार्ड' : 'District Incharge ID Cards'}
        subtitle={
          isHi
            ? 'जिला प्रभारी का नाम, फ़ोटो और विवरण भरकर कार्ड बनाएँ / प्रिंट करें'
            : 'Fill district incharge name, photo and details to generate and print the card'
        }
      />
      <DistrictInchargeIdPanel />
    </div>
  )
}
