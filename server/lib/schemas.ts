import { z } from "zod";
import {
  FEEDBACK_RATINGS,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  OTP_TYPES,
  PROVIDERS,
  SRC_ENUMS,
} from "@server/lib/constants";

// Schemas for strings
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

export const passwordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must be at most ${MAX_PASSWORD_LENGTH} characters`
  )
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number"
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    "Password must contain at least one special character"
  );

export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(50, "Slug must be less than 50 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens"
  );

export const uuidSchema = z.string().uuid();

export const urlSchema = z.string().url().startsWith("https://");

export const otpSchema = z
  .string()
  .length(6)
  .min(6, "OTP must be 6 digits")
  .max(6, "OTP must be 6 digits");

// Schemas for constants
export const otpTypeSchema = z.enum(OTP_TYPES);

export const providerSchema = z.enum(PROVIDERS);

export const srcEnumsSchema = z.enum(SRC_ENUMS);

export const ratingSchema = z.enum(FEEDBACK_RATINGS).nullable();

// Schemas for objects
export const resendOTPSchema = z.object({
  email: emailSchema,
  type: otpTypeSchema,
});

export const blobSchema = z.object({
  url: z.string(),
  downloadUrl: z.string(),
  pathname: z.string(),
  contentType: z.string(),
  contentDisposition: z.string(),
});

export const videoFileSchema = z
  .instanceof(File)
  .refine((file) => file.size < 100 * 1024 * 1024, {
    message: "File too large: must be less than 100MB",
  })
  .refine((file) => file.type.startsWith("video/"), {
    message: "Invalid file type: must be a video",
  });

export const baseIdParamsSchema = z.object({
  id: uuidSchema,
});

export const baseEmailParamsSchema = z.object({
  email: emailSchema,
});

export const basePageLimitSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});
