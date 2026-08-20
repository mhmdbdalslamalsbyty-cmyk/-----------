import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_NAME } from "../shared/const";

const mocks = vi.hoisted(() => ({
  attachCertificateToLearnerProgress: vi.fn(),
  consumePasswordResetToken: vi.fn(),
  createCertificate: vi.fn(),
  createLearnerAccount: vi.fn(),
  deleteLearnerAccountAndPrivateData: vi.fn(),
  exportLearnerData: vi.fn(),
  getCertificateById: vi.fn(),
  getCertificateByOwner: vi.fn(),
  getLearnerAccountByEmail: vi.fn(),
  getLearnerAccountByUserId: vi.fn(),
  getLearnerProgress: vi.fn(),
  getUserById: vi.fn(),
  getUserByOpenId: vi.fn(),
  markLearnerCourseCompleted: vi.fn(),
  recordAdminAuditEvent: vi.fn(),
  revokeCertificate: vi.fn(),
  rotateLearnerPasswordAndInvalidateSessions: vi.fn(),
  setUserOpenId: vi.fn(),
  updateLearnerAccountLogin: vi.fn(),
  updateLearnerDisplayName: vi.fn(),
  upsertLearnerProgress: vi.fn(),
  upsertUser: vi.fn(),
  createSessionToken: vi.fn(),
}));

