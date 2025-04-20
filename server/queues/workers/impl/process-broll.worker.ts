import { PROCESS_BROLL_QUEUE } from "@server/queues/config/queue-names";
import { IProcessBrollResult, IProcessBrollData } from "@server/queues/queues/process-broll.queue";
import { generateKeywords } from "@server/services/ai";
import { Worker } from "bullmq";

const worker = new Worker<IProcessBrollData, IProcessBrollResult>(PROCESS_BROLL_QUEUE, async (job) => {
  const { userId, submissionInfo } = job.data;
  const { generateBroll } = submissionInfo;

  if (!generateBroll) {
    return {
      ...job.returnvalue,
      transcriptAnalysis: null,
    };
  }

  const { srtTranscript } = job.returnvalue;

  if (!srtTranscript) {
    throw new Error("SRT transcript not found");
  }

  const transcriptAnalysis = await generateKeywords(srtTranscript);

  return {
    ...job.returnvalue,
    transcriptAnalysis,
  };
});

