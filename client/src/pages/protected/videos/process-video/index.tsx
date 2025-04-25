import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useNavigate } from "@tanstack/react-router"

import { CheckCircle2 } from "lucide-react"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Route as ProcessVideoRoute } from "@/routes/_protected/_protected.videos.$id.process";
import { api } from "@/lib/utils"
import { useMutation } from "@tanstack/react-query"

type PageStatus = "pending" | "processing" | "completed" | "error";
type PageStep = "video" | "captions" | "broll" | "finalize";
type PageName = "Processing Video" | "Processing Audio" | "Processing Broll" | "Finalizing";

interface ProcessingProgress {
  total: number;
  current: number;
  percentage: number;
};

interface ProcessingStep {
  id: PageStep;
  name: PageName;
  status: PageStatus;
  errorMessage?: string;
  progress: ProcessingProgress;
};

// Define interfaces for the expected data structures from the server
interface ProgressData {
  percentage?: number;
  message?: string;
  step?: number; // Example from previous snippets
  status?: string;
  // Add other fields your worker might send
}

interface EventPayload {
  jobId: string; // ID of the specific job within the flow
  progressData?: ProgressData;
  result?: any;
  reason?: string;
  state?: string; // From initial_state
  progress?: ProgressData | number; // From initial_state
  message?: string; // From error event
}

const initialSteps: ProcessingStep[] = [
  {
    id: "video",
    name: "Processing Video",
    progress: { total: 100, current: 0, percentage: 0 },
    status: "pending",
  },
  {
    id: "captions",
    name: "Processing Audio",
    progress: { total: 100, current: 0, percentage: 0 },
    status: "pending",
  },
  {
    id: "broll",
    name: "Processing Broll",
    progress: { total: 100, current: 0, percentage: 0 },
    status: "pending",
  },
];

