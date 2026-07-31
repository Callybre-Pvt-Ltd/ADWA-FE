/** Compress an image File in-browser before upload. Non-images are returned unchanged. */
export async function compressImageFile(
  file: File,
  options?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    /** Skip compression when file is already under this many bytes */
    skipUnderBytes?: number
  },
): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const skipUnderBytes = options?.skipUnderBytes ?? 350_000
  if (file.size <= skipUnderBytes) return file

  const maxWidth = options?.maxWidth ?? 1600
  const maxHeight = options?.maxHeight ?? 1600
  const quality = options?.quality ?? 0.72

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality)
  })

  if (!blob || blob.size >= file.size) return file

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'upload'
  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

export async function compressImageFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[],
): Promise<T> {
  const entries = await Promise.all(
    fields.map(async (field) => {
      const value = data[field]
      if (value instanceof File) {
        return [field, await compressImageFile(value)] as const
      }
      return [field, value] as const
    }),
  )

  return { ...data, ...Object.fromEntries(entries) }
}
