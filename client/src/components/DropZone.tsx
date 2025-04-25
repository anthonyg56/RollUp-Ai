"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Video, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ZodError } from "zod"
import { useDialogStore } from "@/hooks/useStores";
import { fileListSchema } from "@/lib/schemas/base";
import { cn } from "@/lib/utils"

interface DropZoneProps {
  setView: (view: "form" | "dropzone") => void;
}

export default function DropZone({ setView }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<boolean>(false);

  const setUploadNewVideoOptions = useDialogStore(state => state.setUploadNewVideoOptions);

  // const { mutateAsync: uploadVideo, isPending } = useMutation({
  //   mutationFn: async (file: FileList) => {

  //     openDialog("new-video-details", {
  //       newVideoFile: validatedFiles[0],
  //     });

  //     const uploadFileResponse = await api.videos.$post({
  //       json: {
  //         videoFile: validatedFiles[0],
  //         submissionData: {
  //           title: "My Video",
  //           description: "This is a test video",
  //           autoGenerateCaptions: true,
  //           autoGenerateBroll: true,
  //         },
  //       },
  //     });

  //     const uploadFileJson = await uploadFileResponse.json();
  //     const { key, eTag } = uploadFileJson.data;

  //     setKey(key);
  //     setETag(eTag);
  //   },
  //   onError: () => {
  //     toast.error("Failed to upload video", {
  //       description: "Please try again.",
  //     });
  //   }
  // })

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
    // TODO: Add analytics event for tracking user attempts to upload a video
  }

  const handleDragLeave = () => {
    setIsDragging(false)
    // TODO: Add analytics event for tracking users attempts to upload a video
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()

    setIsDragging(false)

    const files = e.dataTransfer.files
    handleValidation(files);
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && !fileError) {
      handleValidation(e.target.files);
    }
  }

  const handleFileError = (error: ZodError<FormData>) => {
    const formattedErrors = error.format()._errors;

    toast.error("Invalid file", {
      description: `We found the following errors with your file: ${formattedErrors.join("\n - ")}`,
    });
    setFileError(true);
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleValidation = (file: FileList) => {
    const results = fileListSchema.safeParse(file);

    if (!results.success) {
      handleFileError(results.error);
      return
    };

    const validatedFiles = results.data;

    setUploadNewVideoOptions({ file: validatedFiles[0] });
    setView("form");
  }

  return (
    <div
      className={cn("border-2 border-dashed rounded-lg p-12 text-center transition-colors w-[325px] md:w-[800px]", {
        "border-destructive bg-destructive/5": fileError,
        "border-primary bg-primary/5": isDragging,
        "border-muted-foreground/25": !fileError && !isDragging
      })}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={cn("p-4 rounded-full", {
          "bg-destructive/10": fileError,
          "bg-primary/10": !fileError
        })}>
          {fileError ? (
            <X className="h-12 w-12 text-destructive" />
          ) : (
            <Video className="h-12 w-12 text-primary" />
          )}
        </div>
        <h3 className="text-xl font-medium">
          {fileError ? "Upload failed" : "Drag and drop your video here"}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {fileError ? "There was an error creating the upload endpoint. Please try again." : "Upload your video to enhance it with b-roll overlays, captions, and share it with the world"}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Button
            onClick={handleButtonClick}
            className="gap-2"
            variant={fileError ? "destructive" : "default"}
          >
            <Upload className="h-4 w-4" />
            {fileError ? "Try Again" : "Select Video"}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileInput} accept="video/*" className="hidden" />
        </div>
        <p className="text-xs text-muted-foreground">Supported formats: MP4, MOV, AVI, WebM (Max 100MB)</p>
      </div>
    </div>
  )
}

