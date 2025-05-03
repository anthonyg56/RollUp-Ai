import { serverLogger } from "@server/lib/configs/logger";
import { JobProgress, QueueEvents } from "bullmq";
import { SSEStreamingApi } from "hono/streaming";

export interface QEListenerArgs {
  jobId: string;
  data: JobProgress;
  returnvalue: string;
  failedReason: string;
  prev?: string;
};

export interface QEListeners {
  activeListener: (args: Pick<QEListenerArgs, 'jobId' | 'prev'>, id: string) => void;
  progressListener: (args: Pick<QEListenerArgs, 'jobId' | 'data'>, jobId: string) => void;
  completedListener: (args: Pick<QEListenerArgs, 'jobId' | 'returnvalue'>, jobId: string) => void;
  failedListener: (args: Pick<QEListenerArgs, 'jobId' | 'failedReason' | 'prev'>, id: string) => void;
  errorListener: (error: Error) => void;
};

export type QEListenersRecord = Partial<{
  [key in keyof QEListeners]: QEListeners[key];
}>;

export interface QEListenerOptions {
  jobId: string;
  flowJobId: string;

  data?: any;
  customListeners?: QEListenersRecord;
};

export class QEListener {
  private readonly listeners: Array<() => void> = [];

  constructor(
    private readonly stream: SSEStreamingApi,
    private readonly queueEvents: QueueEvents,
    private readonly options: QEListenerOptions,
  ) {
    this.startListening();

    this.stream.onAbort(() => {
      serverLogger.info(`SSE connection aborted for Flow Job ID: ${this.options.flowJobId}`);
      this.stopListening();
    })
  };

  private startListening() {
    this.queueEvents.on('active', this.activeListener);
    this.queueEvents.on('progress', this.progressListener);
    this.queueEvents.on('completed', this.completedListener);
    this.queueEvents.on('failed', this.failedListener);
    this.queueEvents.on('error', this.errorListener);

    serverLogger.info(`All listeners started for Flow Job ID: ${this.options.flowJobId}`);

    const tempListeners = [
      () => this.queueEvents.off('progress', this.progressListener),
      () => this.queueEvents.off('completed', this.completedListener),
      () => this.queueEvents.off('failed', this.failedListener),
      () => this.queueEvents.off('error', this.errorListener),
      () => this.queueEvents.off('active', this.activeListener),
    ];

    tempListeners.forEach(tempListener => this.listeners.push(tempListener));
  };

  sendEvent(event: string, data: { [key: string]: any }) {
    this.stream.writeSSE({ event, data: JSON.stringify(data) });
    serverLogger.info(`SSE [${this.options.flowJobId}] Sent ${event}:`, data);
  }

  stopListening() {
    this.listeners.forEach(remove => remove());
  };

  progressListener(args: Pick<QEListenerArgs, 'jobId' | 'data'>, id: string) {
    if (this.options.customListeners?.progressListener) {
      this.options.customListeners.progressListener(args, id);
    }

    this.sendEvent('progress', { jobId: args.jobId, progressData: args.data });
  }

  completedListener(args: Pick<QEListenerArgs, 'jobId' | 'returnvalue'>, jobId: string) {
    if (this.options.customListeners?.completedListener) {
      this.options.customListeners.completedListener(args, jobId);
    }

    this.sendEvent('completed', { jobId: args.jobId, returnvalue: args.returnvalue });
  }

  failedListener(args: Pick<QEListenerArgs, 'jobId' | 'failedReason' | 'prev'>, id: string) {
    if (this.options.customListeners?.failedListener) {
      this.options.customListeners.failedListener(args, id);
    }

    this.sendEvent('failed', { jobId: args.jobId, reason: args.failedReason });
  }

  errorListener(error: Error) {
    if (this.options.customListeners?.errorListener) {
      this.options.customListeners.errorListener(error);
    }

    this.sendEvent('error', { message: error.message });
  }

  activeListener(args: Pick<QEListenerArgs, 'jobId' | 'prev'>, id: string) {
    if (this.options.customListeners?.activeListener) {
      this.options.customListeners.activeListener(args, id);
    }

    this.sendEvent('active', { jobId: args.jobId, prev: args.prev });
  }
}