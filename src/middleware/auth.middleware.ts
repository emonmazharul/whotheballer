import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";

interface ModifiedRequest extends Request {
  user?: { userId: string };
}

export const authMiddleware = async (
  req: ModifiedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "You are not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));
    if (user.length === 0) {
      return res.status(401).json({ error: "You are not authenticated" });
    }
    const userToken = user[0].tokens.find((item) => item === token);
    if (!userToken) {
      return res.status(401).json({ error: "You are not authenticated" });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "App crushed. Try again." });
  }
};
