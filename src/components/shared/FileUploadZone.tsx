import { useEffect, useId, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Camera, ImagePlus, Upload, X } from "lucide-react";
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
  /** When true, show a dedicated camera capture control on mobile (default true). */
  allowCamera?: boolean;
}

function isImagePreview(preview?: string) {
  return Boolean(preview && /^(blob:|data:image\/|https?:\/\/)/i.test(preview));
}

function useIsMobileUpload() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function FileUploadZone({
  label,
  hint,
  accept = "image/*,.pdf",
  preview,
  onFileSelect,
  onFileRemove,
  error,
  className,
  allowCamera = true,
}: FileUploadZoneProps) {
  const { t, i18n } = useTranslation("pages");
  const isHi = i18n.language === "hi";
  const galleryId = useId();
  const cameraId = useId();
  const isMobile = useIsMobileUpload();
  const showCamera = allowCamera && isMobile;
  const hasPreview = Boolean(preview);
  const showImagePreview = isImagePreview(preview);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFileSelect(file);
    event.target.value = "";
  };

  const pickLabel = t("apply.docs.chooseFile", isHi ? "फ़ाइल चुनें" : "Choose file");
  const cameraLabel = t("apply.docs.takePhoto", isHi ? "कैमरा से फोटो लें" : "Take photo");
  const tapUpload = t("apply.docs.tapUpload", isHi ? "अपलोड करने के लिए टैप करें" : "Tap to upload file");
  const dragHint = t(
    "apply.docs.dragHint",
    isHi ? "यहाँ खींचें और छोड़ें, या डिवाइस से चुनें" : "Drag and drop here, or browse from your device",
  );
  const mobileHint = t(
    "apply.docs.mobileHint",
    isHi
      ? "कैमरा से फोटो लें या गैलरी / फ़ाइल से चुनें"
      : "Take a photo with camera, or choose from gallery / files",
  );
  const fileSelected = t("apply.docs.fileSelected", isHi ? "फ़ाइल चुनी गई" : "File selected");
  const ready = t("apply.docs.ready", isHi ? "तैयार" : "Ready");
  const changeFile = t("apply.docs.changeFile", isHi ? "बदलें" : "Change");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{label}</p>
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

      <input
        id={galleryId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />
      {showCamera && (
        <input
          id={cameraId}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleChange}
        />
      )}

      <div
        className={cn(
          "group relative flex min-h-72 flex-col overflow-hidden rounded-[1.75rem] border-2 border-dashed border-blue-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all",
          "hover:border-blue-300 hover:bg-blue-50/30",
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
            : "focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100",
          hasPreview ? "justify-between" : "items-center justify-center",
        )}
      >
        {!hasPreview ? (
          <div className="flex w-full max-w-xs flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-inner ring-1 ring-blue-100">
              <Upload
                className="h-7 w-7"
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </div>
            <p className="text-lg font-semibold text-neutral-900">{tapUpload}</p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {showCamera ? mobileHint : dragHint}
            </p>

            {showCamera ? (
              <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
                <label
                  htmlFor={cameraId}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
                >
                  <Camera className="h-4.5 w-4.5" aria-hidden="true" />
                  {cameraLabel}
                </label>
                <label
                  htmlFor={galleryId}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-50 active:scale-[0.98]"
                >
                  <ImagePlus className="h-4.5 w-4.5" aria-hidden="true" />
                  {pickLabel}
                </label>
              </div>
            ) : (
              <label
                htmlFor={galleryId}
                className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                {pickLabel}
              </label>
            )}

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
                  {fileSelected}
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{label}</p>
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                {ready}
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
                    {t("apply.docs.previewReady", isHi ? "प्रीव्यू तैयार" : "Preview ready")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {t(
                      "apply.docs.willUpload",
                      isHi
                        ? "फ़ाइल फॉर्म के साथ अपलोड होगी"
                        : "The file will be uploaded with the form",
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className={cn("mt-4 flex gap-2.5", showCamera ? "flex-col sm:flex-row" : "")}>
              {showCamera && (
                <label
                  htmlFor={cameraId}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  {cameraLabel}
                </label>
              )}
              <label
                htmlFor={galleryId}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {changeFile}
              </label>
            </div>
          </>
        )}

        {error && (
          <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
