import { uuidSchema } from "@/lib/schemas/base";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_protected/_protected/videos/$id/edit')({
  validateSearch: zodValidator(
    z.object({
      videoId: uuidSchema,
    })
  ),
  component: EditVideo,
})

function EditVideo() {
  return <div>EditVideo</div>;
}

