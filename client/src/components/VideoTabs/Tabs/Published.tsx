import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { H2 } from "@/components/ui/typography";
import { TabsVideo } from "../index";
import NoVideosCard from "../NoVideosCard";

type Props = {
  publishedVideos: TabsVideo[];
}

export default function Published({ publishedVideos }: Props) {
  return (
    <TabsContent value="published">
      {publishedVideos.length > 0 ? (
        publishedVideos.map((video) => (
          <Card key={video.id}>
            <CardContent>
              <H2>{video.title}</H2>
            </CardContent>
          </Card>
        ))
      ) : (
        <NoVideosCard activeTab="published" handleOnClick={() => { }} />
      )}
    </TabsContent>
  )
}

