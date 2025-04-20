"use client";

import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import NewVideoForm from "@/components/forms/NewVideoForm"
import { useDialogStore } from "@/hooks/useStores";
import { useState } from "react";
import DropZone from "../DropZone";

export default function UploadNewVideoDialog() {
  const [view, setView] = useState<"form" | "dropzone">("dropzone");

  const currentDialog = useDialogStore(state => state.currentDialog);

  if (currentDialog !== "Upload New Video")
    return null;

  const title = view === "form" ? "Enter New Video Details" : "Upload a New Video";
  const description = view === "form" ? "Enter the details of your new video" : "Upload a new video to the platform";

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      {view === "form" && <NewVideoForm setView={setView} />}
      {view === "dropzone" && <DropZone setView={setView} />}
    </>
  )
}
