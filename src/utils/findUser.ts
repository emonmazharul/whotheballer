import { db } from "../db/db.js";
import { eq, or } from "drizzle-orm";
import { users } from "../db/schema.js";

type User = typeof users.$inferSelect;

export const findUser = async (userId: string): Promise<User | null> => {
  const user = await db.select().from(users).where(eq(users.id, userId));
  if (user[0] === undefined) return null;
  return user[0];
};

export const findUserByEmailOrUsername = async (
  email: string,
  username: string,
): Promise<User> => {
  const user = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
  return user[0];
};
