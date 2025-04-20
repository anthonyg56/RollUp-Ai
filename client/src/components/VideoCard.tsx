"use client"

import { useState } from "react"
import { MoreHorizontal, Play, Pencil, Upload, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

type VideoStatus = "Draft" | "Published" | "Public"

interface TranscriptSegment {
  id: string
  startTime: string
  endTime: string
  text: string
}

// Update the VideoCardProps interface to include a description field
interface VideoCardProps {
  id: string
  title: string
  thumbnailUrl: string
  duration: string
  status: VideoStatus
  description: string
  transcriptSegments: TranscriptSegment[]
  onEdit?: (id: string) => void
  onPublish?: (id: string) => void
  onDelete?: (id: string) => void
}

export function VideoCard({
  id,
  title,
  thumbnailUrl,
  duration,
  status,
  description,
  transcriptSegments,
  onEdit,
  onPublish,
  onDelete,
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handleEdit = () => onEdit?.(id)
  const handlePublish = () => onPublish?.(id)
  const handleDelete = () => onDelete?.(id)

  const getStatusColor = (status: VideoStatus) => {
    switch (status) {
      case "Draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Published":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Public":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return ""
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {/* Thumbnail/Video Player */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {isPlaying ? (
            <video src="#" controls className="w-full h-full object-cover" onPause={() => setIsPlaying(false)} />
          ) : (
            <>
              <img
                src={thumbnailUrl || "/placeholder.svg?height=720&width=1280"}
                alt={title}
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-0 m-auto bg-black/30 text-white rounded-full w-12 h-12 hover:bg-black/50 hover:scale-110 transition-all"
                onClick={() => setIsPlaying(true)}
              >
                <Play className="h-6 w-6 fill-white" />
                <span className="sr-only">Play video</span>
              </Button>
            </>
          )}

          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{duration}</div>
        </div>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePublish}>
              <Upload className="mr-2 h-4 w-4" />
              Publish
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* In the CardContent section, replace the existing h3 and add the description and status badge */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
          <Badge variant="outline" className={`${getStatusColor(status)} ml-2 shrink-0`}>
            {status}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>

        {/* Transcript Segments */}
        <div className="space-y-2 mt-3">
          <h4 className="text-sm font-medium text-gray-500">Transcript</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto text-sm">
            {transcriptSegments.map((segment) => (
              <div key={segment.id} className="border-l-2 border-gray-200 pl-2">
                <div className="text-xs text-gray-500">
                  {segment.startTime} - {segment.endTime}
                </div>
                <p className="line-clamp-2">{segment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
