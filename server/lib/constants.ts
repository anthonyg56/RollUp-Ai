// Environment variables
export const APP_PORT = process.env.PORT || 3000;
export const APP_HOSTNAME = process.env.HOSTNAME || 'localhost';
export const IS_PROD = process.env.NODE_ENV === "production";
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Static
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 50;

// Dynamic
export const CLIENT_DIR = IS_PROD ? "dist" : "src";
export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://rollup-ai.dev"
    : "http://localhost:3000";
export const IS_SERVER = typeof document === "undefined";

// Enums
export const FEEDBACK_RATINGS = ["bad", "decent", "love"] as const;
export type FeedbackRating = (typeof FEEDBACK_RATINGS)[number];

export const PROVIDERS = ["google", "twitter"] as const;
export type Provider = (typeof PROVIDERS)[number];

export const SURVEY_REFERRAL_SOURCES = [
  "search_engine",
  "social_media",
  "friend_or_colleague",
  "advertisement",
  "blog_or_article",
  "event_or_conference",
  "other",
] as const;
export type SurveyReferralSource = (typeof SURVEY_REFERRAL_SOURCES)[number];

export const SURVEY_INDUSTRIES = [
  "technology",
  "finance",
  "healthcare",
  "education",
  "retail",
  "manufacturing",
  "media_entertainment",
  "government",
  "non_profit",
  "other",
] as const;
export type SurveyIndustry = (typeof SURVEY_INDUSTRIES)[number];

export const OTP_TYPES = [
  "email-verification",
  "forget-password",
  "sign-in",
] as const;
export type OTPType = (typeof OTP_TYPES)[number];

export const SRC_ENUMS = [
  "Dashboard",
  "Discovery",
  "Video Library",
  "Video Editor",
  "Analytics",
  "Settings",
  "Other",
] as const;
export type SrcEnum = (typeof SRC_ENUMS)[number];

export const VIDEO_CATEGORIES = [
  "Marketing",
  "Travel",
  "Technology",
  "Cooking",
  "Fitness",
  "Photography",
  "Development",
  "Education",
  "Other",
] as const;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];

export const JOB_PROCESSING_STATUS = [
  "active",
  "added",
  "completed",
  "debounced",
  "delayed",
  "drained",
  "error",
  "failed",
  "paused",
  "progress",
  "removed",
  "stalled",
  "waiting",
  "resumed",
  "retries-exhausted",
  "stalled",
  "waiting-children",
] as const;
export type JobProcessingStatus = (typeof JOB_PROCESSING_STATUS)[number];

export const ASSET_BUCKETS = [
  "original_videos",
  "optimized_videos",
  "captioned_videos",
  "srt_transcripts",
  "plain_transcript",
] as const;
export type AssetBucket = (typeof ASSET_BUCKETS)[number];

export const ASSET_TYPES = [
  "original_video",
  "optimized_video",
  "captioned_video",
  "srt_transcript",
  "plain_transcript",
  "generated_video",
  "tech_metadata",
  "thumbnail",
  "broll",
  "audio",
  "keyword_extraction",
] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const PROCESS_VIDEO_STEPS = [
  "Setup Assets",
  "Generate Broll",
  "Generate Captions",
  "Finalize Video",
] as const;
export type ProcessVideoStep = (typeof PROCESS_VIDEO_STEPS)[number];

export const TRANSCRIPTION_SOURCES = ["whisper", "manual", "imported"] as const;
export type TranscriptionSource = (typeof TRANSCRIPTION_SOURCES)[number];

export const TRANSCRIPTION_FORMATS = ["plain", "srt", "vtt"] as const;
export type TranscriptionFormat = (typeof TRANSCRIPTION_FORMATS)[number];
