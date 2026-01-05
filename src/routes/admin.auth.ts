import { Router } from "express";
import { checkExact, body, oneOf } from "express-validator";
import {
  getQuestionforAdmin,
  postQuestions,
} from "../controllers/admin.controller.js";
import { adminAuthMiddleware } from "../middleware/admin.auth.middleware.js";
import { authSchemaMiddleware } from "../middleware/schema.middleware.js";

const router = Router();

router.get("/questions", adminAuthMiddleware, getQuestionforAdmin);

router.post(
  "/question",
  adminAuthMiddleware,
  body("answer").isString().trim().notEmpty().withMessage("Answer is required"),
  body("difficulty")
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),

  body("clubs")
    .isArray({ min: 1 })
    .withMessage("Clubs must be a non-empty array"),

  body("clubs.*.name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each club must have a name"),

  body("clubs.*.logo")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each club must have a logo"),
  checkExact(),
  authSchemaMiddleware,
  postQuestions,
);

export default router;
