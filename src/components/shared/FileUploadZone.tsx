import { useCallback, useRef, useState } from 'react'
import { FileText, Image, Upload, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

export interface FileUploadZoneProps {
  label: string
  accept: string
  maxSizeMB?: number
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  preview?: string
  hint?: string
  error?: string
  className?: string
  testId?: string
}

export function FileUploadZone({
  label,
  accept,
  maxSizeMB,
  onFileSelect,
  onFileRemove,
  preview,
  hint,
  error,
  className,
  testId,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      setLocalError(null)
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        setLocalError(`File must be under ${maxSizeMB}MB`)
        return
      }
      setFileName(file.name)
      onFileSelect(file)
    },
    [maxSizeMB, onFileSelect],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const displayError = error ?? localError
  const isImage = preview && (preview.startsWith('blob:') || preview.startsWith('data:image') || /\.(jpg|jpeg|png|webp|gif)/i.test(fileName ?? ''))

  return (
    <div data-testid={testId} className={cn('space-y-2', className)}>
      <label className="text-base font-bold text-neutral-900">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 transition-all min-h-42.5 bg-neutral-50',
          dragOver ? 'border-royal-600 bg-royal-50 scale-[1.01]' : 'border-neutral-400 hover:border-royal-500 hover:bg-white',
          preview && 'border-emerald-500 bg-emerald-50/40',
          displayError && 'border-red-500 bg-red-50/40',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          aria-label={label}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        {preview ? (
          <div className="relative flex flex-col items-center gap-2">
            {isImage ? (
              <img src={preview} alt="Preview" className="h-20 w-20 rounded-lg object-cover ring-2 ring-white shadow-sm" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white shadow-sm">
                <FileText className="h-8 w-8 text-royal-600" />
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
            </span>
            {fileName && <p className="text-xs text-neutral-500 truncate max-w-35">{fileName}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute -right-1 -top-1 h-7 w-7 rounded-full p-0"
              onClick={(e) => {
                e.stopPropagation()
                setFileName(null)
                if (inputRef.current) inputRef.current.value = ''
                onFileRemove?.()
              }}
              aria-label="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <div className="icon-tile h-12 w-12 mb-2">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-neutral-800 text-center">Tap to upload file</p>
            {maxSizeMB && <p className="text-sm text-neutral-600 mt-1">Max {maxSizeMB}MB</p>}
          </>
        )}
        {fileName && !preview && (
          <p className="mt-2 text-sm text-neutral-600 flex items-center gap-1">
            {accept.includes('image') ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            {fileName}
          </p>
        )}
      </div>
      {hint && !displayError && <p className="text-base text-neutral-600">{hint}</p>}
      {displayError && <p className="text-base font-semibold text-red-700">{displayError}</p>}
    </div>
  )
}
