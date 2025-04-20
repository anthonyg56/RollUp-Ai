import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { H2, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

type Props = React.ComponentProps<typeof Card> & {
  activeTab: string;
  handleOnClick: () => void;
}

export default function NoVideosCard({ activeTab, handleOnClick, ...props }: Props) {
  return (
    <Card className={cn("overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950", props.className)} {...props}>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 p-3 rounded-full bg-slate-100 dark:bg-slate-800">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <H2 className="text-xl font-semibold mb-2">No {activeTab} videos yet</H2>
          <Text variant="muted" className="max-w-md mb-4">
            Your {activeTab} videos will appear here
          </Text>
          <Button onClick={handleOnClick}>Publish a video</Button>
        </div>
      </CardContent>
    </Card>
  )
}
