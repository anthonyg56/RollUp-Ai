import { VideoIcon as BRollIcon, VideoIcon as VideoEditIcon, StoreIcon as StorageIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: "broll" | "videoEdit" | "storage"
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  function getIcon() {
    if (icon === "broll") return <BRollIcon className="h-8 w-8 text-fuchsia-600 dark:text-fuchsia-400" />
    else if (icon === "videoEdit") return <VideoEditIcon className="h-8 w-8 text-fuchsia-600 dark:text-fuchsia-400" />
    else if (icon === "storage") return <StorageIcon className="h-8 w-8 text-fuchsia-600 dark:text-fuchsia-400" />
  }

  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="mb-6 bg-muted p-4 rounded-lg">{getIcon()}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
