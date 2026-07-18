import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader'
import { IdCardGenerationPanel } from '@/features/id-card/IdCardGenerationPanel'

export default function AdminIdCardGenerationPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'आईडी कार्ड जनरेट करें' : 'Generate ID Cards'}
        subtitle={isHi ? 'ड्राइवर जानकारी की समीक्षा करें, क्यूआर सत्यापन के साथ प्रिंट करने योग्य कार्ड बनाएं' : 'Review driver information, generate printable cards with QR verification'}
      />
      <IdCardGenerationPanel />
    </div>
  )
}
