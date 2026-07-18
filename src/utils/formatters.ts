const MONTH_MAP: Record<string, string> = {
  'Jan': 'जनवरी', 'Feb': 'फरवरी', 'Mar': 'मार्च', 'Apr': 'अप्रैल',
  'May': 'मई', 'Jun': 'जून', 'Jul': 'जुलाई', 'Aug': 'अगस्त',
  'Sep': 'सितंबर', 'Oct': 'अक्टूबर', 'Nov': 'नवंबर', 'Dec': 'दिसंबर',
  'January': 'जनवरी', 'February': 'फरवरी', 'March': 'मार्च', 'April': 'अप्रैल',
  'June': 'जून', 'July': 'जुलाई', 'August': 'अगस्त',
  'September': 'सितंबर', 'October': 'अक्टूबर', 'November': 'नवंबर', 'December': 'दिसंबर'
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  let result = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const isHi = typeof window !== 'undefined' && (
    window.localStorage.getItem('i18nextLng') === 'hi' ||
    window.localStorage.getItem('i18nextLng')?.startsWith('hi') ||
    document.documentElement.lang === 'hi'
  )
  if (isHi) {
    for (const [en, hi] of Object.entries(MONTH_MAP)) {
      result = result.replace(en, hi)
    }
  }
  return result
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  let result = date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const isHi = typeof window !== 'undefined' && (
    window.localStorage.getItem('i18nextLng') === 'hi' ||
    window.localStorage.getItem('i18nextLng')?.startsWith('hi') ||
    document.documentElement.lang === 'hi'
  )
  if (isHi) {
    for (const [en, hi] of Object.entries(MONTH_MAP)) {
      result = result.replace(en, hi)
    }
  }
  return result
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function maskLicenseNumber(license: string): string {
  const parts = license.split('-')
  if (parts.length >= 3) {
    return `${parts[0]}-XXXX-${parts[parts.length - 1]}`
  }
  if (license.length > 6) {
    return `${license.slice(0, 3)}XXXX${license.slice(-4)}`
  }
  return license
}

export function generateRefNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'ADWA-2025-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
