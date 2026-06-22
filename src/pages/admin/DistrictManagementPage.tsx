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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { District } from '@/types/district.types'
import { MapPin } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(50),
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
    defaultValues: { status: 'active', code: '' },
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ status: 'active', code: '' })
    setDrawerOpen(true)
  }

  const openEdit = (d: District) => {
    setEditing(d)
    form.reset({ name: d.name, code: d.code, status: d.status })
    setDrawerOpen(true)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (editing) {
      await updateDistrict.mutateAsync({ id: editing.id, data: values })
    } else {
      await createDistrict.mutateAsync(values)
    }
    setDrawerOpen(false)
  })

  const columns: ColumnDef<District>[] = [
    { key: 'name', header: 'District', cell: (d) => d.name, sortable: true, sortValue: (d) => d.name },
    { key: 'code', header: 'Code', cell: (d) => d.code },
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
      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit District' : 'Add District'}
        footer={
          <Button onClick={onSubmit} className="w-full" disabled={createDistrict.isPending || updateDistrict.isPending}>
            {editing ? 'Update' : 'Create'}
          </Button>
        }
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} className="mt-1" />
            {form.formState.errors.name && <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" {...form.register('code')} className="mt-1" placeholder="e.g. bhopal" />
            {form.formState.errors.code && <p className="text-sm text-red-600 mt-1">{form.formState.errors.code.message}</p>}
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={v => form.setValue('status', v as 'active' | 'inactive')}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </AppDrawer>
    </div>
  )
}
