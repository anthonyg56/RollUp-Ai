
import db from "@server/db";
import { videoTechnicalMetadatas } from "@server/db/models";
import { NewVideoTechnicalMetadata } from "@server/db/models";

export async function insertVideoMetadata(data: NewVideoTechnicalMetadata) {
  const videoMetadata = await db
    .insert(videoTechnicalMetadatas)
    .values(data)
    .returning();

  return videoMetadata[0];
}
