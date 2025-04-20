import { TabsContent } from "@/components/ui/tabs";
import { TabsVideo } from "../index";
import NoVideosCard from "../NoVideosCard";
import VideoCard from "../VideoCard";

type Props = {
  draftVideos: TabsVideo[];
}

export default function Drafts({ draftVideos }: Props) {
  return (
    <TabsContent value="drafts" className="space-y-6">
      <div className="space-y-4">
        {draftVideos.length > 0 ? (
          draftVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))
        ) : (
          <NoVideosCard activeTab="drafts" handleOnClick={() => { }} />
        )}
      </div>
    </TabsContent>
  )
}


