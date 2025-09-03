import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(32, "Password must be less than 32 characters"),
    role: z.enum(["USER", "OWNER"], { message: "Please select a role" }),
    image: z.string().url().optional(),
    businessName: z.string().optional(),
    ownerAddress: z.string().optional(),
    phone: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role === "OWNER") {
      if (!val.businessName || val.businessName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Business name is required",
          path: ["businessName"],
        });
      }
      if (!val.ownerAddress || val.ownerAddress.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Business address is required",
          path: ["ownerAddress"],
        });
      }
      if (!val.phone || val.phone.trim().length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone is required",
          path: ["phone"],
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const VenueSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  country: z.string().default("India").optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()),
  photos: z.array(z.string().url()),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const courtSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    sport: z.string().min(2, "Sport is required"),
    pricePerHour: z.coerce.number().int().min(0, "Price must be >= 0"),
    currency: z.string().min(1, "Currency is required").default("INR"),
    openTime: z.coerce.number().int().min(0).max(23),
    closeTime: z.coerce.number().int().min(0).max(23),
    image: z.string().url("Invalid image URL").optional(),
  })
  .refine((v) => v.openTime < v.closeTime, {
    message: "Open time must be earlier than close time",
    path: ["closeTime"],
  });

export type SignupSchema = z.infer<typeof signupSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type VenueFormValues = z.infer<typeof VenueSchema>;
export type CourtFormValues = z.infer<typeof courtSchema>;
