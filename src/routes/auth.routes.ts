import { Router } from "express";
import { checkExact, body, param } from "express-validator";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  applyResetPassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authSchemaMiddleware } from "../middleware/schema.middleware.js";
const router = Router();

router.post(
  "/register",
  body("username")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Invalid username value"),
  body("email")
    .isString()
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Invalid email value"),
  body("password")
    .isString()
    .notEmpty()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage("Password must contain a letter and a number"),
  body("twitter")
    .isString()
    .trim()
    .notEmpty()
    .customSanitizer((val: string) => val.replace("@", "")),
  checkExact([], { message: "A required value is missing" }),
  authSchemaMiddleware,
  register,
);

router.post(
  "/login",
  body("password")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Missing password value"),
  body("email").isEmail().optional().withMessage("Invalid email"),
  body("username").isString().trim().optional().withMessage("Invalid username"),
  body().custom((value) => {
    if (!value.email && !value.username) {
      throw new Error("Provide email or username");
    }
    if (value.email && value.username) {
      throw new Error("Provide only one of email or username");
    }
    return true;
  }),
  checkExact(),
  authSchemaMiddleware,
  login,
);

router.post("/logout", authMiddleware, logout);

router.post(
  "/forgot-password",
  body("email").isEmail().trim().notEmpty().withMessage("Email is missing"),
  checkExact([], { message: "Email is missing" }),
  authSchemaMiddleware,
  forgotPassword,
);

router.get(
  "/reset-password/:resetToken",
  param("resetToken").isJWT().withMessage("Invalid reset token"),
  checkExact([], { message: "Invalid reset token" }),
  authSchemaMiddleware,
  resetPassword,
);

router.patch(
  "/reset-password/",
  body("resetToken").isJWT().trim().notEmpty().withMessage("Invalid Token"),
  body("newPassword")
    .isString()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .notEmpty()
    .withMessage("Invalid password"),
  body("confirmedNewPassword")
    .isString()
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .notEmpty()
    .withMessage("Invalid password"),
  body().custom((value) => {
    if (value.newPassword !== value.confirmedNewPassword) {
      throw new Error("Both Password must be same");
    }
    return true;
  }),

  checkExact([], { message: "Invalid Token" }),
  authSchemaMiddleware,
  applyResetPassword,
);

export default router;
