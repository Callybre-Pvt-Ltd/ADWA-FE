/** Local calendar date as YYYY-MM-DD (never UTC-shifted). */
export function todayIso(): string {
  return toDateInputValue(new Date())
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ''
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  return match ? `${match[1]}-${match[2]}-${match[3]}` : ''
}

export function plusOneYearIso(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!match) return ''
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const next = new Date(year + 1, month, day)
  if (next.getMonth() !== month) next.setDate(0)
  return toDateInputValue(next)
}
