import { H1, Text } from "@/components/ui/typography";
import VideoTabs from "@/components/VideoTabs";
import { BASE_HEAD_TITLE } from "@/lib/constants";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_protected/_protected/videos/')({
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} My Videos`,
      },
      {
        name: "description",
        content: "Manage your video content and drafts",
      },
    ],
  }),
  component: Videos,
})

function Videos() {
  return (
    <div className="container mx-auto py-6 space-y-8 px-4 md:px-0">
      <div>
        <H1>My Videos</H1>
        <Text variant="muted">Manage your video content and drafts</Text>
      </div>

      <VideoTabs />
    </div>
  );
}

