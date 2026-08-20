import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  sessionVersion: int("sessionVersion").default(0).notNull(),
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
  ownerUserId: int("ownerUserId"),
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

/** بيانات دخول محلية اختيارية للمتعلم؛ كلمة المرور لا تحفظ إلا كتجزئة bcrypt. */
export const learnerAccounts = mysqlTable("learner_accounts", {
  userId: int("userId").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 120 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt").defaultNow().notNull(),
});

/** لقطة تقدم واحدة لكل متعلم تندمج خادميًا ولا تسمح لجهاز متأخر بمحو إنجاز أحدث. */
export const learnerProgress = mysqlTable("learner_progress", {
  userId: int("userId").primaryKey(),
  completedLessonsJson: text("completedLessonsJson").notNull(),
  watchedVideosJson: text("watchedVideosJson").notNull(),
  quizAttemptsJson: text("quizAttemptsJson").notNull(),
  lastLessonId: varchar("lastLessonId", { length: 80 }),
  finalReviewJson: text("finalReviewJson").notNull(),
  courseCompletedAt: timestamp("courseCompletedAt"),
  certificateId: varchar("certificateId", { length: 40 }),
  importedAt: timestamp("importedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * رموز استعادة كلمة المرور: نخزن تجزئة SHA-256 فقط، ولا نخزن القيمة القابلة
 * للاستخدام التي قد تصل إلى قناة البريد في المستقبل.
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
export type LearnerAccount = typeof learnerAccounts.$inferSelect;
export type LearnerProgress = typeof learnerProgress.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
