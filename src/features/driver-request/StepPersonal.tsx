import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { User, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DOBPicker } from "@/components/shared/DOBPicker";
import { DistrictSearchSelect } from "@/components/shared/DistrictSearchSelect";
import { usePublicDistricts } from "@/hooks/useDistricts";
import { INDIA_STATE_NAMES } from "@/data/indiaGeo";
import type { DriverRequestFormData } from "@/utils/validators";
import { FormField, FormSection } from "./FormField";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Button } from "@/components/ui/button";
import { stateMapEnToHi } from "@/utils/translations";

const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

export default function StepPersonal() {
  const { t, i18n } = useTranslation("pages");
  const f = (key: string) => t(`apply.fields.${key}`);
  const s = (key: string) => t(`apply.sections.${key}`);
  const isHi = i18n.language === "hi";

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<DriverRequestFormData>();
  const state = watch("state");
  const districtId = watch("districtId");
  const {
    data: districts,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = usePublicDistricts(state ?? "");

  const handleStateChange = (nextState: string) => {
    setValue("state", nextState, { shouldValidate: true });
    // Clear district so we never keep a district from the previous state
    setValue("districtId", "", { shouldValidate: true });
    setValue("district", "", { shouldValidate: false });
  };

  const handleDistrictChange = (id: string) => {
    const selected = districts?.find((d) => d.id === id);
    setValue("districtId", id, { shouldValidate: true });
    setValue("district", selected?.name ?? "", { shouldValidate: false });
  };

  // If selected district is not in the current state's list, clear it
  useEffect(() => {
    if (!state || !districtId || !districts) return;
    const stillValid = districts.some((d) => d.id === districtId);
    if (!stillValid) {
      setValue("districtId", "", { shouldValidate: true });
      setValue("district", "", { shouldValidate: false });
    }
  }, [state, districtId, districts, setValue]);

  const stateLabel = (name: string) =>
    isHi ? stateMapEnToHi[name] || name : name;

  return (
    <div className="space-y-8">
      <FormSection icon={<User size={16} />} title={s("nameContact")}>
        <FormField
          label={f("fullName")}
          htmlFor="name"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder={f("fullNamePlaceholder")}
            {...register("name")}
          />
        </FormField>

        <FormField
          label={f("fatherName")}
          htmlFor="fatherName"
          required
          error={errors.fatherName?.message}
        >
          <Input
            id="fatherName"
            placeholder={f("fatherNamePlaceholder")}
            {...register("fatherName")}
          />
        </FormField>

        <FormField label={f("gender")} required error={errors.gender?.message}>
          <Select
            value={watch("gender")}
            onValueChange={(v) =>
              setValue("gender", v as DriverRequestFormData["gender"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={f("genderSelect")} />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {f(
                    g === "MALE"
                      ? "genderMale"
                      : g === "FEMALE"
                        ? "genderFemale"
                        : "genderOther",
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label={f("mobile")}
          htmlFor="mobile"
          required
          error={errors.mobile?.message}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Phone size={15} />
            </span>
            <Input
              id="mobile"
              type="tel"
              inputMode="numeric"
              placeholder={f("mobilePlaceholder")}
              className="pl-10"
              {...register("mobile")}
            />
          </div>
        </FormField>

        <FormField
          label={f("alternateMobile")}
          htmlFor="altMobile"
          optional
          error={errors.altMobile?.message}
        >
          <Input
            id="altMobile"
            type="tel"
            inputMode="numeric"
            placeholder={f("alternateMobilePlaceholder")}
            {...register("altMobile")}
          />
        </FormField>

        <FormField
          label={f("email")}
          htmlFor="email"
          optional
          error={errors.email?.message}
          fullWidth
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <Mail size={15} />
            </span>
            <Input
              id="email"
              type="email"
              placeholder={f("emailPlaceholder")}
              className="pl-10"
              {...register("email")}
            />
          </div>
        </FormField>
      </FormSection>

      <FormSection
        icon={<Calendar size={16} />}
        title={s("dateOfBirth")}
        singleCol
      >
        <FormField
          label={f("dateOfBirth")}
          required
          error={errors.dateOfBirth?.message}
        >
          <DOBPicker name="dateOfBirth" error={errors.dateOfBirth?.message} />
        </FormField>
      </FormSection>

      <FormSection
        icon={<MapPin size={16} />}
        title={t("apply.addressDetails")}
      >
        <FormField label={f("state")} required error={errors.state?.message}>
          <Select value={state || undefined} onValueChange={handleStateChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={isHi ? "राज्य चुनें" : "Select state"}
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {INDIA_STATE_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  {stateLabel(name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {!state ? (
          <FormField
            label={f("district")}
            required
            error={errors.districtId?.message}
          >
            <DistrictSearchSelect
              districts={[]}
              value={districtId}
              selectedName={watch("district")}
              onChange={handleDistrictChange}
              disabled
              placeholder={
                isHi
                  ? "पहले राज्य चुनें"
                  : "Select state first"
              }
              searchPlaceholder={f("searchDistrict")}
              emptyText={f("noDistrictFound")}
            />
          </FormField>
        ) : isLoading ? (
          <SkeletonCard />
        ) : isError ? (
          <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm font-semibold text-red-800">
              {isHi
                ? "जिलों की सूची लोड नहीं हो सकी।"
                : "Could not load the district list."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => refetch()}
              loading={isFetching}
              loadingText={isHi ? "फिर कोशिश हो रही है…" : "Trying again…"}
            >
              {isHi ? "फिर कोशिश करें" : "Try again"}
            </Button>
          </div>
        ) : (
          <FormField
            label={f("district")}
            required
            error={errors.districtId?.message}
          >
            <DistrictSearchSelect
              districts={districts ?? []}
              value={districtId}
              selectedName={watch("district")}
              onChange={handleDistrictChange}
              placeholder={f("selectDistrict")}
              searchPlaceholder={f("searchDistrict")}
              emptyText={f("noDistrictFound")}
            />
          </FormField>
        )}

        <FormField
          label={f("village")}
          htmlFor="village"
          required
          error={errors.village?.message}
        >
          <Input
            id="village"
            placeholder={f("villagePlaceholder")}
            {...register("village")}
          />
        </FormField>

        <FormField
          label={f("thana")}
          htmlFor="tehsil"
          required
          error={errors.tehsil?.message}
        >
          <Input
            id="tehsil"
            placeholder={f("thanaPlaceholder")}
            {...register("tehsil")}
          />
        </FormField>

        <FormField
          label={f("pincode")}
          htmlFor="pincode"
          required
          error={errors.pincode?.message}
        >
          <Input
            id="pincode"
            inputMode="numeric"
            placeholder={f("pincodePlaceholder")}
            {...register("pincode")}
          />
        </FormField>

        <FormField
          label={f("fullAddress")}
          htmlFor="address"
          required
          error={errors.address?.message}
          fullWidth
        >
          <Textarea
            id="address"
            placeholder={f("addressPlaceholder")}
            rows={3}
            {...register("address")}
          />
        </FormField>
      </FormSection>
    </div>
  );
}
