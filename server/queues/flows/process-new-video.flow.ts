import { FlowProducer } from "bullmq";
import {
  PROCESS_AUDIO_JOB,
  FINALIZE_VIDEO_JOB,
  PROCESS_VIDEO_QUEUE,
  PROCESS_VIDEO_JOB,
  PROCESS_BROLL_JOB,
} from "../queue-names";
import { AssetsRecord, AssetsRepository } from "@server/services/db/AssetRepository.service";

import RootFileService from "@server/services/FileIO.service";
import { CreateProcessVideoData } from "@server/queues/types";
import createRedisConn from "../create-redis-conn";

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
    name: PROCESS_VIDEO_JOB,
    data: {
      ...data,
      assetRepository,
      step: 'Process Video',
    },
    queueName: PROCESS_VIDEO_QUEUE,
    children: [
      {
        name: PROCESS_BROLL_JOB,
        queueName: PROCESS_VIDEO_QUEUE,
        data: {
          ...data,
          assetRepository,
          step: 'Process B Roll',
        },
        children: [
          {
            name: PROCESS_AUDIO_JOB,
            queueName: PROCESS_VIDEO_QUEUE,
            data: {
              ...data,
              assetRepository,
              step: 'Process Audio',
            },
            children: [
              {
                name: FINALIZE_VIDEO_JOB,
                queueName: PROCESS_VIDEO_QUEUE,
                data: {
                  ...data,
                  assetRepository,
                  step: 'Finalize Video',
                },
              }
            ]
          }
        ]
      }
    ]
  });

  return flow.job.id;
}