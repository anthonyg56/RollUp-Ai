import { PROCESS_VIDEO_QUEUE } from "@server/queues/queue-names";
import { Worker } from "bullmq";
import { extractAudio, extractVideoMetadata, generateThumbnail, optimizeVideo } from "@server/services/ffmpeg";
import { getAssetById } from "@server/services/db/assets.services";
import { writeR2ObjToFile } from "@server/services/r2";
import { generateTranscripts } from "@server/services/ai";
import { ProcessNewVideoData } from "@server/queues/types";

const processVideoWorker = new Worker<ProcessNewVideoData>(
  PROCESS_VIDEO_QUEUE,
  async ({ data: { submissionData, assetRepository } }) => {
    const tempFiles: string[] = [];
    const videoAsset = await getAssetById(submissionData.id);

    try {
      assetRepository.addAssetId('original_videos', videoAsset.id);

      const [
        videoFile,
        optVideoFile,
        thumbnailPath,
        audioFile,
        srtTranscriptFile,
        plainTranscriptFile
      ] = await Promise.all([
        assetRepository.createAsset('original_videos', `input-${videoAsset.id}.mp4`),
        assetRepository.createAsset('optimized_videos', `output-${videoAsset.id}.mp4`),
        assetRepository.createAssetPath('thumbnail'),
        assetRepository.createAsset('audio', `output-${videoAsset.id}.mp3`),
        assetRepository.createAsset('srt_transcripts', `output-${videoAsset.id}.srt`),
        assetRepository.createAsset('plain_transcripts', `output-${videoAsset.id}.txt`),
      ]);

      tempFiles.push(videoFile, optVideoFile, audioFile);

      await writeR2ObjToFile(videoAsset.r2Key, "original_videos", videoFile);
      await optimizeVideo(videoFile, optVideoFile);
      await extractAudio(optVideoFile, audioFile);

      const [srtTranscript, plainTranscript] = await Promise.all([
        generateTranscripts(audioFile, 'srt'),
        generateTranscripts(audioFile, 'text')
      ]);

      await Promise.all([
        assetRepository.writeContent(srtTranscriptFile, srtTranscript),
        assetRepository.writeContent(plainTranscriptFile, plainTranscript)
      ]);

      const optVideoMetadata = await extractVideoMetadata(optVideoFile);
      const videoDimensions = `${optVideoMetadata.width}x${optVideoMetadata.height}`;
      await generateThumbnail(optVideoFile, thumbnailPath, `output-${videoAsset.id}.png`, videoDimensions);

      return
    } catch (error) {
      await Promise.allSettled(
        tempFiles.map(async (filePath) => {
          const assetKey = assetRepository.getAssetKeyByPath(filePath);

          await assetRepository.removeAsset(assetKey).catch(err =>
            console.error(`Failed to cleanup temporary file ${filePath}:`, err)
          )
        })
      );
      throw error;
    }
  });

export { processVideoWorker };