// Flows
export const PROCESS_VIDEO_FLOW = 'process_video_flow';

// Queues
export const PROCESS_VIDEO_QUEUE = 'process_video_queue';
export const VIDEO_SETUP_QUEUE = 'video_setup_queue';
export const PROCESS_BROLL_QUEUE = 'process_broll_queue';
export const PROCESS_AUDIO_QUEUE = 'process_audio_queue';
export const FINALIZE_VIDEO_QUEUE = 'finalize_video_queue';

// Jobs
export const PROCESS_VIDEO_JOB = 'process_video';
export const PROCESS_AUDIO_JOB = 'process_audio';
export const PROCESS_BROLL_JOB = 'process_broll';
export const FINALIZE_VIDEO_JOB = 'finalize_video';

export const PROCESS_VIDEO_QUEUE_NAMES = [
  PROCESS_VIDEO_QUEUE,
  VIDEO_SETUP_QUEUE,
  PROCESS_BROLL_QUEUE,
  PROCESS_AUDIO_QUEUE,
  FINALIZE_VIDEO_QUEUE,
] as const;
export type ProcessVideoQueueName = (typeof PROCESS_VIDEO_QUEUE_NAMES)[number];

export const SETUP_ASSETS_STEP = 'setup';
export const GENERATE_BROLL_STEP = 'broll';
export const GENERATE_CAPTIONS_STEP = 'captions';
export const FINALIZE_VIDEO_STEP = 'finalize';
export const PROCESS_VIDEO_STEP = 'process';

export const PROCESS_VIDEO_STEPS = [
  SETUP_ASSETS_STEP,
  GENERATE_BROLL_STEP,
  GENERATE_CAPTIONS_STEP,
  FINALIZE_VIDEO_STEP,
  PROCESS_VIDEO_STEP,
] as const;
export type ProcessVideoStep = (typeof PROCESS_VIDEO_STEPS)[number];
