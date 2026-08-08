import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useResetUserPassword,
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
import { Copy, Eye, EyeOff, UserCog } from 'lucide-react'
import { districtMapEnToHi, translateFullName } from '@/utils/translations'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(3).optional().or(z.literal('')),
  districtId: z.string().min(1, 'District is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})

type FormData = z.infer<typeof schema>

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#'
  let out = 'Adwa@'
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function UserManagementPage() {
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: userRes, isLoading, isError, refetch } = useUsers({
    page,
    size: 10,
    search: search || undefined,
  })
  const { data: allUsersRes } = useUsers({ page: 1, size: 100 })
  const users = userRes?.items ?? []
  const allUsers = allUsersRes?.items ?? users
  const { data: districts } = useDistricts()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deactivateUser = useDeactivateUser()
  const resetPassword = useResetUserPassword()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(true)
  // Session-only: last passwords set in this page (API never returns plaintext).
  const [knownPasswords, setKnownPasswords] = useState<Record<string, string>>({})
  const saving =
    createUser.isPending || updateUser.isPending || deactivateUser.isPending || resetPassword.isPending

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE', districtId: '', password: '' },
  })

  const assignedDistrictIds = useMemo(() => {
    const ids = new Set<string>()
    for (const u of allUsers) {
      if (u.status === 'ACTIVE' && u.districtId) {
        if (editing && u.id === editing.id) continue
        ids.add(u.districtId)
      }
    }
    return ids
  }, [allUsers, editing])

  const availableDistricts = useMemo(() => {
    const list = districts ?? []
    if (editing?.districtId) {
      return list.filter((d) => d.id === editing.districtId || !assignedDistrictIds.has(d.id))
    }
    return list.filter((d) => !assignedDistrictIds.has(d.id))
  }, [districts, assignedDistrictIds, editing])

  const openCreate = () => {
    setEditing(null)
    setShowPassword(true)
    form.reset({
      status: 'ACTIVE',
      districtId: availableDistricts[0]?.id ?? '',
      password: generatePassword(),
      fullName: '',
      email: '',
      mobileNumber: '',
    })
    setDrawerOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setShowPassword(true)
    form.reset({
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      districtId: user.districtId ?? '',
      status: user.status,
      password: knownPasswords[user.id] ?? '',
    })
    setDrawerOpen(true)
  }

  const fillGeneratedPassword = () => {
    const pwd = generatePassword()
    form.setValue('password', pwd, { shouldDirty: true, shouldValidate: true })
    setShowPassword(true)
  }

  const copyPassword = async (pwd: string) => {
    try {
      await navigator.clipboard.writeText(pwd)
      toast.success(isHi ? 'पासवर्ड कॉपी हुआ' : 'Password copied')
    } catch {
      toast.error(isHi ? 'कॉपी नहीं हो सका' : 'Could not copy')
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (saving) return
    const nextPassword = values.password?.trim() ?? ''

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
      if (nextPassword) {
        if (nextPassword.length < 3) {
          form.setError('password', {
            message: isHi ? 'पासवर्ड कम से कम 3 अक्षर का होना चाहिए' : 'Password must be at least 3 characters',
          })
          return
        }
        await resetPassword.mutateAsync({ id: editing.id, password: nextPassword })
        setKnownPasswords((prev) => ({ ...prev, [editing.id]: nextPassword }))
        form.setValue('password', nextPassword)
        setShowPassword(true)
        // Keep drawer open so the new password stays visible to copy.
        return
      }
      setDrawerOpen(false)
      return
    }

    if (!nextPassword) {
      form.setError('password', { message: isHi ? 'पासवर्ड आवश्यक है' : 'Password is required' })
      return
    }
    const created = await createUser.mutateAsync({
      fullName: values.fullName,
      email: values.email,
      mobileNumber: values.mobileNumber,
      password: nextPassword,
      role: 'DISTRICT_INCHARGE',
      districtId: values.districtId,
    })
    if (created?.id) {
      setKnownPasswords((prev) => ({ ...prev, [created.id]: nextPassword }))
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

  const passwordValue = form.watch('password') ?? ''

  return (
    <div className="w-full space-y-6 pb-6 animate-fade-in">
      <PageHeader
        title={isHi ? 'उपयोगकर्ता प्रबंधन' : 'User Management'}
        subtitle={isHi ? 'जिला प्रभारी खातों का प्रबंधन करें (एक जिला = एक ईमेल)' : 'Manage district incharge accounts (one email per district)'}
        action={
          <Button onClick={openCreate} className="cursor-pointer" disabled={availableDistricts.length === 0 && !editing}>
            <UserCog className="h-4 w-4" /> {isHi ? 'जिला प्रभारी जोड़ें' : 'Add District Incharge'}
          </Button>
        }
      />

      {isError && <ErrorState onRetry={() => refetch()} />}
      {isLoading && !userRes ? (
        <SkeletonTable />
      ) : !isError ? (
        <DataTable
          data={users}
          columns={columns}
          getRowKey={(u) => u.id}
          searchable
          searchPlaceholder={isHi ? 'नाम, ईमेल, मोबाइल या जिला खोजें…' : 'Search name, email, mobile, or district…'}
          onRowClick={openEdit}
          pagination={{
            page,
            pageSize: 10,
            totalItems: userRes?.total ?? 0,
            totalPages: userRes?.pages ?? 1,
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => { setSearch(v); setPage(1) },
          }}
        />
      ) : null}
      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loading={saving}
        title={editing ? (isHi ? 'जिला प्रभारी संपादित करें' : 'Edit District Incharge') : (isHi ? 'जिला प्रभारी जोड़ें' : 'Add District Incharge')}
        footer={
          <div className="flex gap-2 w-full">
            {editing && editing.status === 'ACTIVE' && (
              <Button
                variant="destructive"
                className="flex-1 cursor-pointer"
                loading={deactivateUser.isPending}
                loadingText={isHi ? 'हटाया जा रहा है…' : 'Removing…'}
                disabled={saving}
                onClick={() => deactivateUser.mutate(editing.id, { onSuccess: () => setDrawerOpen(false) })}
              >
                {isHi ? 'हटाएँ' : 'Remove'}
              </Button>
            )}
            <Button
              onClick={onSubmit}
              className="flex-1 cursor-pointer"
              loading={createUser.isPending || updateUser.isPending || resetPassword.isPending}
              loadingText={isHi ? 'सहेजा जा रहा है…' : 'Saving…'}
              disabled={saving}
            >
              {editing ? (isHi ? 'अपडेट करें' : 'Update') : (isHi ? 'बनाएं' : 'Create')}
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <fieldset disabled={saving} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">{isHi ? 'पासवर्ड' : 'Password'}</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                  onClick={fillGeneratedPassword}
                  disabled={saving}
                >
                  {isHi ? 'नया जनरेट करें' : 'Generate new'}
                </button>
              </div>
              <div className="mt-1 flex gap-2">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={
                    editing
                      ? (isHi ? 'नया पासवर्ड (खाली = पुराना रखें)' : 'New password (blank = keep current)')
                      : undefined
                  }
                  {...form.register('password')}
                  className="flex-1 font-mono tracking-wide"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => void copyPassword(passwordValue)}
                  disabled={!passwordValue}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {editing && knownPasswords[editing.id] && passwordValue === knownPasswords[editing.id] && (
                <p className="mt-1 text-xs text-emerald-700">
                  {isHi
                    ? 'यह पासवर्ड अभी सेट है — कॉपी करके सुरक्षित रखें।'
                    : 'This password is set — copy and save it now.'}
                </p>
              )}
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="districtId">{isHi ? 'जिला' : 'District'}</Label>
              <select
                id="districtId"
                {...form.register('districtId')}
                className={cn(formControlClassName, formControlHeightClassName, 'mt-1 w-full')}
              >
                <option value="">{isHi ? 'जिला चुनें' : 'Select district'}</option>
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isHi ? (districtMapEnToHi[d.name] || d.name) : d.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-neutral-500">
                {isHi
                  ? 'जिन जिलों का सक्रिय खाता है वे सूची में नहीं दिखते।'
                  : 'Districts that already have an active account are hidden.'}
              </p>
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
          </fieldset>
        </form>
      </AppDrawer>
    </div>
  )
}
