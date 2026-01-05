import { Router } from "express";
import { checkExact, query, body } from "express-validator";
import { getQuestion, submitGuess } from "../controllers/game.controller.js";
import { gameMiddleWare } from "../middleware/game.guess.middleware.js";

const router = Router();

router.get(
  "/question",
  checkExact([
    query("difficulty")
      .isString()
      .trim()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty value")
      .optional(),
  ]),
  gameMiddleWare,
  getQuestion,
);

router.post(
  "/guess",
  checkExact([
    body("questionId").isUUID().notEmpty(),
    body("guess")
      .isString()
      .notEmpty()
      .trim()
      .withMessage("invalid guess value"),
  ]),
  gameMiddleWare,
  submitGuess,
);

export default router;
