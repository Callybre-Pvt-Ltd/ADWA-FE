import { PageHeader } from '@/components/shared/PageHeader'
import ProfileForm from '@/features/profile/ProfileForm'

export default function AdminProfilePage() {
  return (
    <div className="p-6">
      <PageHeader title="Admin Profile" subtitle="Manage your administrator account" />
      <ProfileForm defaultValues={{ name: 'System Admin', email: 'admin@adwa.org', mobile: '9999999999', designation: 'National Administrator' }} />
    </div>
  )
}
