import ffmpeg from 'fluent-ffmpeg';
import { unlink } from 'node:fs/promises';
import { createTmpPath } from '@server/services/fs-io';
import { pipeAssetToPath } from '@server/services/r2';
import { insertVideoMetadata } from '@server/services/db/video_metadata.services';
import { VideoTechnicalMetadata } from '@server/db/models';

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
export async function optimizeVideo(assetR2Key: string, options = optimizeVideoDefaultOptions) {
  const inputPath = await pipeAssetToPath(assetR2Key, "original_videos");
  const outputPath = await createTmpPath(`optimized_video/output-${Date.now()}.mp4`);

  return new Promise<string>((resolve, reject) => {
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
        await unlink(inputPath).catch(() => { });

        resolve(outputPath);
      })
      .on('error', async (err) => {
        await unlink(inputPath).catch(() => { });
        await unlink(outputPath).catch(() => { });

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
export async function extractVideoMetadata(assetR2Key: string, assetId: string) {
  const inputPath = await pipeAssetToPath(assetR2Key, "optimized_videos");

  return new Promise<VideoTechnicalMetadata>(async (resolve, reject) => {
    ffmpeg.ffprobe(inputPath, async (err, metadata) => {
      try {
        if (err) {
          throw err;
        }

        await unlink(inputPath).catch(() => { });

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

        const videoMetadata = await insertVideoMetadata({
          fps,
          assetId,
          aspectRatio,
          duration: metadata.format.duration ? parseFloat(metadata.format.duration.toString()) : 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          videoCodec: videoStream.codec_name || '',
          audioCodec: audioStream?.codec_name || null,
          bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate.toString()) : 0,
          audioChannels: audioStream?.channels || 0,
          audioSampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate.toString()) : 0,
        });

        resolve(videoMetadata);
      } catch (err) {
        await unlink(inputPath).catch(() => { });

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
export async function generateThumbnail(inputPath: string, size = '640x360') {
  const outputPath = await createTmpPath(`thumbnails`);

  return new Promise<string>((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['10%'],
        filename: `thumbnail-${Date.now()}.png`,
        size: size,
        folder: outputPath,
      })
      .on('end', async () => {
        await unlink(inputPath).catch(() => { });

        resolve(outputPath);
      })
      .on('error', async (err) => {
        await unlink(inputPath).catch(() => { });
        await unlink(outputPath).catch(() => { });

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
export async function extractAudio(inputPath: string) {
  const outputPath = await createTmpPath(`audio/output-${Date.now()}.mp3`);

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
        await unlink(outputPath).catch(() => { });

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
export async function burnCaptions(videoInputPath: string, srtTranscript: string, videoAssetId: string) {
  const srtPath = await createTmpPath(`srt/temp-${Date.now()}.srt`);
  await Bun.write(srtPath, srtTranscript);

  // Create output path
  const outputPath = await createTmpPath(`captioned_video/output-${videoAssetId}-${Date.now()}.mp4`);

  return new Promise<string>((resolve, reject) => {
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
        await unlink(srtPath).catch(() => { });

        resolve(outputPath);
      })
      .on('error', async (err) => {
        await unlink(srtPath).catch(() => { });
        await unlink(outputPath).catch(() => { });

        reject(err);
      })
      .run();
  });
}


