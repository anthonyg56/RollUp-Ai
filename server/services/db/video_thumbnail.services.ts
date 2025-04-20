import db from "@server/db";
import { videoThumbnails, NewVideoThumbnails } from "@server/db/models";
import { uploadToCloudflareImages } from "@server/services/images";

export async function uploadThumnail(path: string, assetId: string) {
  const file = Bun.file(path);
  const cloudflareResults = await uploadToCloudflareImages(file);

  const entityResults = await insertNewThumbnail({
    assetId,
    externalId: cloudflareResults.id,
    filename: cloudflareResults.filename,
  });

  return entityResults.id;
}

async function insertNewThumbnail(data: NewVideoThumbnails) {
  const result = await db
    .insert(videoThumbnails)
    .values(data)
    .returning();

  return result[0];
};