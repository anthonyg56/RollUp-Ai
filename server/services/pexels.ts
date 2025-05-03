import { createClient } from "pexels";
import { KeywordsResponse } from "./ai";
import { serverLogger } from "@server/lib/configs/logger";
import { basename, join } from "path";
import { resolve } from "path";
import { tmpdir } from "os";
import { mkdir } from "fs/promises";
import { createWriteStream, existsSync } from "fs";
import { createDir } from "./FileIO.service";
import axios from "axios";

const apiKey = process.env.PEXELS_API_KEY;

if (!apiKey) {
  throw new Error("PEXELS_API_KEY is not set");
}

export const pexelsClient = createClient(apiKey);

export const getPexelsVideo = async (query: string, perPage = 5) => {
  const results = await pexelsClient.videos.search({ query, per_page: perPage });

  if ("error" in results) {
    return null;
  } else if (!results?.videos?.length) {
    return null;
  }

  return results.videos;
}

function srtTimestampToSeconds(timestamp: string): number {
  const [hourMinSec, ms] = timestamp.split(',');
  const [hours, minutes, seconds] = hourMinSec.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + parseInt(ms) / 1000;
}

export async function fetchBrollClip(topic: KeywordsResponse["topics"][number]) {
  const startSeconds = srtTimestampToSeconds(topic.start);
  const endSeconds = srtTimestampToSeconds(topic.end);
  const segmentDuration = endSeconds - startSeconds;

  if (segmentDuration <= 0) {
    serverLogger.warn(`Invalid segment duration for topic: ${topic.title}`);
    return null;
  }

  serverLogger.info(`Processing B-roll for topic: ${topic.title}, duration: ${segmentDuration}s`);

  const combinedKeywords = Object.values(topic.keywords)
    .flat()
    .join(',');

  const pexelsSearchResults = await pexelsClient.videos.search({
    query: combinedKeywords,
    orientation: 'landscape',
    size: 'medium',
    per_page: 5
  });

  if ("error" in pexelsSearchResults || !pexelsSearchResults?.videos?.length) {
    serverLogger.warn(`No videos found for topic: ${topic.title}`);
    return null;
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
    return null;
  }

  // Get best quality video file
  const videoFile = suitableVideo.video_files
    .filter(file => ['hd', 'sd'].includes(file.quality.toLowerCase()))
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];

  if (!videoFile) {
    serverLogger.warn(`No suitable video file found for video ID: ${suitableVideo.id}`);
    return null;
  }

  return {
    videoId: suitableVideo.id,
    videoUrl: videoFile.link,
    videoDuration: suitableVideo.duration,
    videoWidth: videoFile.width,
    videoHeight: videoFile.height,
    startSeconds,
    endSeconds,
    fileType: videoFile.file_type,
  }
};

async function downloadPexelsVideo(url: string, outputPath: string): Promise<void> {
  try {
    const { data } = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });

    const writer = createWriteStream(outputPath);
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

export type BrollInputFile = {
  source: string,
  timestamps: {
    duration: number,
    start: number,
    end: number,
  },
}

export async function fetchBrollClips(path: string, keywords: KeywordsResponse): Promise<BrollInputFile[]> {
  const resolvedVideosDir = await createDir(path);

  if (!resolvedVideosDir) {
    throw new Error('Failed to create directory');
  }

  let count = 0;
  let inputFiles: BrollInputFile[] = [];

  const totalTopics = keywords.topics.length;
  const progressPerTopic = (66 - 45) / totalTopics; // Distribute remaining progress across topics

  try {
    for (const topic of keywords.topics) {
      const brollClip = await fetchBrollClip(topic);

      if (!brollClip) {
        count++;
        continue;
      };

      const {
        videoId,
        videoUrl,
        videoDuration,
        startSeconds,
        endSeconds,
      } = brollClip;

      const tmpInput = join(resolvedVideosDir, `input-${videoId}.mp4`);

      await downloadPexelsVideo(videoUrl, tmpInput)
        .then(() => {
          inputFiles.push({
            source: tmpInput,
            timestamps: {
              duration: videoDuration,
              start: startSeconds,
              end: endSeconds,
            },
          });

          count++;
        });
    }
  } catch (error) {
    serverLogger.error(`Error saving Pexel videos: ${error}`);
    throw new Error(`Error saving Pexel videos: ${error}`);
  }

  if (inputFiles.length === 0) {
    throw new Error('No b-roll clips found');
  };

  return inputFiles;
}