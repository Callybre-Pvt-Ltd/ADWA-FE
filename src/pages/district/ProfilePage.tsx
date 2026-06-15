import { PageHeader } from '@/components/shared/PageHeader'
import ProfileForm from '@/features/profile/ProfileForm'

export default function ProfilePage() {
  return (
    <div className="p-6">
      <PageHeader title="Profile" subtitle="Manage your district account settings" />
      <ProfileForm />
    </div>
  )
}
