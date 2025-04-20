import { Download, Edit, MoreHorizontal, Play, Trash2, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TabsVideo } from "./index";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Props = {
  video: TabsVideo;
}

export default function TabsVideoCard({ video }: Props) {
  return (
    <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="relative">
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={video.thumbnail || "/placeholder.svg?height=720&width=1280"}
            alt={video.title}
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 hover:cursor-pointer transition-opacity">
            <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
              <Play className="h-8 w-8 fill-white text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <Progress value={video.progress} className="h-1.5 w-full bg-white/30" />
          </div>
          <Badge className="absolute top-2 right-2 bg-black/60 text-white">
            {video.duration}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-1 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold leading-tight flex-1">
              {video.title}
            </h3>

            <Badge
              variant={
                video.status === "Draft" ? "outline" :
                  video.status === "Processing" ? "secondary" :
                    video.status === "Published" ? "outline" : "default"
              }
              className={
                video.status === "Published"
                  ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
                  : "whitespace-nowrap"
              }
            >
              {video.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:cursor-pointer hover:bg-transparent">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Publish</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {video.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="text-xs">Created {video.createdAt}</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
