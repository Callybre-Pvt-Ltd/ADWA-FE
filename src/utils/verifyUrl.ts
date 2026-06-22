/** Normalize verification URLs to the current dev server origin when running locally. */
export function normalizeVerifyUrl(url: string, verificationCode?: string): string {
  if (!url && verificationCode) {
    return `${window.location.origin}/verify/${verificationCode}`
  }

  if (import.meta.env.DEV) {
    const code = verificationCode ?? url.split('/').filter(Boolean).pop()
    if (code) {
      return `${window.location.origin}/verify/${code}`
    }
  }

  return url
}
