import { FileRoutesByFullPath } from "@/routeTree.gen"
import { UseNavigateResult } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react";

interface StreamSSEProps {
  navigate: UseNavigateResult<keyof FileRoutesByFullPath>,
};

export function useStreamSSE({ navigate }: StreamSSEProps) {
  const [error, setError] = useState("");

  const [allCompleted, setAllCompleted] = useState(false);
  const [message, setMessage] = useState("");

  const [eventSourceUrl, setEventSourceUrl] = useState<string | null>(null);
  const [eventSourceInstance, setEventSourceInstance] = useState<EventSource | null>(null);

  const updateStepState = useCallback(
    (jobName: string, updates: Partial<ProcessingStep> & { progress?: Partial<ProcessingProgress> }) => {
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

  useEffect(() => {
    const eventSource = new EventSource(eventSourceUrl);

    eventSource.onmessage = (event) => {
      setStreamMessage(event.data);
    };
  }, [eventSourceUrl]);
}