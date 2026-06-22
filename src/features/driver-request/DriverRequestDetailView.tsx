import type { ReactNode } from 'react'
import { formatDate, formatDateTime } from '@/utils/formatters'
import type { ApplicationDocument, DriverRequest } from '@/types/driver.types'
import { cn } from '@/utils/cn'

type DetailRow = { label: string; value?: string | number | null }

function formatEnum(value?: string | null): string | undefined {
  if (!value) return undefined
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 overflow-hidden">
      <h3 className="bg-neutral-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
        {title}
      </h3>
      <dl className="divide-y divide-neutral-100">{children}</dl>
    </section>
  )
}

function DetailRowItem({ label, value }: DetailRow) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="grid grid-cols-[minmax(0,38%)_1fr] gap-3 px-4 py-2.5 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-900 break-words">{value}</dd>
    </div>
  )
}

function DocumentCard({ doc }: { doc: ApplicationDocument }) {
  const url = doc.downloadUrl
  const isImage = doc.mimeType?.startsWith('image/')

  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block rounded-lg border border-neutral-200 overflow-hidden bg-white hover:border-blue-300 transition-colors',
        !url && 'pointer-events-none opacity-60',
      )}
    >
      {isImage && url ? (
        <img
          src={url}
          alt={doc.fileName}
          className="w-full aspect-[4/3] object-cover bg-neutral-100"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-50 text-xs text-neutral-500 p-3 text-center">
          {doc.fileName}
        </div>
      )}
      <div className="px-2.5 py-2 border-t border-neutral-100">
        <p className="text-xs font-medium text-neutral-800 truncate">{formatEnum(doc.documentType)}</p>
        <p className="text-[10px] text-neutral-400 truncate">{doc.fileName}</p>
      </div>
    </a>
  )
}

function buildPersonalRows(r: DriverRequest): DetailRow[] {
  return [
    { label: 'Full name', value: r.fullName ?? r.name },
    { label: 'Father name', value: r.fatherName },
    { label: 'Mother name', value: r.motherName },
    { label: 'Gender', value: formatEnum(r.gender) },
    { label: 'Date of birth', value: r.dateOfBirth ? formatDate(r.dateOfBirth) : undefined },
    { label: 'Mobile', value: r.mobile },
    { label: 'Alternate mobile', value: r.altMobile },
    { label: 'Email', value: r.email },
    { label: 'Blood group', value: r.bloodGroup },
  ]
}

function buildAddressRows(r: DriverRequest): DetailRow[] {
  return [
    { label: 'District', value: r.district },
    { label: 'Village / town', value: r.village },
    { label: 'Tehsil / PS', value: r.tehsil },
    { label: 'State', value: r.state },
    { label: 'Pincode', value: r.pincode },
    { label: 'Full address', value: r.address },
  ]
}

function buildProfessionalRows(r: DriverRequest): DetailRow[] {
  return [
    { label: 'License number', value: r.licenseNumber },
    {
      label: 'License issue date',
      value: r.licenseIssueDate ? formatDate(r.licenseIssueDate) : undefined,
    },
    {
      label: 'License expiry date',
      value: r.licenseExpiryDate ? formatDate(r.licenseExpiryDate) : undefined,
    },
    { label: 'Vehicle type', value: r.vehicleType ?? r.licenseType },
    { label: 'Vehicle number', value: r.vehicleNumber },
    {
      label: 'Experience (years)',
      value: r.experienceYears !== undefined ? r.experienceYears : undefined,
    },
  ]
}

function buildWorkflowRows(r: DriverRequest): DetailRow[] {
  return [
    { label: 'Reference number', value: r.referenceNumber },
    { label: 'Status', value: formatEnum(r.status) },
    { label: 'Submitted', value: r.createdAt ? formatDateTime(r.createdAt) : undefined },
    { label: 'Forwarded', value: r.forwardedAt ? formatDateTime(r.forwardedAt) : undefined },
    { label: 'Approved', value: r.approvedAt ? formatDateTime(r.approvedAt) : undefined },
    { label: 'Rejected', value: r.rejectedAt ? formatDateTime(r.rejectedAt) : undefined },
    { label: 'Verification remarks', value: r.verificationRemarks },
    { label: 'DI notes', value: r.diNotes },
    { label: 'Remarks', value: r.remarks },
  ]
}

type DriverRequestDetailViewProps = {
  request: DriverRequest
  className?: string
}

function formatConflictMessage(request: DriverRequest): string | null {
  if (!request.registrationConflict) return null
  if (request.conflictMemberNumber) {
    return `${request.registrationConflict} (${request.conflictMemberNumber}).`
  }
  if (request.conflictReferenceNumber) {
    return `${request.registrationConflict} (application ${request.conflictReferenceNumber}).`
  }
  return `${request.registrationConflict}.`
}

export function DriverRequestDetailView({ request, className }: DriverRequestDetailViewProps) {
  const documents = request.documents ?? []
  const paymentProof = request.paymentProofUrl
  const conflictMessage = formatConflictMessage(request)

  return (
    <div className={cn('space-y-4', className)}>
      {conflictMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Cannot approve this application</p>
          <p className="mt-1">{conflictMessage}</p>
          <p className="mt-2 text-xs text-red-700">
            Reject this duplicate application. The driver must apply again with a unique Aadhaar
            and license number, or use the existing member ID if they are already registered.
          </p>
        </div>
      )}
      <DetailSection title="Personal">
        {buildPersonalRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} />
        ))}
      </DetailSection>

      <DetailSection title="Address">
        {buildAddressRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} />
        ))}
      </DetailSection>

      <DetailSection title="Professional">
        {buildProfessionalRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} />
        ))}
      </DetailSection>

      <DetailSection title="Application workflow">
        {buildWorkflowRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} />
        ))}
      </DetailSection>

      {(documents.length > 0 || paymentProof) && (
        <section className="rounded-xl border border-neutral-200 overflow-hidden">
          <h3 className="bg-neutral-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
            Documents & images
          </h3>
          <div className="p-4 grid grid-cols-2 gap-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
            {paymentProof && (
              <a
                href={paymentProof}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-neutral-200 overflow-hidden bg-white hover:border-blue-300"
              >
                <img
                  src={paymentProof}
                  alt="Payment proof"
                  className="w-full aspect-[4/3] object-cover bg-neutral-100"
                />
                <div className="px-2.5 py-2 border-t border-neutral-100">
                  <p className="text-xs font-medium text-neutral-800">Payment proof</p>
                </div>
              </a>
            )}
          </div>
        </section>
      )}

      {request.statusHistory && request.statusHistory.length > 0 && (
        <DetailSection title="Status history">
          {request.statusHistory.map((h) => (
            <DetailRowItem
              key={h.id}
              label={formatDateTime(h.createdAt)}
              value={[h.fromStatus ? formatEnum(h.fromStatus) : '—', '→', formatEnum(h.toStatus), h.notes ? `(${h.notes})` : ''].filter(Boolean).join(' ')}
            />
          ))}
        </DetailSection>
      )}
    </div>
  )
}
