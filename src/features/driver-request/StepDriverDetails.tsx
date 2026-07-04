import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CreditCard, Car, Lock, ShieldCheck, Droplets } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BloodGroupSelector } from "@/components/shared/BloodGroupSelector";
import { AadharInput } from "@/components/shared/AadharInput";
import { DOBPicker } from "@/components/shared/DOBPicker";
import { VEHICLE_TYPES } from "@/constants";
import type { DriverRequestFormData } from "@/utils/validators";
import { FormField, FormSection } from "./FormField";

const currentYear = new Date().getFullYear();
const EXPERIENCE_OPTIONS = Array.from({ length: 41 }, (_, i) => i);

export default function StepDriverDetails() {
  const { t } = useTranslation("pages");
  const f = (key: string, fallback?: string) =>
    t(`apply.fields.${key}`, fallback ?? key);
  const s = (key: string) => t(`apply.sections.${key}`);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<DriverRequestFormData>();

  return (
    <div className="space-y-8">
      <FormSection icon={<Car size={16} />} title={s("licenseDetails")}>
        <FormField
          label={f("license")}
          htmlFor="licenseNumber"
          required
          hint={f("licenseHint")}
          error={errors.licenseNumber?.message}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <CreditCard size={15} />
            </span>
            <Input
              id="licenseNumber"
              placeholder={f("licensePlaceholder")}
              className="pl-10 uppercase"
              {...register("licenseNumber", {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />
          </div>
        </FormField>

        <FormField
          label={f("licenseIssueDate", "License Issue Date")}
          required
          error={errors.licenseIssueDate?.message}
        >
          <DOBPicker
            name="licenseIssueDate"
            error={errors.licenseIssueDate?.message}
            maxYear={currentYear}
          />
        </FormField>

        <FormField
          label={f("licenseExpiry")}
          required
          error={errors.licenseExpiryDate?.message}
          fullWidth
        >
          <DOBPicker
            name="licenseExpiryDate"
            error={errors.licenseExpiryDate?.message}
            minYear={currentYear}
            maxYear={currentYear + 20}
          />
        </FormField>

        <FormField
          label={f("vehicleType")}
          required
          error={errors.vehicleType?.message}
        >
          <Select
            value={watch("vehicleType")}
            onValueChange={(v) =>
              setValue("vehicleType", v, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={f("vehicleTypeSelect")} />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_TYPES.map((vt) => (
                <SelectItem key={vt} value={vt}>
                  {vt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label={f("vehicleNumber", "Vehicle Number")}
          htmlFor="vehicleNumber"
          required
          error={errors.vehicleNumber?.message}
        >
          <Input
            id="vehicleNumber"
            placeholder="e.g. MP09 AB 1234"
            className="uppercase"
            {...register("vehicleNumber", {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
        </FormField>

        <FormField
          label={f("experience")}
          required
          error={errors.experienceYears?.message}
        >
          <Select
            value={watch("experienceYears")?.toString() ?? ""}
            onValueChange={(v) =>
              setValue("experienceYears", Number(v), { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={f("experienceSelect")} />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y === 0
                    ? "Less than 1 year"
                    : `${y} year${y > 1 ? "s" : ""}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </FormSection>

      <FormSection
        icon={<Droplets size={16} />}
        title={s("healthInfo")}
        singleCol
      >
        <FormField
          label={f("bloodGroup")}
          required
          error={errors.bloodGroup?.message}
        >
          <BloodGroupSelector
            name="bloodGroup"
            error={errors.bloodGroup?.message}
          />
        </FormField>
      </FormSection>

      <FormSection
        icon={<Lock size={16} />}
        title={s("aadharDetails")}
        singleCol
      >
        <FormField
          label={f("aadhaar")}
          htmlFor="aadharNumber"
          required
          hint={f("aadhaarHint")}
          error={errors.aadharNumber?.message}
        >
          <AadharInput
            name="aadharNumber"
            error={errors.aadharNumber?.message}
          />
        </FormField>

        <div className="flex items-start gap-2.5 bg-green-50 border-2 border-green-200 rounded-2xl px-4 py-3">
          <ShieldCheck size={16} className="text-green-600 mt-0.5 shrink-0" />
          <p className="text-xs text-green-800 leading-relaxed">
            {f("aadharSecurity")}
          </p>
        </div>
      </FormSection>
    </div>
  );
}
