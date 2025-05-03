import { FlowProducer } from "bullmq";
import { AssetsRepository } from "@server/services/assetRepository.service";

import RootFileService from "@server/services/FileIO.service";
import { CreateProcessVideoData } from "@server/queues/process-new-video/types";
import createRedisConn from "../reddis_connection";
import { PROCESS_AUDIO_QUEUE, PROCESS_BROLL_QUEUE, PROCESS_VIDEO_QUEUE, VIDEO_SETUP_QUEUE, FINALIZE_VIDEO_QUEUE, FINALIZE_VIDEO_STEP, PROCESS_VIDEO_STEP, GENERATE_CAPTIONS_STEP, GENERATE_BROLL_STEP, SETUP_ASSETS_STEP } from "@server/queues/process-new-video/queue-names";

const redisConnection = createRedisConn('Flow Job');

const flowProducer = new FlowProducer({
  connection: redisConnection,
});

export default async function processNewVideoFlow(data: CreateProcessVideoData) {
  const { id } = data.submissionData;
  const repositoryPath = `/submission-assets-${id}`;

  RootFileService.inializeRepository(repositoryPath);

  const assetRepository = new AssetsRepository(repositoryPath, RootFileService);

  const flow = await flowProducer.add({
    name: PROCESS_VIDEO_STEP,
    data: {
      ...data,
      assetRepository,
      step: PROCESS_VIDEO_STEP,
    },
    queueName: PROCESS_VIDEO_QUEUE,
    children: [
      { name: SETUP_ASSETS_STEP, queueName: VIDEO_SETUP_QUEUE, data: { ...data, assetRepository, step: SETUP_ASSETS_STEP } },
      { name: GENERATE_BROLL_STEP, queueName: PROCESS_BROLL_QUEUE, data: { ...data, assetRepository, step: GENERATE_BROLL_STEP } },
      { name: GENERATE_CAPTIONS_STEP, queueName: PROCESS_AUDIO_QUEUE, data: { ...data, assetRepository, step: GENERATE_CAPTIONS_STEP } },
      { name: FINALIZE_VIDEO_STEP, queueName: FINALIZE_VIDEO_QUEUE, data: { ...data, assetRepository, step: FINALIZE_VIDEO_STEP } },
    ]
  });

  return flow.job.id;
}