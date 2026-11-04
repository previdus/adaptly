import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const families = sqliteTable("families", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  salt: text("salt").notNull(),
  password: text("password").notNull(),
  state: text("state").notNull(),
  session: text("session"),
  expires: integer("expires"),
});

export const loginLimits = sqliteTable("login_limits", {
  id: text("id").primaryKey(),
  count: integer("count").notNull(),
  bucket: integer("bucket").notNull(),
});

export const pilotProfiles = sqliteTable("pilot_profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  state: text("state").notNull(),
});

export const pilotSessions = sqliteTable("pilot_sessions", {
  token: text("token").primaryKey(),
  profileId: text("profile_id").notNull(),
  expires: integer("expires").notNull(),
});
