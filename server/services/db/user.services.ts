import { eq } from "drizzle-orm";

import db from "@server/db";
import { users } from "@server/db/models/users";

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  return user;
};

export async function updateUserTour(id: string) {
  await db
    .update(users)
    .set({
      showWelcomeTour: false,
    })
    .where(eq(users.id, id));
};

export async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(
      eq(users.email, email)
    )
    .limit(1);

  return user[0];
};
