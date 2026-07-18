import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader'
import ProfileForm from '@/features/profile/ProfileForm'

export default function ProfilePage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'जिला प्रोफाइल' : 'District Profile'}
        subtitle={isHi ? 'अपने जिला खाते की सेटिंग्स प्रबंधित करें' : 'Manage your district account settings'}
      />
      <ProfileForm />
    </div>
  )
}
