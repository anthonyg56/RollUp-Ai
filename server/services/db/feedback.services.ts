import { feedbackSubmissions } from "@server/db/models/feedback_submissions";
import db from "@server/db";
import { NewFeedbackSubmission } from "@server/db/models";

export async function submitFeedback(data: NewFeedbackSubmission) {
  await db.insert(feedbackSubmissions).values(data);
}
