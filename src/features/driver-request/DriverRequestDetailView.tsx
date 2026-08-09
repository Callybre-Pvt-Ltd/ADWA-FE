import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDate, formatDateTime } from '@/utils/formatters'
import type { ApplicationDocument, DriverRequest } from '@/types/driver.types'
import { cn } from '@/utils/cn'
import { districtMapEnToHi, stateMapEnToHi, nameTranslations } from '@/utils/translations'

type DetailRow = { label: string; value?: string | number | null }

function formatEnum(value?: string | null): string | undefined {
  if (!value) return undefined
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const sectionTitles: Record<string, { en: string; hi: string }> = {
  'Personal': { en: 'Personal Details', hi: 'व्यक्तिगत विवरण' },
  'Address': { en: 'Address Details', hi: 'पता विवरण' },
  'Professional': { en: 'Professional Details', hi: 'व्यावसायिक विवरण' },
  'Application workflow': { en: 'Application Workflow', hi: 'आवेदन वर्कफ़्लो' },
  'Documents & images': { en: 'Documents & Images', hi: 'दस्तावेज़ और चित्र' },
  'Status history': { en: 'Status History', hi: 'स्थिति का इतिहास' },
}

const labelTranslations: Record<string, { en: string; hi: string }> = {
  'Full name': { en: 'Full name', hi: 'पूरा नाम' },
  'Father name': { en: 'Father name', hi: 'पिता का नाम' },
  'Mother name': { en: 'Mother name', hi: 'माता का नाम' },
  'Gender': { en: 'Gender', hi: 'लिंग' },
  'Date of birth': { en: 'Date of birth', hi: 'जन्म तिथि' },
  'Mobile': { en: 'Mobile', hi: 'मोबाइल नंबर' },
  'Alternate mobile': { en: 'Alternate mobile', hi: 'वैकल्पिक मोबाइल' },
  'Email': { en: 'Email', hi: 'ईमेल' },
  'Blood group': { en: 'Blood group', hi: 'रक्त समूह' },
  'District': { en: 'District', hi: 'जिला' },
  'Village / town': { en: 'Village / town', hi: 'गाँव / शहर' },
  'Tehsil / PS': { en: 'Tehsil / PS', hi: 'तहसील / थाना' },
  'State': { en: 'State', hi: 'राज्य' },
  'Pincode': { en: 'Pincode', hi: 'पिनकोड' },
  'Full address': { en: 'Full address', hi: 'पूरा पता' },
  'Aadhaar number': { en: 'Aadhaar number', hi: 'आधार नंबर' },
  'License number': { en: 'License number', hi: 'लाइसेंस नंबर' },
  'License issue date': { en: 'License issue date', hi: 'लाइसेंस जारी करने की तिथि' },
  'License expiry date': { en: 'License expiry date', hi: 'लाइसेंस समाप्ति तिथि' },
  'Vehicle type': { en: 'Vehicle type', hi: 'वाहन का प्रकार' },
  'Vehicle number': { en: 'Vehicle number', hi: 'वाहन नंबर' },
  'Experience (years)': { en: 'Experience (years)', hi: 'अनुभव (वर्ष)' },
  'Reference number': { en: 'Reference number', hi: 'संदर्भ संख्या' },
  'Status': { en: 'Status', hi: 'स्थिति' },
  'Submitted': { en: 'Submitted', hi: 'जमा किया गया' },
  'Forwarded': { en: 'Forwarded', hi: 'अग्रेषित किया गया' },
  'Approved': { en: 'Approved', hi: 'स्वीकृत किया गया' },
  'Rejected': { en: 'Rejected', hi: 'अस्वीकृत किया गया' },
  'Verification remarks': { en: 'Verification remarks', hi: 'सत्यापन टिप्पणियां' },
  'DI notes': { en: 'DI notes', hi: 'डीआई नोट्स' },
  'Remarks': { en: 'Remarks', hi: 'टिप्पणियां' },
  'Payment proof': { en: 'Payment proof', hi: 'भुगतान प्रमाण' },
}

const genderTranslations: Record<string, string> = {
  'Male': 'पुरुष',
  'Female': 'महिला',
  'Other': 'अन्य',
}

const statusTranslations: Record<string, string> = {
  'Forwarded To Admin': 'एडमिन को अग्रेषित',
  'Approved': 'स्वीकृत',
  'Rejected': 'अस्वीकृत',
  'Payment Pending': 'भुगतान लंबित',
  'Submitted': 'जमा किया गया',
  'Draft': 'ड्राफ्ट',
  'Verified': 'सत्यापित'
}

const documentTypeTranslations: Record<string, string> = {
  'DRIVER_PHOTO': 'ड्राइवर फ़ोटो',
  'PROFILE_IMAGE': 'प्रोफ़ाइल छवि',
  'AADHAAR_FRONT': 'आधार कार्ड (सामने)',
  'AADHAAR_BACK': 'आधार कार्ड (पीछे)',
  'LICENSE_FRONT': 'लाइसेंस (सामने)',
  'LICENSE_BACK': 'लाइसेंस (पीछे)',
  'PAYMENT_PROOF': 'भुगतान प्रमाण',
  'VEHICLE_RC': 'वाहन RC',
}

const DOC_ORDER = [
  'DRIVER_PHOTO',
  'AADHAAR_FRONT',
  'AADHAAR_BACK',
  'LICENSE_FRONT',
  'LICENSE_BACK',
  'VEHICLE_RC',
  'PAYMENT_PROOF',
]

function isLikelyImage(doc: { mimeType?: string | null; fileName?: string | null; downloadUrl?: string | null }): boolean {
  const mime = (doc.mimeType ?? '').toLowerCase()
  if (mime.startsWith('image/')) return true
  const name = `${doc.fileName ?? ''} ${doc.downloadUrl ?? ''}`.toLowerCase()
  return /\.(jpe?g|png|gif|webp|bmp|heic)(\?|$)/i.test(name)
}

function DocumentCard({ doc, isHi }: { doc: ApplicationDocument; isHi?: boolean }) {
  const url = doc.downloadUrl
  const showImage = Boolean(url && isLikelyImage(doc))
  const docTypeLabel = isHi
    ? (documentTypeTranslations[doc.documentType] || formatEnum(doc.documentType))
    : formatEnum(doc.documentType)

  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block rounded-lg border border-neutral-200 overflow-hidden bg-white hover:border-blue-400 hover:shadow-md transition-all',
        !url && 'pointer-events-none opacity-60',
      )}
    >
      {showImage && url ? (
        <img
          src={url}
          alt={docTypeLabel ?? doc.fileName}
          className="w-full aspect-[4/3] object-contain bg-neutral-50"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-50 text-xs text-neutral-500 p-3 text-center">
          {url
            ? (isHi ? 'फ़ाइल खोलें' : 'Open file')
            : (isHi ? 'फ़ाइल उपलब्ध नहीं' : 'File unavailable')}
          <span className="block mt-1 truncate max-w-full px-2">{doc.fileName}</span>
        </div>
      )}
      <div className="px-2.5 py-2 border-t border-neutral-100">
        <p className="text-xs font-semibold text-neutral-800 truncate">{docTypeLabel}</p>
        <p className="text-[10px] text-blue-600 font-medium">
          {url ? (isHi ? 'बड़ा देखें / डाउनलोड' : 'View full size') : (isHi ? 'URL नहीं मिला' : 'No URL')}
        </p>
      </div>
    </a>
  )
}

