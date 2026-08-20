import { describe, expect, it, vi } from "vitest";
import { COOKIE_NAME, OAUTH_STATE_COOKIE, encodeOAuthState } from "../shared/const";

const mocks = vi.hoisted(() => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  recordAdminAuditEvent: vi.fn(),
  exchangeCodeForToken: vi.fn(),
  getUserInfo: vi.fn(),
  createSessionToken: vi.fn(),
}));

vi.mock("./db", () => ({
  upsertUser: mocks.upsertUser,
  getUserByOpenId: mocks.getUserByOpenId,
  recordAdminAuditEvent: mocks.recordAdminAuditEvent,
}));
vi.mock("./_core/sdk", () => ({ sdk: {
  exchangeCodeForToken: mocks.exchangeCodeForToken,
  getUserInfo: mocks.getUserInfo,
  createSessionToken: mocks.createSessionToken,
} }));
vi.mock("./_core/cookies", () => ({ getSessionCookieOptions: vi.fn(() => ({ secure: true, sameSite: "none", httpOnly: true, path: "/" })) }));

import { registerOAuthRoutes } from "./_core/oauth";

describe("تدقيق دخول المدير عبر OAuth", () => {
  it("يسجل دخول المدير بعد نجاح المصادقة ويكمل إنشاء الجلسة", async () => {
    let callback: ((request: any, response: any) => Promise<void>) | undefined;
    registerOAuthRoutes({ get: (_path: string, handler: typeof callback) => { callback = handler; } } as never);
    mocks.exchangeCodeForToken.mockResolvedValue({ accessToken: "access-token" });
    mocks.getUserInfo.mockResolvedValue({ openId: "owner-open-id", name: "مدير الأكاديمية", email: "owner@example.test", loginMethod: "manus" });
    mocks.getUserByOpenId.mockResolvedValue({ id: 71, role: "admin", loginMethod: "manus" });
    mocks.createSessionToken.mockResolvedValue("session-token");
    const nonce = "nonce-for-admin-login";
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn(), clearCookie: vi.fn(), cookie: vi.fn(), redirect: vi.fn() };

    await callback!({
      query: { code: "authorization-code", state: encodeOAuthState({ redirectUri: "https://example.test", nonce }) },
      headers: { cookie: `${OAUTH_STATE_COOKIE}=${nonce}` },
    }, response);

    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "owner-open-id" }));
    expect(mocks.recordAdminAuditEvent).toHaveBeenCalledWith({
      actorUserId: 71,
      action: "admin.logged_in",
      targetType: "session",
      targetId: "71",
      result: "success",
      metadata: { loginMethod: "manus" },
    });
    expect(response.cookie).toHaveBeenCalledWith(COOKIE_NAME, "session-token", expect.objectContaining({ maxAge: expect.any(Number) }));
    expect(response.redirect).toHaveBeenCalledWith(302, "/");
  });
});
