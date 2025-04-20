import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface TooltipProps {
  content: string | string[];
};

export default function InfoTooltip({ content }: TooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-4 h-4" />
        </TooltipTrigger>
        <TooltipContent>
          {Array.isArray(content) ? content.map((item) => (
            <p key={item}>{item}</p>
          )) : content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}