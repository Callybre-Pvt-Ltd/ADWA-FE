import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader'
import { IdCardGenerationPanel } from '@/features/id-card/IdCardGenerationPanel'

export default function IDGenerationPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'आईडी कार्ड जनरेट करें' : 'Generate ID Cards'}
        subtitle={isHi ? 'ड्राइवर जानकारी दर्ज करें, कार्ड का पूर्वावलोकन करें, फिर क्यूआर कोड के साथ पीडीएफ उत्पन्न करें' : 'Fill driver details, preview the card, then generate PDF with QR code'}
      />
      <IdCardGenerationPanel />
    </div>
  )
}
