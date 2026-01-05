import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { questions } from "../db/schema.js";

export const getQuestionforAdmin = async (req: Request, res: Response) => {
  try {
    const allQuestions = await db.select().from(questions);
    res.send({
      count: allQuestions.length,
      questions: allQuestions,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "server crushed" });
  }
};

type Club = { name: string; logo: string };

export const postQuestions = async (req: Request, res: Response) => {
  const { answer, difficulty } = req.body;
  const clubs = req.body.clubs as Club[];
  try {
    const answerToken = jwt.sign({ answer }, process.env.JWT_SECRET!);
    const newQuestion = await db
      .insert(questions)
      .values({
        clubs: clubs,
        answer: answer as string,
        answerToken: answerToken,
        difficulty: difficulty as string,
      })
      .returning();
    res.status(201).send(newQuestion[0]);
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "server crushed" });
  }
};
