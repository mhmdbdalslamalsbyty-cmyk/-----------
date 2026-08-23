import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/** لا نمرر كائن Axios الخام إلى السجل؛ قد يتضمن config أو headers أو body حساسة. */
function safeOAuthFailureSummary(error: unknown) {
  const candidate = error && typeof error === "object" ? error as { code?: unknown; response?: { status?: unknown } } : null;
  const code = typeof candidate?.code === "string" && /^[A-Z0-9_-]{1,48}$/.test(candidate.code) ? candidate.code : "unknown";
  const status = typeof candidate?.response?.status === "number" && candidate.response.status >= 100 && candidate.response.status <= 599
    ? String(candidate.response.status)
    : "unavailable";
  return `code=${code} status=${status}`;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const persistedUser = await db.getUserByOpenId(userInfo.openId);
      if (persistedUser?.role === "admin") {
        try {
          await db.recordAdminAuditEvent({
            actorUserId: persistedUser.id,
            action: "admin.logged_in",
            targetType: "session",
            targetId: String(persistedUser.id),
            result: "success",
            metadata: { loginMethod: persistedUser.loginMethod ?? null },
          });
        } catch (error) {
          console.error(`[Audit] Failed to record admin OAuth login (${safeOAuthFailureSummary(error)})`);
        }
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error(`[OAuth] Callback failed (${safeOAuthFailureSummary(error)})`);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
