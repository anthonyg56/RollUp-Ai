import { uuidSchema } from "@/lib/schemas/base";
import { BASE_HEAD_TITLE } from "@/lib/constants";
import { api } from "@/lib/utils";
import ProcessVideoPage from "@/pages/protected/videos/process-video";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_protected/_protected/videos/$id/process')({
  beforeLoad: async ({ params }) => {
    const parsedParams = uuidSchema.safeParse(params.id);

    if (!parsedParams.success || !parsedParams.data) {
      throw new Error("Invalid video ID");
    }

    return {
      id: parsedParams.data,
    }
  },
  loader: async ({ context }) => {
    const { id } = context;
    const response = await api.videos.submission[":id"].$get({
      param: {
        id,
      },
    });

    const { data } = await response.json();
    const { videoSubmission } = data;

    return {
      videoSubmission,
    };
  },
  head: () => ({
    meta: [
      {
        name: "title",
        content: `${BASE_HEAD_TITLE} Process A Video`,
      },
      {
        name: "description",
        content: "Processing your video on Rollup AI",
      },
    ],
  }),
  component: ProcessVideoPage,
})

