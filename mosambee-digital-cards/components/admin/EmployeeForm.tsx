"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validations";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types";
import Image from "next/image";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

interface EmployeeFormProps {
  defaultValues?: Partial<Employee>;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

const DEPARTMENTS = [
  "Technology", "Product", "Sales", "Marketing", "Operations",
  "Finance", "HR", "Customer Success", "Legal", "Design",
];

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: EmployeeFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.profile_photo_url ?? null
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_id:      defaultValues?.employee_id    ?? "",
      full_name:        defaultValues?.full_name       ?? "",
      designation:      defaultValues?.designation     ?? "",
      department:       defaultValues?.department      ?? "",
      mobile_number:    defaultValues?.mobile_number   ?? "",
      alternate_number: defaultValues?.alternate_number ?? "",
      email:            defaultValues?.email           ?? "",
      company_website:  defaultValues?.company_website ?? "https://mosambee.com",
      office_address:   defaultValues?.office_address  ?? "",
      linkedin_url:     defaultValues?.linkedin_url    ?? "",
      whatsapp_number:  defaultValues?.whatsapp_number ?? "",
      status:           defaultValues?.status          ?? "active",
    },
  });

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !defaultValues?.id) {
      toast.error("Save the employee first before uploading a photo.");
      return;
    }

    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append("photo", file);

    const res = await fetch(`/api/employees/${defaultValues.id}/photo`, {
      method: "POST",
      body: fd,
    });
    const json = await res.json();

    if (json.success) {
      setPhotoPreview(json.data.profile_photo_url);
      toast.success("Photo uploaded!");
    } else {
      toast.error(json.error ?? "Upload failed");
    }
    setUploadingPhoto(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo upload */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-slate-700 overflow-hidden border-2 border-dashed border-gray-300 dark:border-slate-600">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt="Profile"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Upload className="w-6 h-6" />
              </div>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Profile Photo</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">JPG, PNG, WebP · max 5MB</p>
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="btn-secondary text-xs px-3 py-1.5 mt-2"
          >
            {mode === "edit" ? "Change Photo" : "Upload Photo (after save)"}
          </button>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Employee ID" error={errors.employee_id?.message} required>
          <input
            {...register("employee_id")}
            className="form-input uppercase"
            placeholder="MOS-001"
            disabled={mode === "edit"}
          />
        </Field>

        <Field label="Full Name" error={errors.full_name?.message} required>
          <input {...register("full_name")} className="form-input" placeholder="Rahul Sharma" />
        </Field>

        <Field label="Designation" error={errors.designation?.message} required>
          <input {...register("designation")} className="form-input" placeholder="Senior Developer" />
        </Field>

        <Field label="Department" error={errors.department?.message} required>
          <select {...register("department")} className="form-input">
            <option value="">Select Department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        <Field label="Mobile Number" error={errors.mobile_number?.message} required>
          <input {...register("mobile_number")} className="form-input" placeholder="+91-9876543210" type="tel" />
        </Field>

        <Field label="Alternate Number" error={errors.alternate_number?.message}>
          <input {...register("alternate_number")} className="form-input" placeholder="+91-9876543211" type="tel" />
        </Field>

        <Field label="Email" error={errors.email?.message} required>
          <input {...register("email")} className="form-input" placeholder="name@mosambee.com" type="email" />
        </Field>

        <Field label="WhatsApp Number" error={errors.whatsapp_number?.message}>
          <input {...register("whatsapp_number")} className="form-input" placeholder="+919876543210" type="tel" />
        </Field>

        <Field label="Company Website" error={errors.company_website?.message}>
          <input {...register("company_website")} className="form-input" placeholder="https://mosambee.com" type="url" />
        </Field>

        <Field label="LinkedIn URL" error={errors.linkedin_url?.message}>
          <input {...register("linkedin_url")} className="form-input" placeholder="https://linkedin.com/in/..." type="url" />
        </Field>

        <div className="md:col-span-2">
          <Field label="Office Address" error={errors.office_address?.message}>
            <textarea
              {...register("office_address")}
              className="form-input resize-none"
              rows={3}
              placeholder="123 Tech Park, Whitefield, Bangalore - 560066"
            />
          </Field>
        </div>

        <Field label="Status" error={errors.status?.message} required>
          <select {...register("status")} className="form-input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary min-w-[120px]"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          ) : (
            mode === "edit" ? "Save Changes" : "Create Employee"
          )}
        </button>
      </div>
    </form>
  );
}
