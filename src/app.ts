import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import gameRoutes from "./routes/game.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import leaderBoardRoutes from "./routes/leaderboard.route.js";
import adminRoutes from "./routes/admin.auth.js";

const app = express();

const __dirname = path.resolve();

const publicPath = path.join(__dirname, ".", "public");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(publicPath));
app.use("/api/game", gameRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/leaderboard", leaderBoardRoutes);
app.use("/api/admin", adminRoutes);

app.get("*everything", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;
