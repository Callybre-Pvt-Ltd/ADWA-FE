import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader'
import ProfileForm from '@/features/profile/ProfileForm'

export default function AdminProfilePage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'एडमिन प्रोफाइल' : 'Admin Profile'}
        subtitle={isHi ? 'अपने प्रशासक खाते को प्रबंधित करें' : 'Manage your administrator account'}
      />
      <ProfileForm defaultValues={{ name: 'System Admin', email: 'admin@adwa.org', mobile: '9999999999', designation: 'National Administrator' }} />
    </div>
  )
}
