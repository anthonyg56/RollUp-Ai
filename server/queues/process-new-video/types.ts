import { AssetsRepository, AssetsRecord } from "@server/services/assetRepository.service";

export type ProcessVideoSteps = 'Process Video' | 'Process Audio' | 'Process Broll' | 'Finalize Video';

export type CreateProcessVideoData = Omit<ProcessNewVideoData, 'step' | 'assets' | 'assetRepository' | 'repositoryPath'>

export interface ProcessNewVideoData {
  userId: string;
  step: ProcessVideoSteps;
  submissionData: {
    id: string;
    generateCaptions: boolean;
    generateBroll: boolean;
  };
  message?: string;
  assets?: AssetsRecord;
  assetRepository: AssetsRepository;
};

export interface RollupQueueErrorData {
  queueDir: string;
  videoAssetId: string;
};

export class RollupQueueError extends Error {
  protected queueName: string;
  readonly data: RollupQueueErrorData;

  constructor(message: string, queueName: string, data: RollupQueueErrorData) {
    super(message);
    this.name = 'RollupQueueError';
    this.data = data;
    this.queueName = queueName;
  }
};