const conflictMapHi: Record<string, string> = {
  'Aadhaar number conflict': 'आधार संख्या का टकराव',
  'License number conflict': 'लाइसेंस संख्या का टकराव',
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
      <h3 className="bg-neutral-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
        {title}
      </h3>
      <dl className="divide-y divide-neutral-100">{children}</dl>
    </section>
  )
}

function DetailRowItem({ label, value, isHi }: DetailRow & { isHi?: boolean }) {
  if (value === undefined || value === null || value === '') return null
  const translatedLabel = isHi ? (labelTranslations[label]?.hi ?? label) : label

  let displayValue = value
  if (isHi && typeof value === 'string') {
    if (genderTranslations[value]) {
      displayValue = genderTranslations[value]
    } else if (statusTranslations[value]) {
      displayValue = statusTranslations[value]
    } else if (districtMapEnToHi[value]) {
      displayValue = districtMapEnToHi[value]
    } else if (stateMapEnToHi[value]) {
      displayValue = stateMapEnToHi[value]
    } else if (nameTranslations[value]) {
      displayValue = nameTranslations[value]
    }
  }

  return (
    <div className="grid grid-cols-[minmax(0,38%)_1fr] gap-3 px-4 py-2.5 text-sm">
      <dt className="text-neutral-500">{translatedLabel}</dt>
      <dd className="font-medium text-neutral-900 break-words">{displayValue}</dd>
    </div>
  )
}