vi.mock("./db", () => mocks);
vi.mock("./_core/sdk", () => ({ sdk: { createSessionToken: mocks.createSessionToken } }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextFor(userId: number): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `local:${userId}`,
      email: `learner-${userId}@example.test`,
      name: `متعلم ${userId}`,
      loginMethod: "email",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function guestContext() {
  const cookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
  const ctx = {
    user: null,
    req: { protocol: "https", headers: {} },
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => cookies.push({ name, value, options }),
      clearCookie: (name: string, options: Record<string, unknown>) => clearedCookies.push({ name, options }),
    },
  } as unknown as TrpcContext;
  return { ctx, cookies, clearedCookies };
}

function storedProgress(userId: number, overrides: Record<string, unknown> = {}) {
  return {
    userId,
    completedLessonsJson: JSON.stringify({ array: { completed: true } }),
    watchedVideosJson: JSON.stringify({ array: { percent: 82, completed: true } }),
    quizAttemptsJson: JSON.stringify({ array: { answers: { 0: 1 }, attempts: 2, bestScore: 100 } }),
    finalReviewJson: JSON.stringify({ answers: {}, submitted: false }),
    lastLessonId: "array",
    courseCompletedAt: null,
    certificateId: null,
    importedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("حساب المتعلم والتقدم المعزول", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.upsertLearnerProgress.mockImplementation(async (userId: number) => storedProgress(userId));
    mocks.getLearnerProgress.mockImplementation(async (userId: number) => storedProgress(userId));
  });

  it("ينشئ حسابًا جديدًا بكلمة مرور مشفرة ويكتب جلسة محمية", async () => {
    const { ctx, cookies } = guestContext();
    mocks.getLearnerAccountByEmail.mockResolvedValue(undefined);
    mocks.getUserByOpenId.mockResolvedValue({ id: 303, sessionVersion: 0 });
    mocks.createLearnerAccount.mockImplementation(async (input: { userId: number; email: string; passwordHash: string; displayName: string }) => input);
    mocks.createSessionToken.mockResolvedValue("signed-local-session");

    const result = await appRouter.createCaller(ctx).learner.register({
      email: "Learner@Example.Test",
      password: "A-strong-local-password",
      displayName: "  ليان   أحمد ",
    });

    const accountInput = mocks.createLearnerAccount.mock.calls[0]?.[0] as { userId: number; email: string; passwordHash: string; displayName: string };
    expect(accountInput).toMatchObject({ userId: 303, email: "learner@example.test", displayName: "ليان أحمد" });
    expect(accountInput.passwordHash).not.toBe("A-strong-local-password");
    await expect(bcrypt.compare("A-strong-local-password", accountInput.passwordHash)).resolves.toBe(true);
    expect(mocks.setUserOpenId).toHaveBeenCalledWith(303, "local:303");
    expect(mocks.createSessionToken).toHaveBeenCalledWith("local:303", { name: "ليان أحمد", sessionVersion: 0 });
    expect(cookies).toContainEqual(expect.objectContaining({ name: COOKIE_NAME, value: "signed-local-session", options: expect.objectContaining({ httpOnly: true, secure: true, sameSite: "none" }) }));
    expect(result).toMatchObject({ authenticated: true, account: { email: "learner@example.test", displayName: "ليان أحمد" } });
  });

  it("يتحقق من كلمة المرور عند الدخول ثم ينشئ جلسة للحساب نفسه ويرفض البيانات الخاطئة", async () => {
    const { ctx, cookies } = guestContext();
    const passwordHash = await bcrypt.hash("A-strong-local-password", 12);
    mocks.getLearnerAccountByEmail.mockResolvedValue({ userId: 303, email: "learner@example.test", passwordHash, displayName: "ليان أحمد" });
    mocks.getUserById.mockResolvedValue({ id: 303, openId: "local:303", sessionVersion: 0 });
    mocks.createSessionToken.mockResolvedValue("second-signed-session");

    await expect(appRouter.createCaller(ctx).learner.login({ email: "learner@example.test", password: "A-strong-local-password" })).resolves.toMatchObject({ authenticated: true });
    expect(mocks.updateLearnerAccountLogin).toHaveBeenCalledWith(303);
    expect(mocks.createSessionToken).toHaveBeenCalledWith("local:303", { name: "ليان أحمد", sessionVersion: 0 });
    expect(cookies).toContainEqual(expect.objectContaining({ name: COOKIE_NAME, value: "second-signed-session" }));

    await expect(appRouter.createCaller(guestContext().ctx).learner.login({ email: "learner@example.test", password: "wrong-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("يحذف جلسة الحساب المحلي عند تسجيل الخروج", async () => {
    const { ctx, clearedCookies } = guestContext();
    await expect(appRouter.createCaller(ctx).learner.logout()).resolves.toEqual({ success: true });
    expect(clearedCookies).toContainEqual(expect.objectContaining({ name: COOKIE_NAME, options: expect.objectContaining({ maxAge: -1, httpOnly: true, secure: true }) }));
  });

  it("لا يكشف وجود الحساب عند طلب الاستعادة حين لا تكون خدمة البريد متاحة", async () => {
    const caller = appRouter.createCaller(guestContext().ctx);
    const known = await caller.learner.requestPasswordReset({ email: "learner@example.test" });
    const unknown = await caller.learner.requestPasswordReset({ email: "unknown@example.test" });

    expect(known).toEqual({ accepted: true, deliveryAvailable: false });
    expect(unknown).toEqual(known);
    expect(mocks.getLearnerAccountByEmail).not.toHaveBeenCalled();
  });

  it("يستهلك رمز إعادة التعيين المجزأ مرة واحدة ويمسح جلسة المتصفح", async () => {
    const { ctx, clearedCookies } = guestContext();
    const rawToken = "a".repeat(48);
    mocks.consumePasswordResetToken.mockResolvedValue(true);

    await expect(appRouter.createCaller(ctx).learner.resetPassword({
      token: rawToken,
      password: "A-strong-reset-password",
    })).resolves.toEqual({ reset: true });

    const [tokenHash, passwordHash] = mocks.consumePasswordResetToken.mock.calls[0] as [string, string];
    expect(tokenHash).toHaveLength(64);
    expect(tokenHash).not.toBe(rawToken);
    expect(passwordHash).not.toBe("A-strong-reset-password");
    await expect(bcrypt.compare("A-strong-reset-password", passwordHash)).resolves.toBe(true);
    expect(clearedCookies).toContainEqual(expect.objectContaining({ name: COOKIE_NAME }));

    mocks.consumePasswordResetToken.mockResolvedValue(false);
    await expect(appRouter.createCaller(guestContext().ctx).learner.resetPassword({
      token: rawToken,
      password: "A-strong-reset-password",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("يرفض رمز إعادة تعيين منتهي الصلاحية دون كشف تفاصيل السبب", async () => {
    mocks.consumePasswordResetToken.mockResolvedValue(false);

    await expect(appRouter.createCaller(guestContext().ctx).learner.resetPassword({
      token: "b".repeat(48),
      password: "A-strong-reset-password",
    })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "رابط إعادة التعيين غير صالح أو انتهت صلاحيته." });
  });

  it("يرفض رمز إعادة تعيين استُخدم سابقًا ولا يعيد تدوير كلمة المرور", async () => {
    mocks.consumePasswordResetToken.mockResolvedValue(false);

    await expect(appRouter.createCaller(guestContext().ctx).learner.resetPassword({
      token: "c".repeat(48),
      password: "A-strong-reset-password",
    })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "رابط إعادة التعيين غير صالح أو انتهت صلاحيته." });
    expect(mocks.consumePasswordResetToken).toHaveBeenCalledTimes(1);
  });

  it("يدوّر كلمة المرور ويُصدر جلسة بإصدار خادمي جديد فقط لصاحب الحساب", async () => {
    const passwordHash = await bcrypt.hash("A-strong-current-password", 12);
    mocks.getLearnerAccountByUserId.mockResolvedValue({
      userId: 101,
      email: "learner-101@example.test",
      passwordHash,
      displayName: "ليان أحمد",
    });
    mocks.getUserById.mockResolvedValue({ id: 101, openId: "local:101", sessionVersion: 7 });
    mocks.rotateLearnerPasswordAndInvalidateSessions.mockResolvedValue(8);
    mocks.createSessionToken.mockResolvedValue("rotated-session");
    const { ctx, cookies } = guestContext();
    ctx.user = contextFor(101).user;

    await expect(appRouter.createCaller(ctx).learner.changePassword({
      currentPassword: "A-strong-current-password",
      newPassword: "A-strong-next-password",
    })).resolves.toEqual({ changed: true });

    const [userId, nextHash] = mocks.rotateLearnerPasswordAndInvalidateSessions.mock.calls[0] as [number, string];
    expect(userId).toBe(101);
    await expect(bcrypt.compare("A-strong-next-password", nextHash)).resolves.toBe(true);
    expect(mocks.createSessionToken).toHaveBeenCalledWith("local:101", { name: "ليان أحمد", sessionVersion: 8 });
    expect(cookies).toContainEqual(expect.objectContaining({ name: COOKIE_NAME, value: "rotated-session" }));
  });

  it("يصدر بيانات المالك بلا تجزئة كلمة المرور ويعزلها عن مستخدم آخر", async () => {
    mocks.exportLearnerData.mockResolvedValue({
      account: {
        userId: 101,
        email: "learner-101@example.test",
        displayName: "ليان أحمد",
        passwordHash: "never-export-this",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
      progress: storedProgress(101),
      certificates: [{
        certificateId: "DSA-2026-ABCDEF1234", learnerName: "ليان أحمد", courseTitle: "هياكل البيانات للمبتدئين",
        completedLessons: 12, totalLessons: 12, finalReviewScore: 100, status: "valid", issuedAt: new Date(), revokedAt: null, revocationReason: null,
      }],
    });

    const exported = await appRouter.createCaller(contextFor(101)).learner.exportData();
    expect(mocks.exportLearnerData).toHaveBeenCalledWith(101);
    expect(JSON.stringify(exported)).not.toContain("never-export-this");
    expect(exported.account).toEqual(expect.objectContaining({ email: "learner-101@example.test", displayName: "ليان أحمد" }));
    expect(exported.progress.watchedVideos).toMatchObject({ array: { percent: 82 } });
    expect(exported.certificates).toHaveLength(1);
  });

  it("يحذف بيانات الحساب الخاصة للمستخدم المصادق عليه فقط ويمسح جلسته", async () => {
    mocks.getLearnerAccountByUserId.mockResolvedValue({ userId: 101, email: "learner-101@example.test", displayName: "ليان أحمد" });
    const { ctx, clearedCookies } = guestContext();
    ctx.user = contextFor(101).user;

    await expect(appRouter.createCaller(ctx).learner.deleteAccount({ confirmation: "حذف حسابي" })).resolves.toEqual({ deleted: true });
    expect(mocks.deleteLearnerAccountAndPrivateData).toHaveBeenCalledWith(101);
    expect(mocks.deleteLearnerAccountAndPrivateData).not.toHaveBeenCalledWith(202);
    expect(clearedCookies).toContainEqual(expect.objectContaining({ name: COOKIE_NAME }));
  });

  it("يحفظ تقدم فيديو بنسبة 82% والتقدم الأخير في حساب المستخدم نفسه", async () => {
    const caller = appRouter.createCaller(contextFor(101));

    await caller.progress.sync({
      completedLessons: { array: { completed: true } },
      watchedVideos: { array: { percent: 82, completed: true } },
      quizAttempts: { array: { answers: { 0: 1 }, attempts: 2, bestScore: 100 } },
      lastLessonId: "array",
      finalReview: { answers: {}, submitted: false },
    });

    expect(mocks.upsertLearnerProgress).toHaveBeenCalledWith(101, expect.objectContaining({
      lastLessonId: "array",
      watchedVideos: { array: { percent: 82, completed: true } },
      quizAttempts: { array: { answers: { 0: 1 }, attempts: 2, bestScore: 100 } },
    }));
  });

  it("يعيد بيانات جهاز ثانٍ لنفس الحساب من السجل الخادمي", async () => {
    const firstDevice = appRouter.createCaller(contextFor(101));
    const secondDevice = appRouter.createCaller(contextFor(101));
    mocks.getLearnerProgress.mockResolvedValue(storedProgress(101));

    const first = await firstDevice.progress.get();
    const second = await secondDevice.progress.get();

    expect(first).toEqual(second);
    expect(second.watchedVideos).toMatchObject({ array: { percent: 82, completed: true } });
    expect(mocks.getLearnerProgress).toHaveBeenNthCalledWith(1, 101);
    expect(mocks.getLearnerProgress).toHaveBeenNthCalledWith(2, 101);
  });

  it("يعزل القراءة والكتابة بين مستخدمين حتى عند استخدام معرّفات دروس متطابقة", async () => {
    const learnerA = appRouter.createCaller(contextFor(101));
    const learnerB = appRouter.createCaller(contextFor(202));
    mocks.getLearnerProgress.mockImplementation(async (userId: number) => storedProgress(userId, {
      lastLessonId: userId === 101 ? "array" : "graphs",
    }));

    await learnerA.progress.sync({ completedLessons: { array: { completed: true } }, watchedVideos: {}, quizAttempts: {}, lastLessonId: "array", finalReview: {} });
    const bProgress = await learnerB.progress.get();

    expect(mocks.upsertLearnerProgress).toHaveBeenCalledWith(101, expect.any(Object));
    expect(mocks.upsertLearnerProgress).not.toHaveBeenCalledWith(202, expect.any(Object));
    expect(bProgress.lastLessonId).toBe("graphs");
    expect(mocks.getLearnerProgress).toHaveBeenCalledWith(202);
  });

  it("يربط شهادة المتعلم بمالك الجلسة ولا يمنحها لمستخدم آخر", async () => {
    const completed = Object.fromEntries([
      "why-data-structures", "array", "singly-linked-basics", "singly-linked-operations", "doubly-linked", "stack-array",
      "stack-linked", "queue-array", "queue-linked", "recursion", "trees", "graphs",
    ].map(lessonId => [lessonId, { completed: true }]));
    const reviewAnswers = {
      "why-data-structures": 1, array: 0, "singly-linked-basics": 0, "singly-linked-operations": 1, "doubly-linked": 0,
      "stack-array": 1, "stack-linked": 0, "queue-array": 0, "queue-linked": 0, recursion: 0, trees: 0, graphs: 0,
    };
    const progress = storedProgress(101, { completedLessonsJson: JSON.stringify(completed), finalReviewJson: JSON.stringify({ answers: reviewAnswers, submitted: true }), courseCompletedAt: new Date() });
    mocks.getLearnerProgress.mockResolvedValue(progress);
    mocks.getLearnerAccountByUserId.mockResolvedValue({ userId: 101, email: "learner-101@example.test", displayName: "ليان أحمد" });
    mocks.getCertificateByOwner.mockResolvedValue(undefined);
    mocks.createCertificate.mockResolvedValue({
      certificateId: "DSA-2026-ABCDEF1234", learnerName: "ليان أحمد", courseTitle: "هياكل البيانات للمبتدئين",
      completedLessons: 12, totalLessons: 12, finalReviewScore: 100, status: "valid", issuedAt: new Date(), revokedAt: null, revocationReason: null,
    });

    await appRouter.createCaller(contextFor(101)).certificate.issue({ learnerName: "ليان أحمد" });

    expect(mocks.createCertificate).toHaveBeenCalledWith(expect.objectContaining({ ownerUserId: 101 }));
    expect(mocks.attachCertificateToLearnerProgress).toHaveBeenCalledWith(101, "DSA-2026-ABCDEF1234");
  });
});
