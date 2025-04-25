import { AssetsRepository, AssetsRecord } from "@server/services/db/AssetRepository.service";

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
  assets?: AssetsRecord;
  assetRepository: AssetsRepository;
};
