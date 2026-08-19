import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * سجل علني للشهادات التعليمية. لا نخزن هنا إجابات المتعلم أو بيانات حساسة؛
 * النتيجة المعروضة في صفحة التحقق هي الحد الأدنى المطلوب لتأكيد الإكمال.
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  certificateId: varchar("certificateId", { length: 40 }).notNull().unique(),
  learnerName: varchar("learnerName", { length: 120 }).notNull(),
  courseTitle: varchar("courseTitle", { length: 160 }).notNull(),
  completedLessons: int("completedLessons").notNull(),
  totalLessons: int("totalLessons").notNull(),
  finalReviewScore: int("finalReviewScore").notNull(),
  status: mysqlEnum("status", ["valid", "revoked"]).default("valid").notNull(),
  revokedAt: timestamp("revokedAt"),
  revocationReason: varchar("revocationReason", { length: 240 }),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
