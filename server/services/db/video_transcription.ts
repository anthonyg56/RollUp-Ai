import db from "@server/db";
import { NewVideoTranscript, videoTranscripts } from "@server/db/models";

export async function insertVideoTranscript(data: NewVideoTranscript) {
  const results = await db
    .insert(videoTranscripts)
    .values(data)
    .returning();

  return results[0];
}