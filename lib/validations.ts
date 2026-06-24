import { z } from "zod";

export const employeeSchema = z.object({
  employee_id: z
    .string()
    .min(1, "Employee ID is required")
    .regex(/^[A-Z0-9-]+$/, "Only uppercase letters, numbers, and hyphens"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  department: z.string().min(2, "Department is required"),
  mobile_number: z
    .string()
    .min(10, "Valid mobile number required")
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format"),
  alternate_number: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Valid email required"),
  company_website: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  office_address: z.string().optional().or(z.literal("")),
  linkedin_url: z
    .string()
    .url("Must be a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  whatsapp_number: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
