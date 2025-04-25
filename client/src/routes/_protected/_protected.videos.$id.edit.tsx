import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_protected/_protected/videos/$id/edit')({
  component: EditVideo,
})

function EditVideo() {
  return <div>EditVideo</div>;
}

