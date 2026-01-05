import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

export const gameMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(400).send({ error: result.array()[0].msg });

    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    req.user = decoded;
    next();
  } catch (e) {
    next();
  }
};
