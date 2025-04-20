import { IVideoFlowInput } from "./flows/video-processing.flow";


// Data specific to PROCESS_VIDEO job (often same as flow input)
export interface IProcessVideoData extends IVideoFlowInput { }

// Data specific to GENERATE_CAPTIONS job
// Might receive processed video path or ID from the previous step,
// or just use the initial data to look things up.
export interface IGenerateCaptionsData extends Omit<IVideoFlowInput, "videoId"> {
  processedFilePath?: string; // Example: path to temp file after step 1
  videoId?: string; // Example: ID of the video record created in step 1
}

// Data for GENERATE_BROLL
export interface IGenerateBrollData extends IGenerateCaptionsData {
  keywords?: string[]; // Example: keywords generated in step 2
}

// Data for PREPARE_CLIENT
export interface IPrepareClientData extends IGenerateBrollData {
  brollVideoPath?: string; // Example: path after adding b-roll in step 3
}


// --- Job Return Value Interfaces (Optional but good practice) ---
export interface IProcessVideoResult {
  processedFilePath: string;
  videoId: string; // ID of the record created in DB
  metadata: object;
  thumbnailPath: string;
}

export interface IGenerateCaptionsResult {
  srtPath: string;
  transcriptSegmentIds: string[];
  keywords: string[];
}