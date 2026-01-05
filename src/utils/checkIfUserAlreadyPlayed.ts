import { db } from "../db/db.js";
import { gameAttempts } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export async function checkIfUserAlreadyPlayed(
  userId: string,
  questionId: string,
  isCorrect: boolean,
) {
  const existing = await db
    .select()
    .from(gameAttempts)
    .where(
      and(
        eq(gameAttempts.userId, userId),
        eq(gameAttempts.questionId, questionId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return true;
  }

  // 2. Logic to check if userGuess is correct...

  // 3. Save the attempt (This prevents them from trying again)
  await db.insert(gameAttempts).values({
    userId,
    questionId,
    correct: isCorrect ? 1 : 0,
  });

  return false;
}

export async function checkIfUserPlayedTheQuestion(userId: string) {
  const alreadyPlayed = await db
    .select({ questionId: gameAttempts.questionId })
    .from(gameAttempts)
    .where(eq(gameAttempts.userId, userId));
  return alreadyPlayed.map((item) => item.questionId);
}
