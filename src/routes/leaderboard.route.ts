import { Router } from "express";
import { leaderBoardController } from "../controllers/leaderboard.controller.js";
import { findUserInLeaderBoard } from "../controllers/leaderboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const router = Router();

router.get("/", leaderBoardController);
router.get("/user-standing", authMiddleware, findUserInLeaderBoard);

export default router;
