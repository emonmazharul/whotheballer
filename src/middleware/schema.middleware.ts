import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const authSchemaMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const resultArr = result.array();
    return res.status(400).send({ error: resultArr[0].msg });
  }
  next();
};
