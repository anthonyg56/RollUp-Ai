import { TabsContent } from "@/components/ui/tabs";
import { TabsVideo } from "../index";
import TabsVideoCard from "../VideoCard";
import NoVideosCard from "../NoVideosCard";

type Props = {
  allVideos: TabsVideo[];
};

export default function All({ allVideos }: Props) {
  return (
    <TabsContent value="all">
      <div className="space-y-4">
        {allVideos.length > 0 ? (
          allVideos.map((video) => (
            <TabsVideoCard key={video.id} video={video} />
          ))
        ) : (
          <NoVideosCard activeTab="all" handleOnClick={() => { }} />
        )}
      </div>
    </TabsContent>
  )
}


