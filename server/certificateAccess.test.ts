import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("صلاحيات سجل الشهادات", () => {
  it("لا يسمح لمستخدم غير إداري بإبطال شهادة", async () => {
    const ctx = {
      user: null,
      req: { protocol: "https", headers: {} },
      res: {},
    } as TrpcContext;
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.certificate.revoke({
        certificateId: "DSA-2026-EXAMPLE",
        reason: "اختبار صلاحيات الإداري",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
