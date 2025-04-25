import { PROCESS_VIDEO_QUEUE } from "@server/queues/queue-names";
import { generateKeywords } from "@server/services/ai";
import { Worker } from "bullmq";
import { serverLogger } from "@server/lib/configs/logger";
import { addBroll } from "@server/services/ffmpeg";
import { ProcessNewVideoData } from "@server/queues/types";
import { pexelsClient } from "@server/services/pexels";
import axios from "axios";
import fs from "fs";

// Convert SRT timestamp to seconds
function srtTimestampToSeconds(timestamp: string): number {
  const [hourMinSec, ms] = timestamp.split(',');
  const [hours, minutes, seconds] = hourMinSec.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + parseInt(ms) / 1000;
}

// Download Pexels video to a temporary file
async function downloadPexelsVideo(url: string, outputPath: string): Promise<void> {
  try {
    const { data } = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(outputPath);
    data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    serverLogger.error('Failed to download Pexels video:', error);
    throw new Error(`Failed to download Pexels video: ${error instanceof Error ? error.message : error}`);
  }
}

const worker = new Worker<ProcessNewVideoData>(
  PROCESS_VIDEO_QUEUE,
  async ({ data: { submissionData, assetRepository } }) => {
    if (!submissionData.generateBroll) {
      return;
    }

    const srtTranscript = await assetRepository.readContent('srt_transcripts') as string;

    const keywords = await generateKeywords(srtTranscript);

    if (!keywords?.topics || keywords.topics.length === 0) {
      return;
    }

    // Get source video path
    const captionedVideoAsset = assetRepository.getAsset('captioned_videos');
    const optVideoAsset = assetRepository.getAsset('optimized_videos');
    const sourceVideoPath = captionedVideoAsset?.path || optVideoAsset?.path;

    if (!sourceVideoPath) {
      throw new Error('Source video asset not found');
    }

    let currentVideoPath = sourceVideoPath;
    const tempFiles: string[] = []; // Track all temporary files

    try {
      // Process each topic and overlay related B-roll footage
      for (const topic of keywords.topics) {
        const startSeconds = srtTimestampToSeconds(topic.start);
        const endSeconds = srtTimestampToSeconds(topic.end);
        const segmentDuration = endSeconds - startSeconds;

        if (segmentDuration <= 0) continue;

        serverLogger.info(`Processing B-roll for topic: ${topic.title}, duration: ${segmentDuration}s`);

        // Combine keywords for search
        const combinedKeywords = Object.values(topic.keywords)
          .flat()
          .join(',');

        // Search for videos
        const pexelsSearchResults = await pexelsClient.videos.search({
          query: combinedKeywords,
          orientation: 'landscape',
          size: 'medium',
          per_page: 5
        });

        if ("error" in pexelsSearchResults || !pexelsSearchResults?.videos?.length) {
          serverLogger.warn(`No videos found for topic: ${topic.title}`);
          continue;
        }

        // Filter suitable videos
        const suitableVideo = pexelsSearchResults.videos
          .filter(video => {
            const videoFiles = video.video_files.filter(file =>
              ['hd', 'sd'].includes(file.quality.toLowerCase()));
            return videoFiles.length > 0 && video.duration >= segmentDuration;
          })[0];

        if (!suitableVideo) {
          serverLogger.warn(`No suitable videos found for topic: ${topic.title}`);
          continue;
        }

        // Get best quality video file
        const videoFile = suitableVideo.video_files
          .filter(file => ['hd', 'sd'].includes(file.quality.toLowerCase()))
          .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];

        if (!videoFile) {
          serverLogger.warn(`No suitable video file found for video ID: ${suitableVideo.id}`);
          continue;
        }

        // Create temporary b-roll video assets
        const brVideoFile = await assetRepository.createAsset(
          'broll',
          `br-video-${suitableVideo.id}.${videoFile.file_type.split('/')[1]}`
        );
        tempFiles.push(brVideoFile);

        const brOutputFile = await assetRepository.createAsset(
          'broll',
          `br-video-${suitableVideo.id}.mp4`
        );
        tempFiles.push(brOutputFile);

        // Download and process b-roll
        await downloadPexelsVideo(videoFile.link, brVideoFile);
        await addBroll(startSeconds, endSeconds, {
          inputPath: currentVideoPath,
          outputPath: brOutputFile,
          brollPath: brVideoFile,
        });

        if (currentVideoPath !== sourceVideoPath) {
          tempFiles.push(currentVideoPath);
        }
        currentVideoPath = brOutputFile;
      }
    } finally {
      // Cleanup all temporary files at once
      for (const file of tempFiles) {
        try {
          await assetRepository.removeAsset('broll');
        } catch (err) {
          serverLogger.warn(`Failed to cleanup temporary file ${file}:`, err);
        }
      }
    }

    return;
  }
);

export default worker;