export default function ProcessVideoPage() {
  const navigate = ProcessVideoRoute.useNavigate();
  const { videoSubmission } = ProcessVideoRoute.useLoaderData();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [allCompleted, setAllCompleted] = useState(false);

  const [steps, setSteps] = useState<ProcessingStep[] | null>(null);
  const [eventSourceUrl, setEventSourceUrl] = useState<string | null>(null);

  const {
    data: flowJobId,
    mutateAsync: startProcessingVideo,
    isPending: isProcessingVideo
  } = useMutation({
    mutationFn: async function () {
      const startJobResponse = await api.queues["process-video"][":assetId"].start.$post({
        param: {
          assetId: videoSubmission.assetId,
        },
        json: {
          id: videoSubmission.id,
          generateCaptions: videoSubmission.autoGenerateCaptions,
          generateBroll: videoSubmission.autoGenerateBroll,
        }
      });

      const { data: startJobData } = await startJobResponse.json();
      const { jobId } = startJobData;

      return jobId.id;
    },
    onSuccess: async () => {
      setMessage("Video processing starting for " + videoSubmission.title + "...");

      const progressUrl = api.queues["process-video"][":assetId"].progress.$url({
        param: {
          assetId: videoSubmission.assetId,
        },
      });

      setEventSourceUrl(progressUrl.pathname);
      return;
    }
  });

  // handle progress ui
  useEffect(() => {
    if (!eventSourceUrl || !flowJobId) {
      startProcessingVideo();
      return;
    };

    setMessage("Video processing starting...");
    setSteps(initialSteps);

    const eventSource = new EventSource(eventSourceUrl);

    eventSource.onopen = () => {
      setMessage("Video processing started");
    }

    eventSource.onerror = () => {
      setMessage("Video processing failed");
      setError(new Error("Video processing failed"));
    }

    // Handler for specific event types from the server
    const addListener = <T extends EventPayload>(eventName: string, handler: (data: T) => void) => {
      eventSource.addEventListener(eventName, (event) => {
        console.log(`Received SSE event [${eventName}] for ${flowJobId}:`, event.data);
        try {
          const parsedData = JSON.parse(event.data) as T;
          handler(parsedData);
        } catch (e) {
          console.error(`Error parsing SSE event data for [${eventName}]:`, event.data, e);
          setMessage(`Failed to parse ${eventName} event data.`);
          if (e instanceof Error) {
            setError(e);
          } else {
            setError(new Error("Failed to parse event data"));
          }
        }
      });
    };

  }, [eventSourceUrl, flowJobId]);

  // example of how to simulate progress
  // useEffect(() => {

  //   //   // Simulate processing steps
  //   //   const simulateProgress = () => {
  //   //     // Upload progress
  //   //     const uploadInterval = setInterval(() => {
  //   //       setSteps((prev) => {
  //   //         const newSteps = [...prev]
  //   //         const uploadStep = newSteps.find((s) => s.id === "upload")

  //   //         if (uploadStep && uploadStep.progress < 100) {
  //   //           uploadStep.progress += 5

  //   //           if (uploadStep.progress >= 100) {
  //   //             uploadStep.status = "completed"
  //   //             clearInterval(uploadInterval)

  //   //             // Start transcription after upload completes
  //   //             const transcriptionStep = newSteps.find((s) => s.id === "transcription")
  //   //             if (transcriptionStep) {
  //   //               transcriptionStep.status = "processing"
  //   //             }
  //   //           }
  //   //         }

  //   //         return newSteps
  //   //       })
  //   //     }, 300)

  //   //     // Transcription progress (starts after upload)
  //   //     setTimeout(() => {
  //   //       const transcriptionInterval = setInterval(() => {
  //   //         setSteps((prev) => {
  //   //           const newSteps = [...prev]
  //   //           const transcriptionStep = newSteps.find((s) => s.id === "transcription")

  //   //           if (transcriptionStep && transcriptionStep.status === "processing" && transcriptionStep.progress < 100) {
  //   //             transcriptionStep.progress += 4

  //   //             if (transcriptionStep.progress >= 100) {
  //   //               transcriptionStep.status = "completed"
  //   //               clearInterval(transcriptionInterval)

  //   //               // Start captions generation after transcription completes
  //   //               const captionsStep = newSteps.find((s) => s.id === "captions")
  //   //               if (captionsStep) {
  //   //                 captionsStep.status = "processing"
  //   //               }
  //   //             }
  //   //           }

  //   //           return newSteps
  //   //         })
  //   //       }, 400)
  //   //     }, 6000) // Start after upload is likely done

  //   //     // Captions generation progress (starts after transcription)
  //   //     setTimeout(() => {
  //   //       const captionsInterval = setInterval(() => {
  //   //         setSteps((prev) => {
  //   //           const newSteps = [...prev]
  //   //           const captionsStep = newSteps.find((s) => s.id === "captions")

  //   //           if (captionsStep && captionsStep.status === "processing" && captionsStep.progress < 100) {
  //   //             captionsStep.progress += 3

  //   //             if (captionsStep.progress >= 100) {
  //   //               captionsStep.status = "completed"
  //   //               clearInterval(captionsInterval)
  //   //               setAllCompleted(true)
  //   //             }
  //   //           }

  //   //           return newSteps
  //   //         })
  //   //       }, 500)
  //   //     }, 16000) // Start after transcription is likely done
  //   //   }

  //   //   simulateProgress()
  // }, [jobId])

  const handleContinue = () => {
    navigate({
      to: "/videos/$id/edit",
      params: {
        id: videoSubmission.id,
      },
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {steps && steps.length > 0 ? steps[0].name : "Processing Your Video"}
          </h1>
          <p className="text-muted-foreground">
            {steps && steps.length > 0 ? steps[0].name && message ? message : "We're preparing your video. This may take a few minutes." : "We're preparing your video. This may take a few minutes."}
          </p>
        </div>

        <div className="space-y-6 mt-8">
          {steps && steps.map((step: ProcessingStep) => (
            <div key={step.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : step.status === "processing" ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                  <span className="font-medium">{step.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{step.progress.percentage}%</span>
              </div>
              <Progress value={step.progress.percentage} className="h-2" />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={handleContinue} disabled={!allCompleted} className="min-w-[150px]">
            {allCompleted ? "Continue to Editor" : "Processing..."}
          </Button>
        </div>
      </div>
    </main>
  );
};