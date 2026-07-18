import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
} from '@/hooks/useUsers'
import { useDistricts } from '@/hooks/useDistricts'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User } from '@/types/user.types'
import { formControlClassName, formControlHeightClassName } from '@/utils/formStyles'
import { cn } from '@/utils/cn'
import { UserCog } from 'lucide-react'
import { districtMapEnToHi, translateFullName } from '@/utils/translations'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8).optional(),
  districtId: z.string().min(1, 'District is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

type FormData = z.infer<typeof schema>

export default function UserManagementPage() {
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const { data, isLoading, isError, refetch } = useUsers()
  const { data: districts } = useDistricts()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE', districtId: '' },
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ status: 'ACTIVE', districtId: districts?.[0]?.id ?? '' })
    setDrawerOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    form.reset({
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      districtId: user.districtId ?? '',
      status: user.status,
    })
    setDrawerOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await updateUser.mutateAsync({
        id: editing.id,
        data: {
          fullName: values.fullName,
          email: values.email,
          mobileNumber: values.mobileNumber,
          districtId: values.districtId,
          status: values.status,
          role: 'DISTRICT_INCHARGE',
        },
      })
    } else {
      if (!values.password) {
        form.setError('password', { message: isHi ? 'पासवर्ड आवश्यक है' : 'Password is required' })
        return
      }
      await createUser.mutateAsync({
        fullName: values.fullName,
        email: values.email,
        mobileNumber: values.mobileNumber,
        password: values.password,
        role: 'DISTRICT_INCHARGE',
        districtId: values.districtId,
      })
    }
    setDrawerOpen(false)
  })

  const translateStatus = (status: string) => {
    if (!isHi) return status
    return status === 'ACTIVE' ? 'सक्रिय' : 'अक्रिय'
  }

  const columns: ColumnDef<User>[] = [
    { key: 'name', header: isHi ? 'नाम' : 'Name', cell: (u) => translateFullName(u.fullName, isHi), sortable: true, sortValue: (u) => u.fullName },
    { key: 'email', header: isHi ? 'ईमेल' : 'Email', cell: (u) => u.email },
    { key: 'mobile', header: isHi ? 'मोबाइल' : 'Mobile', cell: (u) => u.mobileNumber },
    {
      key: 'district',
      header: isHi ? 'जिला' : 'District',
      cell: (u) => {
        const dName = districts?.find((d) => d.id === u.districtId)?.name ?? '—'
        return isHi ? (districtMapEnToHi[dName] || dName) : dName
      },
    },
    {
      key: 'status',
      header: isHi ? 'स्थिति' : 'Status',
      cell: (u) => (
        <StatusBadge variant={statusToVariant(u.status)} label={translateStatus(u.status)} />
      ),
    },
  ]

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'उपयोगकर्ता प्रबंधन' : 'User Management'}
        subtitle={isHi ? 'जिला प्रभारी खातों का प्रबंधन करें' : 'Manage district incharge accounts'}
        action={
          <Button onClick={openCreate} className="cursor-pointer">
            <UserCog className="h-4 w-4" /> {isHi ? 'जिला प्रभारी जोड़ें' : 'Add District Incharge'}
          </Button>
        }
      />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable
          data={data ?? []}
          columns={columns}
          getRowKey={(u) => u.id}
          searchable
          onRowClick={openEdit}
        />
      )}
      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? (isHi ? 'जिला प्रभारी संपादित करें' : 'Edit District Incharge') : (isHi ? 'जिला प्रभारी जोड़ें' : 'Add District Incharge')}
        footer={
          <div className="flex gap-2">
            {editing && editing.status === 'ACTIVE' && (
              <Button
                variant="destructive"
                className="flex-1 cursor-pointer"
                onClick={() => {
                  void deactivateUser.mutateAsync(editing.id).then(() => setDrawerOpen(false))
                }}
              >
                {isHi ? 'निष्क्रिय करें' : 'Deactivate'}
              </Button>
            )}
            <Button onClick={onSubmit} className="flex-1 cursor-pointer">
              {editing ? (isHi ? 'अपडेट करें' : 'Update') : (isHi ? 'बनाएं' : 'Create')}
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <div>
            <Label htmlFor="fullName">{isHi ? 'पूरा नाम' : 'Full Name'}</Label>
            <Input id="fullName" {...form.register('fullName')} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">{isHi ? 'ईमेल' : 'Email'}</Label>
            <Input id="email" type="email" {...form.register('email')} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="mobileNumber">{isHi ? 'मोबाइल' : 'Mobile'}</Label>
            <Input id="mobileNumber" {...form.register('mobileNumber')} className="mt-1" />
          </div>
          {!editing && (
            <div>
              <Label htmlFor="password">{isHi ? 'पासवर्ड' : 'Password'}</Label>
              <Input id="password" type="password" {...form.register('password')} className="mt-1" />
            </div>
          )}
          <div>
            <Label htmlFor="districtId">{isHi ? 'जिला' : 'District'}</Label>
            <select
              id="districtId"
              {...form.register('districtId')}
              className={cn(formControlClassName, formControlHeightClassName, 'mt-1 w-full')}
            >
              <option value="">{isHi ? 'जिला चुनें' : 'Select district'}</option>
              {(districts ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {isHi ? (districtMapEnToHi[d.name] || d.name) : d.name}
                </option>
              ))}
            </select>
          </div>
          {editing && (
            <div>
              <Label htmlFor="status">{isHi ? 'स्थिति' : 'Status'}</Label>
              <select
                id="status"
                {...form.register('status')}
                className={cn(formControlClassName, formControlHeightClassName, 'mt-1 w-full')}
              >
                <option value="ACTIVE">{isHi ? 'सक्रिय' : 'Active'}</option>
                <option value="INACTIVE">{isHi ? 'अक्रिय' : 'Inactive'}</option>
              </select>
            </div>
          )}
        </form>
      </AppDrawer>
    </div>
  )
}
