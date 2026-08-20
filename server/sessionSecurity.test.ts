import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request } from "express";
import { COOKIE_NAME } from "../shared/const";

const dbMocks = vi.hoisted(() => ({
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { sdk } from "./_core/sdk";

describe("حماية إصدار الجلسات المحلية", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("يرفض JWT منتهي الصلاحية", async () => {
    const expiredToken = await sdk.createSessionToken("local:101", {
      name: "ليان أحمد",
      sessionVersion: 3,
      expiresInMs: -5_000,
    });

    await expect(sdk.verifySession(expiredToken)).resolves.toBeNull();
  });

  it("يرفض جلسة جهاز قديم بعد زيادة إصدار الجلسة ويقبل الإصدار الجديد فقط", async () => {
    dbMocks.getUserByOpenId.mockResolvedValue({
      id: 101,
      openId: "local:101",
      name: "ليان أحمد",
      email: "learner-101@example.test",
      loginMethod: "email",
      role: "user",
      sessionVersion: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });
    const oldToken = await sdk.createSessionToken("local:101", { name: "ليان أحمد", sessionVersion: 7 });
    const freshToken = await sdk.createSessionToken("local:101", { name: "ليان أحمد", sessionVersion: 8 });
    const requestWith = (token: string) => ({ headers: { cookie: `${COOKIE_NAME}=${token}` } }) as Request;

    await expect(sdk.authenticateRequest(requestWith(oldToken))).rejects.toMatchObject({ message: "Session invalidated" });
    await expect(sdk.authenticateRequest(requestWith(freshToken))).resolves.toMatchObject({ id: 101, sessionVersion: 8 });
  });

  it("يرفض جلسة الحساب المحلي المحذوف ولا يحاول إعادة إنشاء هويته", async () => {
    dbMocks.getUserByOpenId.mockResolvedValue(undefined);
    const staleToken = await sdk.createSessionToken("local:101", { name: "ليان أحمد", sessionVersion: 8 });
    const request = { headers: { cookie: `${COOKIE_NAME}=${staleToken}` } } as Request;

    await expect(sdk.authenticateRequest(request)).rejects.toMatchObject({ message: "User not found" });
    expect(dbMocks.upsertUser).not.toHaveBeenCalled();
  });
});
