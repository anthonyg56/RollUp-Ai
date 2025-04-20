import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import {
  users,
  accounts,
  sessions,
  verifications,
  onboardingSurveys,
  feedbackSubmissions,
  videoAssets,
  videoProcessingJobs,
  videoTranscripts,
  videoTranscriptSegments,
  errorLogs,
  videoTechnicalMetadatas,
} from "@server/db/models";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined. Make sure your environment variables are properly loaded."
  );
}

const sql = neon(databaseUrl);
const db = drizzle({
  client: sql,
  connection: databaseUrl,
  casing: "snake_case",
  schema: {
    users,
    accounts,
    sessions,
    verifications,
    onboardingSurveys,
    feedbackSubmissions,
    videoAssets,
    videoProcessingJobs,
    videoTranscripts,
    videoTranscriptSegments,
    errorLogs,
    videoTechnicalMetadatas,
  },
});

export default db;
