import { body, checkExact } from "express-validator";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authSchemaMiddleware } from "../middleware/schema.middleware.js";
import {
  getUser,
  updateProfile,
  updatePassword,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", authMiddleware, getUser);

router.patch(
  "/",
  authMiddleware,
  body("username")
    .isString()
    .trim()
    .optional()
    .withMessage('withMessage("Please provide a updated value.")'),
  body("email")
    .isEmail()
    .trim()
    .optional()
    .withMessage("Please provide a new value."),
  body("twitter")
    .isString()
    .trim()
    .optional()
    .withMessage("Please provide a updated value."),
  body().custom((value) => {
    if (!value.email && !value.twitter && !value.username) {
      throw new Error("There is no field to update");
    }
    return true;
  }),
  checkExact(),
  authSchemaMiddleware,
  updateProfile,
);

router.patch(
  "/update-password",
  authMiddleware,
  body("currentPassword")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Please provide your current password"),
  body("newPassword")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Invalid password format"),
  body("confirmedNewPassword")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Invalid password format"),
  body().custom((value) => {
    if (value.newPassword === value.currentPassword) {
      throw new Error("Password must be different from your current password");
    }

    if (value.newPassword !== value.confirmedNewPassword) {
      throw new Error("Both password should match");
    }
    return true;
  }),
  checkExact(),
  authSchemaMiddleware,
  updatePassword,
);

export default router;
