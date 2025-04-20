import { OnboardingSurvey } from "@server/db/models";
import db from "@server/db";
import { onboardingSurveys } from "@server/db/models/onboarding_surveys";
import { users } from "@server/db/models/users";
import { eq } from "drizzle-orm";

export async function insertOnboardingSurveyAnswers(
  userId: string,
  {
    referralSource,
    otherReferralSource,
    industry,
    otherIndustry,
    usedSimilar,
    productName,
    signupReason,
  }: {
    referralSource: OnboardingSurvey["referralSource"];
    otherReferralSource?: OnboardingSurvey["otherReferralSource"];
    industry?: OnboardingSurvey["industry"];
    otherIndustry?: OnboardingSurvey["otherIndustry"];
    usedSimilar?: OnboardingSurvey["usedSimilar"];
    productName?: OnboardingSurvey["productName"];
    signupReason?: OnboardingSurvey["signupReason"];
  }
) {
  // Run both operations in parallel with Promise.all
  await Promise.all([
    // Insert the survey answers
    db.insert(onboardingSurveys).values({
      userId,
      referralSource,
      otherReferralSource,
      industry,
      usedSimilar,
      productName,
      signupReason,
    }),

    // Update the user's onboarding status
    db
      .update(users)
      .set({ showOnboardingSurvey: false })
      .where(eq(users.id, userId)),
  ]);

  return { success: true };
}

export async function skipOnboardingSurvey(userId: string) {
  await db
    .update(users)
    .set({ showOnboardingSurvey: false })
    .where(eq(users.id, userId));

  return { success: true };
}

export async function verifyOnboardingSurvey(userId: string) {
  const surveyAnswers = await db
    .select()
    .from(onboardingSurveys)
    .where(eq(onboardingSurveys.userId, userId))
    .limit(1);

  if (surveyAnswers.length === 0) {
    return { success: false };
  }

  return { success: true };
}

