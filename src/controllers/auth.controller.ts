import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { eq, or } from "drizzle-orm";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import jwt from "jsonwebtoken";
import { findUserByEmailOrUsername } from "../utils/findUser.js";
import { sendResetPasswordEmail } from "../utils/sendPasswordResetEmail.js";

export const register = async (req: Request, res: Response) => {
  const { username, email, password, twitter } = req.body;

  try {
    // chekk if user exist with either given email or username
    const existingUser = await findUserByEmailOrUsername(email, username);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exist with either username/email." });
    }
    const passwordHash = await hashPassword(password);

    const userId = uuidv4();
    const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    const user = await db
      .insert(users)
      .values({
        id: userId,
        tokens: [token],
        username,
        email,
        passwordHash,
        twitter,
      })
      .returning();

    res.status(201).json({
      token: token,
      user: {
        isAuthenticated: true,
        username: user[0].username,
        email: user[0].email,
        twitter: user[0].twitter,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ error: "Server crushed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  const user = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);

  if (!user.length) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await verifyPassword(password, user[0].passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  const tokens = [...user[0].tokens, token];
  await db
    .update(users)
    .set({
      tokens,
    })
    .where(or(eq(users.email, email), eq(users.username, username)));

  res.json({
    token,
    user: {
      isAuthenticated: true,
      username: user[0].username,
      email: user[0].email,
      twitter: user[0].twitter,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user?.userId!));
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    const filteredToken = user[0].tokens.filter((item) => item !== token);
    await db
      .update(users)
      .set({
        tokens: filteredToken,
      })
      .where(eq(users.id, req.user?.userId!));
    res.json({ message: "your are loged out" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: "Server crushed" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, req.body.email));
    if (user[0] === undefined)
      return res
        .status(404)
        .send({ error: "No account found with this email address." });
    const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET!, {
      expiresIn: "5m",
    });
    const resetLink = `${process.env.DOMAIN}/reset-password/${token}`;
    const userEmail = user[0].email;
    const emailResponse = await sendResetPasswordEmail(
      user[0].username,
      resetLink,
      userEmail,
    ); // replace the admin email with req.body.email
    if (emailResponse.error) {
      return res.status(400).send({
        error: "Server Failed to send email. Please try again later.",
      });
    }
    return res.status(200).send({
      message:
        "If an account exists for that email, we have sent a reset link.",
    });
  } catch (e) {
    res.status(500).send({
      error: "Server crushed. Please try again",
    });
  }
};

export const resetPassword = (req: Request, res: Response) => {
  try {
    const tokenVerified = jwt.verify(
      req.params.resetToken,
      process.env.JWT_SECRET!,
    );
    res.send(tokenVerified);
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .send({
        error: "request expired",
        message: "Please try again as this session has already been expired",
      });
  }
};

export const applyResetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;
    // check if both password is same
    const token_data = jwt.verify(resetToken, process.env.JWT_SECRET!) as {
      email: string;
    };
    const passwordHash = await hashPassword(newPassword);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, token_data.email));

    if (user.length === 0) {
      return res.status(404).send({
        error: `No user found with the given email.`,
      });
    }
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

    const updatedUser = await db
      .update(users)
      .set({
        passwordHash: passwordHash,
      })
      .where(eq(users.email, token_data.email))
      .returning();

    // last check if ther password is updated
    if (updatedUser.length === 0) throw new Error("Session has been expired");

    return res
      .status(201)
      .send({
        message: "Password has been updated.Now login with the new password",
      });
  } catch (e) {
    res
      .status(400)
      .send({ error: "Session expired.Please request another link" });
  }
};
