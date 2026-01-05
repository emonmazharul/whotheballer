import {
  pgTable,
  text,
  uuid,
  jsonb,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clubs: jsonb("clubs").$type<{ name: string; logo: string }[]>().notNull(),
  answer: text("answer").unique().notNull(),
  answerToken: text("answer_token").notNull(),
  difficulty: text("difficulty").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  twitter: text("twitter").notNull(),
  tokens: jsonb("tokens").notNull().$type<string[]>(),
  passwordHash: text("password_hash").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const gameAttempts = pgTable("game_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  questionId: uuid("question_id").notNull(),
  correct: integer("correct").notNull(), // 1 or 0
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStats = pgTable("user_stats", {
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .primaryKey(),
  totalPoints: integer("total_points").default(0).notNull(),
  gamesPlayed: integer("games_played").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
