import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDistricts, useCreateDistrict, useUpdateDistrict } from '@/hooks/useDistricts'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { StatusBadge, statusToVariant } from '@/components/shared/StatusBadge'
import { AppDrawer } from '@/components/shared/AppDrawer'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { INDIAN_STATES } from '@/constants'
import type { District } from '@/types/district.types'
import { formControlClassName, formControlHeightClassName } from '@/utils/formStyles'
import { cn } from '@/utils/cn'
import { MapPin } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2),
  state: z.string().min(2),
  inchargeName: z.string().min(2),
  inchargeEmail: z.string().email(),
  inchargeMobile: z.string().regex(/^[6-9]\d{9}$/),
  thanas: z.string().min(1),
  status: z.enum(['active', 'inactive']),
})

type FormData = z.infer<typeof schema>

export default function DistrictManagementPage() {
  const { data, isLoading, isError, refetch } = useDistricts()
  const createDistrict = useCreateDistrict()
  const updateDistrict = useUpdateDistrict()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<District | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', thanas: '' },
  })

  const openCreate = () => { setEditing(null); form.reset({ status: 'active', thanas: '' }); setDrawerOpen(true) }
  const openEdit = (d: District) => {
    setEditing(d)
    form.reset({ name: d.name, state: d.state, inchargeName: d.inchargeName, inchargeEmail: d.inchargeEmail, inchargeMobile: d.inchargeMobile, thanas: d.thanas.join(', '), status: d.status })
    setDrawerOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, thanas: values.thanas.split(',').map((t) => t.trim()) }
    if (editing) {
      await updateDistrict.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createDistrict.mutateAsync(payload)
    }
    setDrawerOpen(false)
  })

  const columns: ColumnDef<District>[] = [
    { key: 'name', header: 'District', cell: (d) => d.name, sortable: true, sortValue: (d) => d.name },
    { key: 'state', header: 'State', cell: (d) => d.state },
    { key: 'incharge', header: 'Incharge', cell: (d) => d.inchargeName },
    { key: 'drivers', header: 'Drivers', cell: (d) => d.driverCount },
    { key: 'status', header: 'Status', cell: (d) => <StatusBadge variant={statusToVariant(d.status)} label={d.status} /> },
  ]

  return (
    <div className="p-6">
      <PageHeader title="District Management" action={<Button onClick={openCreate}><MapPin className="h-4 w-4" /> Add District</Button>} />
      {isLoading && <SkeletonTable />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (
        <DataTable data={data ?? []} columns={columns} getRowKey={(d) => d.id} searchable onRowClick={openEdit} />
      )}
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? 'Edit District' : 'Add District'} footer={<Button onClick={onSubmit} className="w-full">{editing ? 'Update' : 'Create'}</Button>}>
        <form className="space-y-4">
          {(['name', 'state', 'inchargeName', 'inchargeEmail', 'inchargeMobile'] as const).map((f) => (
            <div key={f}>
              <Label htmlFor={f} className="capitalize">{f.replace(/([A-Z])/g, ' $1')}</Label>
              {f === 'state' ? (
                <select id={f} {...form.register(f)} className={cn(formControlClassName, formControlHeightClassName, 'mt-1')}>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <Input id={f} {...form.register(f)} className="mt-1" />
              )}
            </div>
          ))}
          <div>
            <Label htmlFor="thanas">Thanas (comma-separated)</Label>
            <Input id="thanas" {...form.register('thanas')} className="mt-1" />
          </div>
        </form>
      </AppDrawer>
    </div>
  )
}
