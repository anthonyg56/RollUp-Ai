import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, OTP_TYPES, SURVEY_INDUSTRIES, SURVEY_REFERRAL_SOURCES } from "@/lib/constants";

export const uuidSchema = z.string().uuid();

export const otpSchema = z.string().min(6).max(6);

export const otpTypeSchema = z.enum(OTP_TYPES);

export const surveyReferralSourceSchema = z.enum(SURVEY_REFERRAL_SOURCES);
export const surveyIndustrySchema = z.enum(SURVEY_INDUSTRIES);

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

export const fileListSchema = z
  .instanceof(FileList)
  .refine((file) => file.length === 1, {
    message: "Too many files: Only one is allowed",
  })
  .refine(file => file[0].type.startsWith("video/"), {
    message: "Invalid file type: must be a video",
  })
  .refine((file) => file[0].size < 100 * 1024 * 1024, {
    message: "File too large: must be less than 100MB",
  })

export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size < 100 * 1024 * 1024, {
    message: "File too large: must be less than 100MB",
  })
  .refine((file) => file.type.startsWith("video/"), {
    message: "Invalid file type: must be a video",
  });




