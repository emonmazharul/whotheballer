import { Request, Response, NextFunction } from "express";

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers[process.env.ADMIN_HEADER!];
  if (!authHeader) {
    return res.status(401).json({ error: "No api key" });
  }

  try {
    const isAdmin = authHeader === process.env.ADMIN_API_KEY;
    if (!isAdmin) return res.status(401).json({ error: "invalid api attempt" });
    next();
  } catch {
    res.status(500).json({ error: "Invalid token" });
  }
};
