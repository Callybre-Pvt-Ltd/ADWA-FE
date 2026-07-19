import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileFormSchema, type ProfileFormData } from "@/utils/validators";
import { toast } from "sonner";
import { authService } from "@/services";

type ProfileFormProps = {
  defaultValues?: Partial<ProfileFormData> & {
    designation?: string;
  };
};

export default function ProfileForm({ defaultValues }: ProfileFormProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getMe(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", email: "", mobile: "", ...defaultValues },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.fullName,
        email: profile.email,
        mobile: profile.mobileNumber,
      });
      return;
    }

    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        email: defaultValues.email ?? "",
        mobile: defaultValues.mobile ?? "",
      });
    }
  }, [defaultValues, profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      authService.updateMe({
        fullName: data.name,
        email: data.email,
        mobileNumber: data.mobile,
      }),
    onSuccess: () => toast.success("Profile updated successfully"),
    onError: (err: Error) => toast.error(`Failed to update: ${err.message}`),
  });

  const onSubmit = handleSubmit((data) => updateMutation.mutate(data));

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Loading profile...</p>;
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} className="mt-1" />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register("email")}
          className="mt-1"
          type="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="mobile">Mobile</Label>
        <Input id="mobile" {...register("mobile")} className="mt-1" />
        {errors.mobile && (
          <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
        )}
      </div>
      <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
        {updateMutation.isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
