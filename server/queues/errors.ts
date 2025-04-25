export interface RollupQueueErrorData {
  queueDir: string;
  videoAssetId: string;
};

export class RollupQueueError extends Error {
  readonly data: RollupQueueErrorData;

  constructor(message: string, data: RollupQueueErrorData) {
    super(message);
    this.name = 'RollupQueueError';
    this.data = data;
  }
}

export class ProcessVideoError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, data);
    this.name = 'ProcessVideoError';
  }
}

export class ProcessAudioError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, data);
    this.name = 'ProcessAudioError';
  }
}

export class ProcessBrollError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, data);
    this.name = 'ProcessBrollError';
  }
}

export class FinalizeVideoError extends RollupQueueError {
  constructor(message: string, data: RollupQueueErrorData) {
    super(message, data);
    this.name = 'FinalizeVideoError';
  }
}

