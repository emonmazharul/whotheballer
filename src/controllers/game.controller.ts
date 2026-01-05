import { Request, Response } from "express";
import { eq, sql, and, notInArray } from "drizzle-orm";
import { db } from "../db/db.js";
import { userStats, questions } from "../db/schema.js";
import { findUser } from "../utils/findUser.js";
import {
  checkIfUserAlreadyPlayed,
  checkIfUserPlayedTheQuestion,
} from "../utils/checkIfUserAlreadyPlayed.js";
import { isCorrectGuess } from "../utils/compareString.js";

export const getQuestion = async (req: Request, res: Response) => {
  const { difficulty } = req.query;
  const userId = req.user?.userId!;
  // const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
  if (!userId) {
    const question = await db
      .select()
      .from(questions)
      .where(
        difficulty ? eq(questions.difficulty, String(difficulty)) : undefined,
      )
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (question.length === 0)
      return res
        .status(400)
        .send({ error: "Can not get a question, try again!" });
    return res.json({
      id: question[0].id,
      clubs: question[0].clubs,
      difficulty: question[0].difficulty,
    });
  }
  const playedIds = await checkIfUserPlayedTheQuestion(userId);
  const nextQuestion = await db
    .select()
    .from(questions)
    .where(
      and(
        playedIds.length > 0 ? notInArray(questions.id, playedIds) : undefined,
        difficulty ? eq(questions.difficulty, String(difficulty)) : undefined,
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(1);
  if (nextQuestion.length === 0) {
    return res.json({
      message:
        "You have played all the question.Congratulations!However we will upload new players aswell",
    });
  }
  return res.json({
    id: nextQuestion[0].id,
    clubs: nextQuestion[0].clubs,
    difficulty: nextQuestion[0].difficulty,
  });
};

export function setPoint(difficulty: string) {
  switch (difficulty) {
    case "easy":
    default:
      return 1;
    case "medium":
      return 2;
    case "hard":
      return 3;
  }
}

export const submitGuess = async (req: Request, res: Response) => {
  const { questionId, guess } = req.body;

  try {
    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId));

    if (question.length === 0)
      return res.status(404).json({ error: "Question not found" });

    const geussDetails = isCorrectGuess(guess, question[0].answer);

    const correct = geussDetails.correct;
    const { answer } = question[0];

    const user = await findUser(req.user?.userId!);
    const point = setPoint(question[0].difficulty);
    // for registered user
    if (user && correct) {
      const isUserPlayedTheGameBeFore = await checkIfUserAlreadyPlayed(
        user.id,
        questionId,
        correct,
      );
      if (isUserPlayedTheGameBeFore) {
        return res.status(423).json({
          error: "You've already submitted an answer for this player.",
          correct,
          answer: answer,
        });
      }
      await db
        .insert(userStats)
        .values({ userId: user.id, totalPoints: point, gamesPlayed: 1 })
        .onConflictDoUpdate({
          target: userStats.userId,
          set: {
            totalPoints: sql`${userStats.totalPoints} + ${point}`,
            gamesPlayed: sql`${userStats.gamesPlayed} + ${point}`,
          },
        });
      const message =
        geussDetails.similarity === 1
          ? "You got the exec right answer"
          : `The right answer is ${question[0].answer} and your guess is ${guess}. But who care about this much spelling!`;
      res.json({
        user: user.username,
        point: point,
        correct,
        answer: answer,
        message: message,
      });
      return;
    }

    // for unregister user
    const message =
      geussDetails.similarity === 1
        ? "You got the exec right answer"
        : `The right answer is ${question[0].answer} and your guess is ${guess}. But who care about this much spelling!`;
    res.json({
      correct,
      point: point,
      answer: correct ? question[0].answer : null,
      message: correct ? message : "Your answer is wrong",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Server crushed, Please try again." });
  }
};
