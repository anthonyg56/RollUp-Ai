import { FileRouteTypes } from "@/routeTree.gen";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 50;

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://rollup-ai.dev"
    : "http://localhost:3000";

export const PASSWORD_REQUIREMENTS = [
  "Must be at least 8 characters long",
  "Must contain at least one uppercase letter",
  "Must contain at least one lowercase letter",
  "Must contain at least one number",
  "Must contain at least one special character",
];

export const OTP_TYPES = ["email-verification", "forget-password", "sign-in"] as const;

export type OTPType = (typeof OTP_TYPES)[number];

export const ERROR_CODES = {
  EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  INVALID_PASSWORD: "INVALID_PASSWORD",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];



export const SURVEY_REFERRAL_SOURCES = [
  'search_engine',
  'social_media',
  'friend_or_colleague',
  'advertisement',
  'blog_or_article',
  'event_or_conference',
  'other'
] as const;
export const SURVEY_INDUSTRIES = [
  'technology',
  'finance',
  'healthcare',
  'education',
  'retail',
  'manufacturing',
  'media_entertainment',
  'government',
  'non_profit',
  'other'
] as const;

export const surveyIndustriesAnswers = [
  {
    label: "Technology",
    value: SURVEY_INDUSTRIES[0],
  },
  {
    label: "Finance",
    value: SURVEY_INDUSTRIES[1],
  },
  {
    label: "Healthcare",
    value: SURVEY_INDUSTRIES[2],
  },
  {
    label: "Education",
    value: SURVEY_INDUSTRIES[3],
  },
  {
    label: "Retail",
    value: SURVEY_INDUSTRIES[4],
  },
  {
    label: "Manufacturing",
    value: SURVEY_INDUSTRIES[5],
  },
  {
    label: "Media & Entertainment",
    value: SURVEY_INDUSTRIES[6],
  },
  {
    label: "Government",
    value: SURVEY_INDUSTRIES[7],
  },
  {
    label: "Non-profit",
    value: SURVEY_INDUSTRIES[8],
  },
  {
    label: "Other",
    value: SURVEY_INDUSTRIES[9],
  },
];

export const surveyReferralSourcesAnswers = [
  {
    label: "Search Engine",
    value: SURVEY_REFERRAL_SOURCES[0],
  },
  {
    label: "Social Media",
    value: SURVEY_REFERRAL_SOURCES[1],
  },
  {
    label: "Friend or Colleague",
    value: SURVEY_REFERRAL_SOURCES[2],
  },
  {
    label: "Advertisement",
    value: SURVEY_REFERRAL_SOURCES[3],
  },
  {
    label: "Blog or Article",
    value: SURVEY_REFERRAL_SOURCES[4],
  },
  {
    label: "Event or Conference",
    value: SURVEY_REFERRAL_SOURCES[5],
  },
  {
    label: "Other",
    value: SURVEY_REFERRAL_SOURCES[6],
  },
];

export const BASE_HEAD_TITLE = "Rollup AI |";

export const PROTECTED_ROUTES = [
  "/videos",
  "/survey",
  "/videos/$id",
  "/videos/$id/edit",
  "/videos/$id/process",
] as const satisfies readonly FileRouteTypes["fullPaths"][];

export const PUBLIC_ROUTES = [
  "/",
  "/privacy",
  "/terms",
] as const satisfies readonly FileRouteTypes["fullPaths"][];

export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot",
  "/reset",
  "/survey",
] as const satisfies readonly FileRouteTypes["fullPaths"][];

export type SurveyReferralSource = (typeof SURVEY_REFERRAL_SOURCES)[number];
export type SurveyIndustry = (typeof SURVEY_INDUSTRIES)[number];

export type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];
export type PublicRoute = (typeof PUBLIC_ROUTES)[number];
export type AuthRoute = (typeof AUTH_ROUTES)[number];

export type Route = ProtectedRoute | PublicRoute | AuthRoute;
