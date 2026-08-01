import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import type { DriverRequestFormData } from "@/utils/validators";
import { FormSection } from "./FormField";

function fileToPreview(file: File): string {
  return URL.createObjectURL(file);
}

const UPLOAD_FIELDS: {
  field: keyof DriverRequestFormData;
  labelKey: string;
  hintKey?: string;
}[] = [
  { field: "driverPhoto", labelKey: "photo", hintKey: "photoSize" },
  { field: "aadhaarFront", labelKey: "aadhaarFront", hintKey: "docSize" },
  { field: "aadhaarBack", labelKey: "aadhaarBack", hintKey: "docSize" },
  { field: "licenseFront", labelKey: "licenseFront", hintKey: "docSize" },
  { field: "licenseBack", labelKey: "licenseBack", hintKey: "docSize" },
  { field: "vehicleRc", labelKey: "vehicleRc", hintKey: "docSize" },
];

export default function StepUploads() {
  const { t } = useTranslation("pages");
  const docs = (key: string) => t(`apply.docs.${key}`);

  const {
    setValue,
    formState: { errors },
  } = useFormContext<DriverRequestFormData>();
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const handleFile = (field: keyof DriverRequestFormData, file: File) => {
    setPreviews((current) => {
      const existingPreview = current[field];
      if (existingPreview) URL.revokeObjectURL(existingPreview);
      return {
        ...current,
        [field]: fileToPreview(file),
      };
    });
    setValue(field, file as never, { shouldValidate: true });
  };

  const handleRemoveFile = (field: keyof DriverRequestFormData) => {
    setValue(field, undefined as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setPreviews((current) => {
      const existingPreview = current[field];
      if (existingPreview) URL.revokeObjectURL(existingPreview);
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const fileFieldValue = (field: keyof DriverRequestFormData) =>
    handleFile.bind(null, field);

  return (
    <FormSection title={t("apply.documentUpload")} singleCol>
      <p className="rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 px-4 py-3 text-sm font-medium leading-6 text-amber-900">
        {docs("noteText")}
      </p>

      <div className="grid grid-cols-1 gap-6 overflow-visible md:grid-cols-2 xl:grid-cols-3">
        {UPLOAD_FIELDS.map(({ field, labelKey, hintKey }) => (
          <FileUploadZone
            key={field}
            className="overflow-visible"
            label={docs(labelKey)}
            hint={hintKey ? docs(hintKey) : undefined}
            accept="image/*,.pdf"
            preview={previews[field]}
            onFileSelect={fileFieldValue(field)}
            onFileRemove={() => handleRemoveFile(field)}
            error={errors[field]?.message as string | undefined}
          />
        ))}
      </div>
    </FormSection>
  );
}
