import { serverLogger } from '@server/lib/configs/logger';
import ffmpeg from 'fluent-ffmpeg';
import { unlink } from 'node:fs/promises';

const optimizeVideoDefaultOptions = {
  maxWidth: 1920,
  videoBitrate: '2000k',
  audioBitrate: '128k',
  format: 'mp4'
}

/**
 * Optimizes the original video asset for the web.
 * 
 * @param assetR2Key - The R2 key of the video asset to optimize
 * @param options - The options for the optimization
 * 
 * @returns The path to the optimized video asset
 */
export async function optimizeVideo(inputPath: string, outputPath: string, options = optimizeVideoDefaultOptions) {
  return new Promise<boolean>((resolve, reject) => {
    ffmpeg(inputPath)
      // Video settings
      .videoCodec('libx264')        // H.264 codec - great balance of quality/compression
      .addOptions([
        '-preset veryslow',         // Slower encoding = better compression
        '-crf 23',                  // Constant Rate Factor (18-28 is good, 23 is default)
        '-movflags +faststart',     // Enables fast web playback
        '-profile:v main',          // Wider device compatibility
        '-level 4.0',               // Compatibility level
        '-pix_fmt yuv420p'          // Standard pixel format for web
      ])
      .size(`?x${options.maxWidth}`)        // Resize maintaining aspect ratio
      .videoBitrate(options.videoBitrate)

      // Audio settings
      .audioCodec('aac')            // AAC codec - standard for web
      .audioBitrate(options.audioBitrate)
      .audioChannels(2)             // Stereo

      // Output settings
      .format(options.format)
      .output(outputPath)

      // Events
      .on('end', async () => {
        resolve(true);
      })
      .on('error', async (err) => {
        reject(err);
      })
      .run();
  });
}

/**
 * Extracts the technical metadata from the video asset.
 * 
 * @param assetR2Key - The R2 key of the video asset to extract the metadata from
 * @param assetId - The ID of the video asset
 * 
 * @returns The technical metadata of the video asset
 */
export async function extractVideoMetadata(inputPath: string) {
  return new Promise<{
    fps: number;
    aspectRatio: string;
    duration: number;
    width: number;
    height: number;
    videoCodec: string;
    audioCodec: string | null;
    bitrate: number;
    audioChannels: number;
    audioSampleRate: number;
  }>(async (resolve, reject) => {
    ffmpeg.ffprobe(inputPath, async (err, metadata) => {
      try {
        if (err) {
          throw err;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

        if (!videoStream) {
          throw new Error('No video stream found');
        }

        let aspectRatio = '';
        if (videoStream.width && videoStream.height) {
          const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
          const divisor = gcd(videoStream.width, videoStream.height);
          aspectRatio = `${videoStream.width / divisor}:${videoStream.height / divisor}`;
        }

        let fps = 0;
        if (videoStream.r_frame_rate) {
          const [numerator, denominator] = videoStream.r_frame_rate.split('/').map(Number);
          fps = denominator ? numerator / denominator : numerator;
        };

        const videoMetadata = {
          fps,
          aspectRatio,
          duration: metadata.format.duration ? parseFloat(metadata.format.duration.toString()) : 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          videoCodec: videoStream.codec_name || '',
          audioCodec: audioStream?.codec_name || null,
          bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate.toString()) : 0,
          audioChannels: audioStream?.channels || 0,
          audioSampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate.toString()) : 0,
        };

        resolve(videoMetadata);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Generates a thumbnail from the video asset.
 * 
 * @param inputPath - The path to the video asset
 * @param assetR2Key - The R2 key of the video asset to generate the thumbnail from
 * @param size - The size of the thumbnail
 * 
 * @returns The path to the thumbnail
 */
export async function generateThumbnail(inputPath: string, outputPath: string, filename: string, size = '640x360') {
  return new Promise<string>((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['10%'],
        filename: filename,
        size: size,
        folder: outputPath,
      })
      .on('end', async () => {
        resolve(outputPath);
      })
      .on('error', async (err) => {
        reject(err);
      })
      .run();
  });
};

/**
 * Generates a transcript from the video asset.
 * 
 * @param assetR2Key - The R2 key of the video asset to generate the transcript from
 * @param userId - The ID of the user
 * @param videoSubmissionId - The ID of the video submission
 * 
 * @returns The SRT and plain text transcripts
 */
export async function extractAudio(inputPath: string, outputPath: string) {
  return new Promise<string>(async (resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-y',
        '-vn',
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', async (err) => {
        reject(err);
      })
      .run()
  });
};

/**
 * Burns the captions into the video asset.
 * 
 * @param videoInputPath - The path to the video asset
 * @param srtTranscript - The SRT transcript to burn into the video asset
 * @param videoAssetId - The ID of the video asset
 * 
 * @returns The path to the captioned video asset
 */
export async function burnCaptions(videoInputPath: string, outputPath: string, srtPath: string) {
  return new Promise<boolean>((resolve, reject) => {
    ffmpeg(videoInputPath)
      .videoCodec('libx264')
      .addOptions([
        '-preset veryslow',
        '-crf 23',
        '-movflags +faststart',
        '-profile:v main',
        '-level 4.0',
        '-pix_fmt yuv420p',
        `-vf subtitles=${srtPath}:force_style='Fontname=Arial,FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,BorderStyle=3,Outline=1'`
      ])
      .audioCodec('copy')
      .output(outputPath)
      .on('end', async () => {
        resolve(true);
      })
      .on('error', async (err) => {
        reject(true);
      })
      .run();
  });
}

export async function addBroll(
  startSeconds: number,
  endSeconds: number,
  paths: {
    inputPath: string,
    outputPath: string,
    brollPath: string
  },
) {
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(paths.inputPath)
      .input(paths.brollPath)
      .complexFilter([
        `[1:v]scale=640:360[overlay]`,
        `[0:v][overlay]overlay=main_w-overlay_w-10:main_h-overlay_h-10:enable='between(t,${startSeconds},${endSeconds})'[outv]`
      ])
      .map('[outv]')
      .outputOptions('-c:a copy')
      .save(paths.outputPath)
      .on('end', () => {
        serverLogger.info(`Successfully added B-roll`);
        resolve();
      })
      .on('error', (err) => {
        serverLogger.error(`Error adding B-roll: ${err.message}`);
        reject(new Error(`FFmpeg processing failed: ${err.message}`));
      });
  });
}