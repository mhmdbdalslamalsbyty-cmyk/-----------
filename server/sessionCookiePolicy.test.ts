import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";

function requestLike({
  protocol = "http",
  hostname,
  host,
  forwardedProto,
}: {
  protocol?: string;
  hostname: string;
  host?: string;
  forwardedProto?: string;
}) {
  return {
    protocol,
    hostname,
    headers: {
      host: host ?? hostname,
      ...(forwardedProto ? { "x-forwarded-proto": forwardedProto } : {}),
    },
  } as Request;
}

describe("سياسة Cookie الجلسة", () => {
  it("تحفظ Secure على نطاق منشور حتى إذا لم يمرر الوكيل x-forwarded-proto", () => {
    const options = getSessionCookieOptions(
      requestLike({ hostname: "dataacad-djtmwrgg.manus.space" })
    );

    expect(options).toMatchObject({ httpOnly: true, path: "/", sameSite: "none", secure: true });
  });

  it("تفضل رأس Host المنشور على اسم مضيف داخلي يورده الوكيل", () => {
    const options = getSessionCookieOptions(
      requestLike({ hostname: "localhost", host: "dataacad-djtmwrgg.manus.space" })
    );

    expect(options.secure).toBe(true);
  });

  it("تسمح بالتطوير المحلي غير المشفر فقط", () => {
    expect(getSessionCookieOptions(requestLike({ hostname: "localhost" })).secure).toBe(false);
    expect(
      getSessionCookieOptions(
        requestLike({ hostname: "127.0.0.1", forwardedProto: "https" })
      ).secure
    ).toBe(true);
  });
});
