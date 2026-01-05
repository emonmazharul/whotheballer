import { Request, Response } from "express";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { findUserByEmailOrUsername } from "../utils/findUser.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).send({ error: "Unauthorized request" });
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user[0])
      return res.status(401).send({ error: "Unauthorized request" });
    res.json({
      isAuthenticated: true,
      username: user[0].username,
      email: user[0].email,
      twitter: user[0].twitter,
    });
  } catch (e) {
    console.log(e);
    res.send({ error: "Server crushed" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  try {
    // chekk if user exist with either given email or username
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user.length === 0) {
      return res.status(404).send({
        error: "Failed to update as did not find any user with the given data",
      });
    }

    // check if any user exist with the same email/username
    const email = req.body.email || "";
    const username = req.body.username || "";
    const existingUser = await findUserByEmailOrUsername(email, username);
    if (existingUser?.id) {
      return res.status(400).send({
        error: "A user already exist with this email/username",
      });
    }
    const updatedUser = await db
      .update(users)
      .set({
        ...req.body,
      })
      .where(eq(users.id, userId))
      .returning();

    res.status(201).send({
      message: "Updated user info successfully",
      user: {
        username: updatedUser[0].username,
        email: updatedUser[0].email,
        twitter: updatedUser[0].twitter,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ error: "Server crushed, Please try again." });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const { newPassword, currentPassword } = req.body;

    const user = await db.select().from(users).where(eq(users.id, userId));

    if (user.length === 0) {
      return res.status(404).send({
        error:
          "Failed to update password as did not find any user with the given data",
      });
    }
    const isCurrentPasswordCorrect = await verifyPassword(
      currentPassword,
      user[0].passwordHash,
    );
    if (isCurrentPasswordCorrect === false) {
      return res.status(400).send({
        error: "Your current password is not correct",
      });
    }

    // we could skip this part
    // but for be very accureate kept the condition
    const isPasswordSame = await verifyPassword(
      newPassword,
      user[0].passwordHash,
    );
    // check if ther user is given the same password again
    if (isPasswordSame) {
      return res.status(400).send({
        error:
          "Your new password cannot be the same as your current password. Please choose a different one to improve your account security.",
      });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
      })
      .where(eq(users.id, userId))
      .returning();

    return res.status(201).send({ message: "Password has been updated." });
  } catch (e) {
    res.status(400).send({ error: "Server crushed. Please try again." });
  }
};
