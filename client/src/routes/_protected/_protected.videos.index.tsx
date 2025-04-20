import { H1, Text } from "@/components/ui/typography";
import VideoTabs from "@/components/VideoTabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_protected/_protected/videos/')({

  component: Videos,
})

function Videos() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <H1>My Videos</H1>
        <Text variant="muted">Manage your video content and drafts</Text>
      </div>

      <VideoTabs />
    </div>
  );
}

