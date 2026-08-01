import { useId } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface FileUploadZoneProps {
  label: string;
  hint?: string;
  accept?: string;
  preview?: string;
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  error?: string;
  className?: string;
}

function isImagePreview(preview?: string) {
  return Boolean(preview && /^(blob:|data:image\/|https?:\/\/)/i.test(preview));
}

export function FileUploadZone({
  label,
  hint,
  accept,
  preview,
  onFileSelect,
  onFileRemove,
  error,
  className,
}: FileUploadZoneProps) {
  const inputId = useId();
  const hasPreview = Boolean(preview);
  const showImagePreview = isImagePreview(preview);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-neutral-900"
          >
            {label}
          </label>
          {hint && (
            <p className="mt-1 text-xs leading-5 text-neutral-500">{hint}</p>
          )}
        </div>
        {hasPreview && onFileRemove && (
          <button
            type="button"
            onClick={onFileRemove}
            aria-label={`Remove ${label}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </button>
        )}
      </div>

      <label
        htmlFor={inputId}
        className={cn(
          "group relative flex min-h-72 cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border-2 border-dashed border-blue-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all",
          "hover:border-blue-300 hover:bg-blue-50/30 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100",
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
            : "",
          hasPreview ? "justify-between" : "items-center justify-center",
        )}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileSelect(file);
            event.target.value = "";
          }}
        />

        {!hasPreview ? (
          <div className="flex w-full max-w-xs flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-inner ring-1 ring-blue-100">
              <Upload
                className="h-7 w-7"
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </div>
            <p className="text-lg font-semibold text-neutral-900">
              Tap to upload file
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Drag and drop here, or browse from your device
            </p>
            {hint && (
              <p className="mt-4 max-w-[16rem] rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-medium leading-5 text-blue-700">
                {hint}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  File selected
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {label}
                </p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                Ready
              </div>
            </div>

            <div className="mt-4 flex flex-1 items-center justify-center rounded-[1.5rem] bg-linear-to-br from-neutral-50 to-blue-50/60 p-3">
              {showImagePreview ? (
                <img
                  src={preview}
                  alt={label}
                  className="max-h-52 w-full rounded-[1.25rem] object-contain shadow-sm"
                />
              ) : (
                <div className="flex w-full max-w-60 flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-blue-200 bg-white/90 px-6 py-10 text-center shadow-sm">
                  <Upload
                    className="h-8 w-8 text-blue-600"
                    strokeWidth={2.1}
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-neutral-900">
                    Preview ready
                  </p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    The file will be uploaded with the form
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}
      </label>
    </div>
  );
}
