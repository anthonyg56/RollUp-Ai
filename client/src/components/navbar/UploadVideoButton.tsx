import { useDialogStore } from "@/hooks/useStores"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface UploadVideoButtonProps {
  isMobile: boolean;
  isAuthenticated: boolean;
}

export default function UploadVideoButton({ isMobile, isAuthenticated }: UploadVideoButtonProps) {
  const openDialog = useDialogStore(state => state.open)

  if (!isAuthenticated) return null
  function handleOpenDialog(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    openDialog("Upload New Video")
  }

  return (
    <Button
      variant="outline"
      size={isMobile ? "icon" : "default"}
      className="bg-secondary text-primary border-none dark:bg-secondary dark:text-secondary-foreground hover:cursor-pointer"
      onClick={handleOpenDialog}
    >
      <Plus className="size-4" />
      {!isMobile && <span>Upload Video</span>}
    </Button>
  )
}
