import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle for errors
import { useEffect, useState, useCallback } from "react";
import { Route as ProcessVideoRoute } from "@/routes/_protected/_protected.videos.$id.process";
import { api } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

// Import Job Names from server constants if possible, otherwise define them here
// Ideally, these would be shared between frontend and backend

type PageStatus = "pending" | "processing" | "completed" | "error";
// Adjusted PageStep to match server flow order potentially
type PageStepId = "setup" | "broll" | "captions" | "finalize";
// Adjusted PageName mapping
type PageName = "Setting Up Assets" | "Generating B-Roll" | "Processing Audio & Captions" | "Finalizing";

interface ProcessingProgress {
  percentage: number;
};

interface ProcessingStep {
  id: PageStepId;
  jobName: string; // Map UI step to BullMQ Job Name
  name: PageName;
  status: PageStatus;
  errorMessage?: string;
  progress: ProcessingProgress;
};

// Define interfaces for the expected data structures from the server
// (Assuming workers send progress data like this)
interface WorkerProgressData {
  percentage?: number;
  message?: string;
  // Add other fields your worker might send in job.updateProgress({...})
}

interface EventPayload {
  jobId: string; // ID of the specific job within the flow
  progressData?: WorkerProgressData | number; // BullMQ allows number or object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  returnvalue?: any; // Changed from result to match QueueEvents
  reason?: string; // Changed from failedReason to match QEListener
  state?: string; // From initial_state
  prev?: string; // From active event
  message?: string; // From error event
}

// --- IMPORTANT: Define steps matching the ACTUAL flow order ---
// Flow: VIDEO -> BROLL -> AUDIO -> FINALIZE
const initialStepsDefinition: Omit<ProcessingStep, 'status' | 'progress' | 'errorMessage'>[] = [
  { id: "setup", name: "Setting Up Assets", jobName: "setup_assets" },
  { id: "broll", name: "Generating B-Roll", jobName: "generate_broll" },
  { id: "captions", name: "Processing Audio & Captions", jobName: "generate_captions" }, // UI step 'captions' maps to 'process-audio' job
  { id: "finalize", name: "Finalizing", jobName: "finalize_video" },
];

// Function to initialize steps state
const getInitialSteps = (): ProcessingStep[] =>
  initialStepsDefinition.map(stepDef => ({
    ...stepDef,
    status: "pending",
    progress: { percentage: 0 },
    errorMessage: undefined,
  }));


