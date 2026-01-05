import { Request, Response } from "express";
import { userStats, users } from "../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "../db/db.js";

export async function leaderBoardController(req: Request, res: Response) {
  try {
    const leaderboard = await db
      .select({
        username: users.username,
        totalPoints: userStats.totalPoints,
        twitter: users.twitter, // or totalPoints, based on your column name
      })
      .from(userStats)
      .innerJoin(users, eq(userStats.userId, users.id))
      .orderBy(desc(userStats.totalPoints))
      .limit(10); // Start with top 10 for the MVP

    res.json(leaderboard);
  } catch (e) {
    res
      .status(500)
      .send({ error: "Server error.Please refresh the page again" });
  }
}

export async function findUserInLeaderBoard(req: Request, res: Response) {
  try {
    // If user is logged in

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user?.userId!));
    if (user[0] === undefined) {
      return res
        .status(401)
        .send({ error: "Could not find any user. Please login or register" });
    }
    let userRankInfo = await db.execute(sql`
            SELECT rank,total_points as totalPoints FROM (
                SELECT 
                    user_id,
                    total_points, 
                    RANK() OVER (ORDER BY total_points DESC, games_played ASC) as rank 
                FROM ${userStats}
            ) as rankings
            WHERE user_id = ${req.user?.userId}
        `);
    const points =
      userRankInfo.rows.length > 0 ? userRankInfo.rows[0].totalpoints : 0;
    const rank = userRankInfo.rows.length > 0 ? userRankInfo.rows[0].rank : 0;

    res.json({
      currentRank: rank,
      points: points,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ error: "Server error.Please refresh the page again" });
  }
}
