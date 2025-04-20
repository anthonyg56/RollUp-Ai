import { FlowProducer } from "bullmq";
import redisConnection from "../config/redis-connection";
import {
  PROCESS_AUDIO_JOB,
  FINALIZE_VIDEO_JOB,
  PROCESS_VIDEO_QUEUE,
  PROCESS_AUDIO_QUEUE,
  PROCESS_BROLL_QUEUE,
  FINALIZE_VIDEO_QUEUE,
  PROCESS_VIDEO_JOB,
  PROCESS_BROLL_JOB,
} from "../config/queue-names";

export type IVideoFlowStep = 'Process Video' | 'Process Audio' | 'Process Broll' | 'Finalize Video';

export interface IVideoFlowInput {
  userId: string;
  step: IVideoFlowStep;
  submissionInfo: {
    videoSubmissionId: string;
    generateCaptions: boolean;
    generateBroll: boolean;
  }
};

const flowProducer = new FlowProducer({
  connection: redisConnection,
});

export default async function createVideoProcessingFlow(data: Omit<IVideoFlowInput, 'step'>) {
  const flow = await flowProducer.add({
    name: PROCESS_VIDEO_JOB,
    data: {
      ...data,
      step: 'Process Video',
    },
    queueName: PROCESS_VIDEO_QUEUE,
    children: [
      {
        name: PROCESS_AUDIO_JOB,
        queueName: PROCESS_AUDIO_QUEUE,
        data: {
          ...data,
          step: 'Process Audio',
        },
        children: [
          {
            name: PROCESS_BROLL_JOB,
            queueName: PROCESS_BROLL_QUEUE,
            data: {
              ...data,
              step: 'Process Broll',
            },
            children: [
              {
                name: FINALIZE_VIDEO_JOB,
                queueName: FINALIZE_VIDEO_QUEUE,
                data: {
                  ...data,
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