export default function ProcessVideoPage() {
  const navigate = ProcessVideoRoute.useNavigate();
  const { videoSubmission } = ProcessVideoRoute.useLoaderData();

  const [message, setMessage] = useState<string | null>(null); // General status message
  const [error, setError] = useState<string | null>(null); // Global error message
  const [allCompleted, setAllCompleted] = useState(false);

  const [steps, setSteps] = useState<ProcessingStep[]>(getInitialSteps());
  const [eventSourceUrl, setEventSourceUrl] = useState<string | null>(null);
  const [eventSourceInstance, setEventSourceInstance] = useState<EventSource | null>(null);

  const {
    data: flowJobId, // This is the ROOT job ID of the entire flow
    mutateAsync: startProcessingVideo,
    isPending: isStartingJob, // Renamed for clarity
  } = useMutation<string | null>({ // Specify return type
    mutationFn: async function () {
      try {
        const startJobResponse = await api.queues["process-video"][":assetId"].start.$post({
          param: { assetId: videoSubmission.assetId },
          json: {
            id: videoSubmission.id,
            generateCaptions: videoSubmission.autoGenerateCaptions,
            generateBroll: videoSubmission.autoGenerateBroll,
          }
        });

        // if (!startJobResponse.ok) {
        //   const errorData = await startJobResponse.json().catch(() => ({ error: { message: 'Failed to start job' } }));
        //   throw new Error(errorData ? errorData..message : 'Failed to start job processing');
        // }

        const startJobData = await startJobResponse.json();
        const jobId = startJobData?.data?.jobId?.id; // Adjusted based on API response structure

        if (!jobId) {
          throw new Error("No Job ID received from server.");
        }
        console.log("Started flow with Root Job ID:", jobId);
        return jobId;

      } catch (err) {
        console.error("Error calling start processing API:", err);
        setError(err instanceof Error ? err.message : "Failed to initiate processing.");
        return null; // Return null on error
      }
    },
    onSuccess: async (receivedFlowJobId) => {
      if (receivedFlowJobId) {
        setMessage("Video processing starting for " + videoSubmission.title + "...");
        // Construct the progress URL - ENSURE THIS MATCHES YOUR API SETUP
        // NOTE: The previous example passed flowJobId in JSON body, not URL param.
        // Adjust based on your actual API definition in queues.routes.ts
        // Assuming it should be part of the URL path now:
        const progressUrl = api.queues["process-video"][":assetId"].progress.$url({
          param: {
            assetId: videoSubmission.assetId,
          },
        });
        console.log("Setting EventSource URL:", progressUrl.pathname);
        setEventSourceUrl(progressUrl.pathname); // Only set the path for EventSource
      } else {
        setMessage("Failed to obtain Job ID to track progress.");
      }
    },
    onError: (err) => {
      setError(err.message || "An error occurred while starting the job.");
    }
  });

  // Function to update step state immutably
  const updateStepState = useCallback((jobName: string, updates: Partial<ProcessingStep> & { progress?: Partial<ProcessingProgress> }) => {
    setSteps(prevSteps => {
      const stepIndex = prevSteps.findIndex(s => s.jobName === jobName);
      if (stepIndex === -1) {
        console.warn(`UI Step not found for jobName: ${jobName}`);
        return prevSteps; // Return previous state if step not found
      }

      const newSteps = [...prevSteps];
      const currentStep = newSteps[stepIndex];

      // Merge updates
      newSteps[stepIndex] = {
        ...currentStep,
        ...updates,
        // Deep merge progress
        progress: {
          ...currentStep.progress,
          ...updates.progress,
        },
      };

      // If a step starts processing, ensure subsequent steps are pending
      if (updates.status === 'processing') {
        setMessage(`Processing: ${currentStep.name}...`);
        for (let i = stepIndex + 1; i < newSteps.length; i++) {
          if (newSteps[i].status !== 'pending') {
            newSteps[i].status = 'pending';
            newSteps[i].progress = { percentage: 0 };
            newSteps[i].errorMessage = undefined;
          }
        }
      }
      // If a step completes, mark the next one as processing (or pending if needed)
      else if (updates.status === 'completed') {
        newSteps[stepIndex].progress.percentage = 100; // Ensure 100% on complete
        setMessage(`${currentStep.name} completed.`);
        if (stepIndex + 1 < newSteps.length) {
          // Don't force next to processing, wait for its 'active' event
          // newSteps[stepIndex + 1].status = 'processing';
        } else {
          // This was the last step
          setAllCompleted(true);
          setMessage("All processing steps completed successfully!");
        }
      }
      // If a step fails, mark subsequent steps as pending (or error?)
      else if (updates.status === 'error') {
        setMessage(`Error during: ${currentStep.name}.`);
        for (let i = stepIndex + 1; i < newSteps.length; i++) {
          if (newSteps[i].status !== 'pending') {
            newSteps[i].status = 'pending'; // Or maybe 'error'/'cancelled'?
            newSteps[i].progress = { percentage: 0 };
          }
        }
        setAllCompleted(false); // Ensure continue button is disabled on error
      }

      return newSteps;
    });
  }, []);


  // Effect to handle EventSource connection and listeners
  useEffect(() => {
    // Ensure we have the URL and haven't already connected
    if (!eventSourceUrl || eventSourceInstance) {
      // If we don't have the URL yet, try starting the job
      if (!flowJobId && !isStartingJob && !eventSourceUrl) {
        console.log("Attempting to start processing video...");
        startProcessingVideo();
      }
      return;
    }

    console.log("Creating EventSource for:", eventSourceUrl);
    setMessage("Connecting to progress stream...");
    setSteps(getInitialSteps()); // Reset steps when connecting
    setAllCompleted(false);
    setError(null);

    const source = new EventSource(eventSourceUrl);
    setEventSourceInstance(source); // Store the instance

    source.onopen = () => {
      console.log(`SSE Connection Opened for URL: ${eventSourceUrl}`);
      setMessage("Tracking job progress...");
    };

    source.onerror = (event) => {
      console.error(`SSE Error for URL ${eventSourceUrl}:`, event);
      // Check readyState. If CLOSED, it won't reconnect.
      if (source.readyState === EventSource.CLOSED) {
        setError("Connection to progress stream lost or failed.");
        setMessage("Video processing failed or connection lost.");
        // Optionally try restarting the job or guide user?
        // For now, just show error. Ensure UI reflects failure.
        setSteps(prevSteps => prevSteps.map(s => s.status === 'processing' ? { ...s, status: 'error', errorMessage: 'Connection lost' } : s));
        setAllCompleted(false);
      } else {
        // Browser might be attempting to reconnect
        setMessage("Connection issue, attempting to reconnect...");
      }
    };

    const addListener = <T extends EventPayload>(eventName: string, handler: (data: T) => void) => {
      source.addEventListener(eventName, (event) => {
        console.log(`Received SSE event [${eventName}] for ${flowJobId}:`, event.data);
        try {
          const parsedData = JSON.parse(event.data) as T;
          // --- Map BullMQ Job ID to UI Step ---
          // Find which job name corresponds to the received jobId
          // This mapping is crucial and might require server assistance
          // or assumptions based on event data if job names aren't sent.
          // ASSUMPTION: progressData might contain the 'step' name or job name.
          // Let's modify the handler to pass the job name if available.
          // FOR NOW: We'll need to rely on data passed within progressData or infer based on sequence.
          // UPDATE: Let's assume server sends job name with progress. If not, this needs adjustment.
          handler(parsedData);
        } catch (e) {
          console.error(`Error parsing SSE event data for [${eventName}]:`, event.data, e);
          setMessage(`Failed to parse ${eventName} event data.`);
          setError(e instanceof Error ? e.message : "Failed to parse event data");
          // Mark all potentially processing steps as error?
          setSteps(prevSteps => prevSteps.map(s => s.status === 'processing' ? { ...s, status: 'error', errorMessage: 'Data parsing error' } : s));
          setAllCompleted(false);
        }
      });
    };

    // --- Define Event Handlers ---

    // Find the step definition corresponding to the job ID.
    // This is tricky without the job name in the event payload.
    // We'll need to enhance server payload or make assumptions.
    // Let's assume server sends 'jobName' in progressData or we map based on order.
    const findStepByJobId = (jobId: string, payload: EventPayload): ProcessingStep | undefined => {
      // OPTION 1: Server sends job name (BEST)
      // if (payload.jobName) { return steps.find(s => s.jobName === payload.jobName); }

      // OPTION 2: Server sends step identifier in progressData
      // if (payload.progressData && typeof payload.progressData === 'object' && payload.progressData.stepIdentifier) {
      //     return steps.find(s => s.id === payload.progressData.stepIdentifier);
      // }

      // OPTION 3: Infer based on current state (FRAGILE)
      // Find the first 'processing' or 'pending' step. Less reliable if parallel jobs exist.
      const currentProcessingStep = steps.find(s => s.status === 'processing');
      if (currentProcessingStep) return currentProcessingStep;
      const firstPendingStep = steps.find(s => s.status === 'pending');
      if (firstPendingStep) return firstPendingStep;

      console.warn("Could not reliably map jobId to UI step:", jobId, payload);
      return undefined; // Cannot determine step
    };

    addListener<EventPayload>('active', (data) => {
      // When a job becomes active, mark the corresponding step as 'processing'
      const step = findStepByJobId(data.jobId, data); // Need reliable mapping
      if (step) {
        updateStepState(step.jobName, { status: 'processing', progress: { percentage: 0 }, errorMessage: undefined });
      } else {
        console.warn(`Received 'active' for unknown job/step: ${data.jobId}`);
      }
    });


    addListener<EventPayload>('progress', (data) => {
      const step = findStepByJobId(data.jobId, data); // Need reliable mapping
      if (!step) {
        console.warn(`Received 'progress' for unknown job/step: ${data.jobId}`);
        return;
      };

      let percentage = step.progress.percentage; // Default to current
      const messageUpdate = step.errorMessage; // Default to current (or undefined)

      if (typeof data.progressData === 'number') {
        percentage = data.progressData;
      } else if (typeof data.progressData === 'object' && data.progressData !== null) {
        percentage = data.progressData.percentage ?? percentage;
        // Optionally update a step-specific message if provided
        // messageUpdate = data.progressData.message ?? messageUpdate;
      }

      // Ensure percentage is within bounds
      percentage = Math.max(0, Math.min(100, percentage));

      updateStepState(step.jobName, {
        status: 'processing', // Keep as processing while progress occurs
        progress: { percentage },
        // Optionally update message: errorMessage: messageUpdate
      });
    });

    addListener<EventPayload>('completed', (data) => {
      const step = findStepByJobId(data.jobId, data); // Need reliable mapping
      if (step) {
        updateStepState(step.jobName, { status: 'completed', progress: { percentage: 100 }, errorMessage: undefined });
        // Logic within updateStepState handles marking next as processing/pending and setting allCompleted
      } else {
        console.warn(`Received 'completed' for unknown job/step: ${data.jobId}`);
        // Potentially check if it was the known last job ID?
        const lastStepDef = initialStepsDefinition[initialStepsDefinition.length - 1];
        if (lastStepDef) { // Check if the last job completed even if mapping failed
          // Heuristic: Assume completion if the last defined job finished
          setAllCompleted(true);
          setMessage("All processing steps appear completed.");
        }
      }
      // Maybe close the eventSource if the *final* job completes?
      const lastStep = initialStepsDefinition[initialStepsDefinition.length - 1];
      if (step?.jobName === lastStep?.jobName) {
        source.close();
        setEventSourceInstance(null); // Clear instance ref
      }
    });

    addListener<EventPayload>('failed', (data) => {
      const step = findStepByJobId(data.jobId, data); // Need reliable mapping
      const reason = data.reason || 'Processing failed';
      if (step) {
        updateStepState(step.jobName, { status: 'error', errorMessage: reason });
        setError(`Step "${step.name}" failed: ${reason}`);
      } else {
        console.warn(`Received 'failed' for unknown job/step: ${data.jobId}`);
        setError(`An unknown processing step failed: ${reason}`);
        // Mark all potentially processing steps as error
        setSteps(prevSteps => prevSteps.map(s => s.status === 'processing' ? { ...s, status: 'error', errorMessage: reason } : s));
      }
      setAllCompleted(false); // Ensure continue is disabled
      source.close(); // Close connection on failure
      setEventSourceInstance(null); // Clear instance ref
    });

    addListener<EventPayload>('error', (data) => {
      setError(data.message || 'Received error event from server.');
      setMessage('An error occurred during processing.');
      setSteps(prevSteps => prevSteps.map(s => s.status === 'processing' ? { ...s, status: 'error', errorMessage: data.message || 'Server error' } : s));
      setAllCompleted(false);
      // Consider closing source depending on error severity
    });

    // Cleanup function
    return () => {
      console.log("Closing SSE connection in useEffect cleanup for:", eventSourceUrl);
      if (source) {
        source.close();
      }
      setEventSourceInstance(null); // Clear instance ref on cleanup
      // Optional: Reset state fully on cleanup if desired
      // setSteps(getInitialSteps());
      // setMessage(null);
      // setError(null);
      // setAllCompleted(false);
    };

  }, [eventSourceUrl, flowJobId, isStartingJob, startProcessingVideo, updateStepState, eventSourceInstance]); // Add dependencies


  const handleContinue = () => {
    navigate({
      to: "/videos/$id/edit",
      params: { id: videoSubmission.id },
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {/* Try to show current step name */}
            {steps.find(s => s.status === 'processing')?.name || "Processing Your Video"}
          </h1>
          <p className="text-muted-foreground">
            {/* Show specific message or general one */}
            {message || "We're preparing your video. This may take a few minutes."}
          </p>
          {isStartingJob && <p className="text-sm text-blue-600">Initiating processing...</p>}
          {error && <p className="text-sm text-red-600 p-2 bg-red-100 rounded">Error: {error}</p>}
        </div>

        <div className="space-y-6 mt-8">
          {steps.map((step: ProcessingStep) => (
            <div key={step.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : step.status === "processing" ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                  <span className="font-medium">{step.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{step.progress.percentage}%</span>
              </div>
              <Progress value={step.progress.percentage} className={`h-2 ${step.status === 'error' ? 'bg-red-200 [&>*]:bg-red-500' : ''}`} />
              {step.status === 'error' && step.errorMessage && (
                <p className="text-xs text-red-600">{step.errorMessage}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={handleContinue} disabled={!allCompleted || !!error} className="min-w-[150px]">
            {isStartingJob ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {error ? "Failed" : allCompleted ? "Continue to Editor" : "Processing..."}
          </Button>
        </div>
      </div>
    </main>
  );
};