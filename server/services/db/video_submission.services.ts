import db from "@server/db";
import { videoSubmissions } from "@server/db/models";
import type { NewVideoSubmission } from "@server/db/models";

export async function insertNewVideoSubmission(data: NewVideoSubmission) {
  const results = await db
    .insert(videoSubmissions)
    .values(data)
    .returning({
      id: videoSubmissions.id,
    });

  return results[0];
}