function buildPersonalRows(r: DriverRequest): DetailRow[] {
  return [
    { label: 'Full name', value: r.fullName ?? r.name },
    { label: 'Father name', value: r.fatherName },
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
    { label: 'Aadhaar number', value: r.aadharNumber },
    { label: 'License number', value: r.licenseNumber },
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

function formatConflictMessage(request: DriverRequest, isHi: boolean): string | null {
  if (!request.registrationConflict) return null
  const baseConflict = isHi ? (conflictMapHi[request.registrationConflict] || request.registrationConflict) : request.registrationConflict

  if (request.conflictMemberNumber) {
    return isHi
      ? `${baseConflict} (सदस्य संख्या ${request.conflictMemberNumber}).`
      : `${baseConflict} (${request.conflictMemberNumber}).`
  }
  if (request.conflictReferenceNumber) {
    return isHi
      ? `${baseConflict} (आवेदन संदर्भ संख्या ${request.conflictReferenceNumber}).`
      : `${baseConflict} (application ${request.conflictReferenceNumber}).`
  }
  return `${baseConflict}.`
}

type DriverRequestDetailViewProps = {
  request: DriverRequest
  className?: string
}

export function DriverRequestDetailView({ request, className }: DriverRequestDetailViewProps) {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'
  const documents = [...(request.documents ?? [])].sort((a, b) => {
    const ai = DOC_ORDER.indexOf(a.documentType)
    const bi = DOC_ORDER.indexOf(b.documentType)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })
  const paymentProof = request.paymentProofUrl
  const conflictMessage = formatConflictMessage(request, isHi)
  const hasDocs = documents.length > 0 || Boolean(paymentProof)

  const tSection = (title: string) => {
    if (!isHi) return sectionTitles[title]?.en ?? title
    return sectionTitles[title]?.hi ?? title
  }

  return (
    <div className={cn('space-y-4', className)}>
      {conflictMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">{isHi ? 'इस आवेदन को स्वीकृत नहीं किया जा सकता' : 'Cannot approve this application'}</p>
          <p className="mt-1">{conflictMessage}</p>
          <p className="mt-2 text-xs text-red-700">
            {isHi
              ? 'इस डुप्लिकेट आवेदन को अस्वीकार करें। ड्राइवर को एक अद्वितीय आधार और लाइसेंस नंबर के साथ फिर से आवेदन करना होगा, या यदि वे पहले से पंजीकृत हैं तो मौजूदा सदस्य आईडी का उपयोग करना होगा।'
              : 'Reject this duplicate application. The driver must apply again with a unique Aadhaar and license number, or use the existing member ID if they are already registered.'}
          </p>
        </div>
      )}
      
      <DetailSection title={tSection('Personal')}>
        {buildPersonalRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} isHi={isHi} />
        ))}
      </DetailSection>

      <section className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
        <h3 className="bg-neutral-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
          {tSection('Documents & images')}
        </h3>
        {hasDocs ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} isHi={isHi} />
            ))}
            {paymentProof && (
              <a
                href={paymentProof}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-neutral-200 overflow-hidden bg-white hover:border-blue-400 hover:shadow-md transition-all"
              >
                <img
                  src={paymentProof}
                  alt={isHi ? 'भुगतान प्रमाण' : 'Payment proof'}
                  className="w-full aspect-[4/3] object-contain bg-neutral-50"
                />
                <div className="px-2.5 py-2 border-t border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-800">{isHi ? 'भुगतान प्रमाण' : 'Payment proof'}</p>
                  <p className="text-[10px] text-blue-600 font-medium">{isHi ? 'बड़ा देखें / डाउनलोड' : 'View full size'}</p>
                </div>
              </a>
            )}
          </div>
        ) : (
          <p className="px-4 py-6 text-sm text-neutral-500 text-center">
            {isHi ? 'कोई दस्तावेज़ अपलोड नहीं किया गया।' : 'No documents uploaded for this application.'}
          </p>
        )}
      </section>

      <DetailSection title={tSection('Address')}>
        {buildAddressRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} isHi={isHi} />
        ))}
      </DetailSection>

      <DetailSection title={tSection('Professional')}>
        {buildProfessionalRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} isHi={isHi} />
        ))}
      </DetailSection>

      <DetailSection title={tSection('Application workflow')}>
        {buildWorkflowRows(request).map((row) => (
          <DetailRowItem key={row.label} {...row} isHi={isHi} />
        ))}
      </DetailSection>

      {request.statusHistory && request.statusHistory.length > 0 && (
        <DetailSection title={tSection('Status history')}>
          {request.statusHistory.map((h) => {
            const fromLabel = h.fromStatus ? formatEnum(h.fromStatus) : '—'
            const toLabel = formatEnum(h.toStatus)
            
            const displayFrom = isHi && fromLabel && statusTranslations[fromLabel] ? statusTranslations[fromLabel] : fromLabel
            const displayTo = isHi && toLabel && statusTranslations[toLabel] ? statusTranslations[toLabel] : toLabel

            return (
              <DetailRowItem
                key={h.id}
                label={formatDateTime(h.createdAt)}
                value={[displayFrom, '→', displayTo, h.notes ? `(${h.notes})` : ''].filter(Boolean).join(' ')}
                isHi={isHi}
              />
            )
          })}
        </DetailSection>
      )}
    </div>
  )
}
