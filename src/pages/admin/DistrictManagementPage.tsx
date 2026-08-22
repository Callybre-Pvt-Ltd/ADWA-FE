/* eslint-disable react-hooks/incompatible-library */
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
import { Copy, Eye, EyeOff, MapPinned, UserCog } from 'lucide-react'
import { districtMapEnToHi, stateMapEnToHi, translateFullName } from '@/utils/translations'
import { INDIA_STATE_NAMES } from '@/data/indiaGeo'
import { DistrictSearchSelect } from '@/components/shared/DistrictSearchSelect'

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(3).optional().or(z.literal('')),
  state: z.string().min(1, 'State is required'),
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

export default function DistrictManagementPage() {
  "use no memo";
  const { i18n } = useTranslation('dashboard')
  const isHi = i18n.language === 'hi'
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState('')

  const { data: userRes, isLoading, isError, refetch } = useUsers({
    page,
    size: 15,
    search: search || undefined,
  })
  const { data: allUsersRes } = useUsers({ page: 1, size: 500 })
  const users = userRes?.items ?? []
  const allUsers = allUsersRes?.items ?? users
  const { data: districts } = useDistricts()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const resetPassword = useResetUserPassword()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(true)
  const [knownPasswords, setKnownPasswords] = useState<Record<string, string>>({})
  const saving = createUser.isPending || updateUser.isPending || resetPassword.isPending

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE', state: '', districtId: '', password: '' },
  })

  const formState = form.watch('state')

  const districtById = useMemo(() => {
    const map = new Map<string, NonNullable<typeof districts>[number]>()
    for (const d of districts ?? []) map.set(d.id, d)
    return map
  }, [districts])

  const statesWithDistricts = useMemo(() => {
    const present = new Set((districts ?? []).map((d) => d.state).filter(Boolean))
    return INDIA_STATE_NAMES.filter((s) => present.has(s))
  }, [districts])

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

  const availableDistrictsForForm = useMemo(() => {
    const list = (districts ?? []).filter(
      (d) => d.status === 'active' && (!formState || d.state === formState),
    )
    if (editing?.districtId) {
      return list.filter((d) => d.id === editing.districtId || !assignedDistrictIds.has(d.id))
    }
    return list.filter((d) => !assignedDistrictIds.has(d.id))
  }, [districts, assignedDistrictIds, editing, formState])

  const filteredUsers = useMemo(() => {
    if (!filterState) return users
    return users.filter((u) => {
      const d = u.districtId ? districtById.get(u.districtId) : undefined
      return d?.state === filterState
    })
  }, [users, filterState, districtById])

  const stats = useMemo(() => {
    const activeDistricts = (districts ?? []).filter((d) => d.status === 'active')
    const states = new Set(activeDistricts.map((d) => d.state))
    const withIncharge = new Set(
      allUsers.filter((u) => u.status === 'ACTIVE' && u.districtId).map((u) => u.districtId),
    )
    return {
      states: states.size,
      districts: activeDistricts.length,
      incharges: allUsers.filter((u) => u.status === 'ACTIVE').length,
      uncovered: activeDistricts.filter((d) => !withIncharge.has(d.id)).length,
    }
  }, [districts, allUsers])

  const openCreate = () => {
    setEditing(null)
    setShowPassword(true)
    const defaultState = filterState || statesWithDistricts[0] || ''
    form.reset({
      status: 'ACTIVE',
      state: defaultState,
      districtId: '',
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
    const d = user.districtId ? districtById.get(user.districtId) : undefined
    form.reset({
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      state: d?.state ?? '',
      districtId: user.districtId ?? '',
      status: user.status,
      password: knownPasswords[user.id] ?? '',
    })
    setDrawerOpen(true)
  }

  const handleFormStateChange = (nextState: string) => {
    form.setValue('state', nextState, { shouldValidate: true })
    form.setValue('districtId', '', { shouldValidate: true })
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

  const labelState = (name: string) => (isHi ? stateMapEnToHi[name] || name : name)
  const labelDistrict = (name: string) => (isHi ? districtMapEnToHi[name] || name : name)

  const columns: ColumnDef<User>[] = [
    {
      key: 'state',
      header: isHi ? 'राज्य' : 'State',
      cell: (u) => {
        const d = u.districtId ? districtById.get(u.districtId) : undefined
        return d?.state ? labelState(d.state) : '—'
      },
      sortable: true,
      sortValue: (u) => districtById.get(u.districtId ?? '')?.state ?? '',
    },
    {
      key: 'district',
      header: isHi ? 'जिला' : 'District',
      cell: (u) => {
        const d = u.districtId ? districtById.get(u.districtId) : undefined
        if (!d) return '—'
        return (
          <span className="inline-flex flex-col">
            <span>{labelDistrict(d.name)}</span>
            <span className="font-mono text-[11px] text-neutral-500">{d.code}</span>
          </span>
        )
      },
      sortable: true,
      sortValue: (u) => districtById.get(u.districtId ?? '')?.name ?? '',
    },
    {
      key: 'name',
      header: isHi ? 'प्रभारी नाम' : 'Incharge name',
      cell: (u) => translateFullName(u.fullName, isHi),
      sortable: true,
      sortValue: (u) => u.fullName,
    },
    { key: 'email', header: isHi ? 'ईमेल' : 'Email', cell: (u) => u.email },
    { key: 'mobile', header: isHi ? 'मोबाइल' : 'Mobile', cell: (u) => u.mobileNumber },
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
        title={isHi ? 'जिला प्रभारी' : 'District Incharges'}
        subtitle={
          isHi
            ? 'सभी राज्यों / केंद्रशासित प्रदेशों के जिला प्रभारी प्रबंधित करें'
            : 'Manage district incharges across all states and union territories'
        }
        action={
          <Button
            onClick={openCreate}
            className="cursor-pointer"
          >
            <UserCog className="h-4 w-4" />
            {isHi ? 'जिला प्रभारी जोड़ें' : 'Add District Incharge'}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: isHi ? 'राज्य / UT' : 'States / UTs', value: stats.states },
          { label: isHi ? 'सक्रिय जिले' : 'Active districts', value: stats.districts },
          { label: isHi ? 'सक्रिय प्रभारी' : 'Active incharges', value: stats.incharges },
          { label: isHi ? 'बिना प्रभारी' : 'Unassigned', value: stats.uncovered },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-neutral-900 tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-72">
          <Label htmlFor="filterState" className="text-xs text-neutral-500">
            {isHi ? 'राज्य से फ़िल्टर' : 'Filter by state'}
          </Label>
          <select
            id="filterState"
            value={filterState}
            onChange={(e) => {
              setFilterState(e.target.value)
              setPage(1)
            }}
            className={cn(formControlClassName, formControlHeightClassName, 'mt-1 w-full')}
          >
            <option value="">{isHi ? 'सभी राज्य' : 'All states'}</option>
            {statesWithDistricts.map((s) => (
              <option key={s} value={s}>
                {labelState(s)}
              </option>
            ))}
          </select>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-neutral-500 sm:pb-2">
          <MapPinned className="h-3.5 w-3.5" />
          {isHi
            ? 'जिला सूची सीड से आती है — यहाँ केवल प्रभारी असाइन करें।'
            : 'Districts come from the geo seed — assign incharges here.'}
        </p>
      </div>

      {isError && <ErrorState onRetry={() => refetch()} />}
      {isLoading && !userRes ? (
        <SkeletonTable />
      ) : !isError ? (
        <DataTable
          data={filteredUsers}
          columns={columns}
          getRowKey={(u) => u.id}
          searchable
          searchPlaceholder={
            isHi
              ? 'राज्य, जिला, नाम, ईमेल या मोबाइल खोजें…'
              : 'Search state, district, name, email, or mobile…'
          }
          onRowClick={openEdit}
          pagination={{
            page,
            pageSize: 15,
            totalItems: filterState ? filteredUsers.length : (userRes?.total ?? 0),
            totalPages: filterState
              ? Math.max(1, Math.ceil(filteredUsers.length / 15))
              : (userRes?.pages ?? 1),
            onPageChange: setPage,
            searchValue: search,
            onSearchChange: (v) => {
              setSearch(v)
              setPage(1)
            },
          }}
        />
      ) : null}

      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        loading={saving}
        title={
          editing
            ? (isHi ? 'जिला प्रभारी संपादित करें' : 'Edit District Incharge')
            : (isHi ? 'जिला प्रभारी जोड़ें' : 'Add District Incharge')
        }
        footer={
          <Button
            onClick={onSubmit}
            className="w-full cursor-pointer"
            loading={createUser.isPending || updateUser.isPending || resetPassword.isPending}
            loadingText={isHi ? 'सहेजा जा रहा है…' : 'Saving…'}
            disabled={saving}
          >
            {editing ? (isHi ? 'अपडेट करें' : 'Update') : (isHi ? 'बनाएं' : 'Create')}
          </Button>
        }
      >
        <form className="space-y-4">
          <fieldset disabled={saving} className="space-y-4">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <Label>{isHi ? 'राज्य' : 'State'}</Label>
                  <Input
                    className="mt-1 bg-neutral-50"
                    readOnly
                    value={labelState(formState || '—')}
                  />
                </div>
                <div>
                  <Label htmlFor="districtId">{isHi ? 'जिला' : 'District'}</Label>
                  <Input
                    id="districtId"
                    className="mt-1 bg-neutral-50"
                    readOnly
                    value={(() => {
                      const d = districtById.get(editing.districtId ?? '')
                      if (!d) return '—'
                      return `${labelDistrict(d.name)} (${d.code})`
                    })()}
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="formState">{isHi ? 'राज्य / UT' : 'State / UT'}</Label>
                  <select
                    id="formState"
                    value={formState}
                    onChange={(e) => handleFormStateChange(e.target.value)}
                    className={cn(formControlClassName, formControlHeightClassName, 'mt-1 w-full')}
                  >
                    <option value="">{isHi ? 'राज्य चुनें' : 'Select state'}</option>
                    {statesWithDistricts.map((s) => (
                      <option key={s} value={s}>
                        {labelState(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>{isHi ? 'जिला' : 'District'}</Label>
                  <div className="mt-1">
                    <DistrictSearchSelect
                      districts={availableDistrictsForForm}
                      value={form.watch('districtId')}
                      onChange={(id) =>
                        form.setValue('districtId', id, { shouldValidate: true })
                      }
                      disabled={!formState}
                      placeholder={
                        formState
                          ? (isHi ? 'जिला चुनें' : 'Select district')
                          : (isHi ? 'पहले राज्य चुनें' : 'Select state first')
                      }
                      searchPlaceholder={isHi ? 'जिला खोजें…' : 'Search district…'}
                      emptyText={
                        isHi
                          ? 'इस राज्य में उपलब्ध जिला नहीं'
                          : 'No free districts in this state'
                      }
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {isHi
                      ? 'केवल वे जिले जिनका सक्रिय प्रभारी नहीं है। राज्य बदलने पर जिला साफ़ हो जाता है।'
                      : 'Only districts without an active incharge. Changing state clears the district.'}
                  </p>
                  {form.formState.errors.districtId && (
                    <p className="mt-1 text-xs text-red-600">
                      {form.formState.errors.districtId.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="fullName">{isHi ? 'पूरा नाम' : 'Full Name'}</Label>
              <Input id="fullName" {...form.register('fullName')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">{isHi ? 'ईमेल (लॉगिन)' : 'Email (login)'}</Label>
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
