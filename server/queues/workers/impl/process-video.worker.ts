import { PROCESS_VIDEO_QUEUE } from "@server/queues/config/queue-names";
import { Worker, Job } from "bullmq";
import { IProcessVideoData, IProcessVideoResults } from "@server/queues/queues/process-video.queue";
import { extractVideoMetadata, generateThumbnail, optimizeVideo } from "@server/services/ffmpeg";
import { getVideoAssetById, uploadAsset } from "@server/services/db/assets.services";
import redisConnection from "@server/queues/config/redis-connection";
import { uploadThumnail } from "@server/services/db/video_thumbnail.services";

const worker = new Worker<IProcessVideoData, IProcessVideoResults>(
  PROCESS_VIDEO_QUEUE,
  async function ({ data }) {
    const { submissionInfo, userId } = data;

    const originalVideoAsset = await getVideoAssetById(submissionInfo.videoSubmissionId);

    const optimizedVideoPath = await optimizeVideo(originalVideoAsset.r2Key);

    const {
      id: optimizedVideoAssetId,
      r2Key: optimizedVideoAssetR2Key,
    } = await uploadAsset({
      userId,
      path: optimizedVideoPath,
      videoSubmissionId: originalVideoAsset.videoSubmissionId,
      bucketName: "optimized_videos",
      unlinkPath: false,
    });

    const optimizedVideoMetadata = await extractVideoMetadata(optimizedVideoAssetR2Key, optimizedVideoAssetId);

    const thumbnailPath = await generateThumbnail(optimizedVideoPath, optimizedVideoMetadata.resolution ?? undefined);

    await uploadThumnail(thumbnailPath, originalVideoAsset.id);

    return {
      originalVideoAsset,
      optimizedVideoAssetId,
      optimizedVideoPath,
    };
  }, {
  connection: redisConnection,
  autorun: true,
});
