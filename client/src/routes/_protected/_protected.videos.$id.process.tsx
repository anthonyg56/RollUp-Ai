import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uuidSchema } from "@/lib/schemas/base";
import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { BASE_HEAD_TITLE } from "@/lib/constants";

export const Route = createFileRoute('/_protected/_protected/videos/$id/process')({
  validateSearch: zodValidator(
    z.object({
      videoId: uuidSchema,
    })
  ),
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Process A Video`,
      },
      {
        name: "description",
        content: "Processing your video on Rollup AI",
      },
    ],
  }),
  component: ProcessVideoPage,
})

interface ProcessingStep {
  id: string
  name: string
  progress: number
  status: "pending" | "processing" | "completed" | "error"
}

function ProcessVideoPage() {
  const navigate = useNavigate()
  const { videoId } = Route.useSearch()

  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "upload", name: "Video Upload", progress: 0, status: "processing" },
    { id: "transcription", name: "Audio Transcription", progress: 0, status: "pending" },
    { id: "captions", name: "Captions Generation", progress: 0, status: "pending" },
  ])

  const [allCompleted, setAllCompleted] = useState(false)

  useEffect(() => {
    // Simulate processing steps
    const simulateProgress = () => {
      // Upload progress
      const uploadInterval = setInterval(() => {
        setSteps((prev) => {
          const newSteps = [...prev]
          const uploadStep = newSteps.find((s) => s.id === "upload")

          if (uploadStep && uploadStep.progress < 100) {
            uploadStep.progress += 5

            if (uploadStep.progress >= 100) {
              uploadStep.status = "completed"
              clearInterval(uploadInterval)

              // Start transcription after upload completes
              const transcriptionStep = newSteps.find((s) => s.id === "transcription")
              if (transcriptionStep) {
                transcriptionStep.status = "processing"
              }
            }
          }

          return newSteps
        })
      }, 300)

      // Transcription progress (starts after upload)
      setTimeout(() => {
        const transcriptionInterval = setInterval(() => {
          setSteps((prev) => {
            const newSteps = [...prev]
            const transcriptionStep = newSteps.find((s) => s.id === "transcription")

            if (transcriptionStep && transcriptionStep.status === "processing" && transcriptionStep.progress < 100) {
              transcriptionStep.progress += 4

              if (transcriptionStep.progress >= 100) {
                transcriptionStep.status = "completed"
                clearInterval(transcriptionInterval)

                // Start captions generation after transcription completes
                const captionsStep = newSteps.find((s) => s.id === "captions")
                if (captionsStep) {
                  captionsStep.status = "processing"
                }
              }
            }

            return newSteps
          })
        }, 400)
      }, 6000) // Start after upload is likely done

      // Captions generation progress (starts after transcription)
      setTimeout(() => {
        const captionsInterval = setInterval(() => {
          setSteps((prev) => {
            const newSteps = [...prev]
            const captionsStep = newSteps.find((s) => s.id === "captions")

            if (captionsStep && captionsStep.status === "processing" && captionsStep.progress < 100) {
              captionsStep.progress += 3

              if (captionsStep.progress >= 100) {
                captionsStep.status = "completed"
                clearInterval(captionsInterval)
                setAllCompleted(true)
              }
            }

            return newSteps
          })
        }, 500)
      }, 16000) // Start after transcription is likely done
    }

    simulateProgress()
  }, [])

  const handleContinue = () => {
    navigate({
      to: "/videos/$id/edit",
      params: {
        id: videoId,
      },
      search: {
        videoId: videoId,
      },
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Processing Your Video</h1>
          <p className="text-muted-foreground">We're preparing your video. This may take a few minutes.</p>
        </div>

        <div className="space-y-6 mt-8">
          {steps.map((step) => (
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
                <span className="text-sm text-muted-foreground">{step.progress}%</span>
              </div>
              <Progress value={step.progress} className="h-2" />
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
  )
}


