import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) {
    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : forwardedProto.split(",");

    if (protoList.some(proto => proto.trim().toLowerCase() === "https")) return true;
  }

  // خلف بعض الوكلاء لا يعكس req.hostname اسم النطاق الذي يستخدمه المتصفح.
  // رأس Host هو المصدر الأقرب للطلب الأصلي؛ استخدمه أولًا كي لا يصدر نطاق منشور
  // Cookie SameSite=None بلا Secure، وهو مرفوض من المتصفحات الحديثة.
  const host = (req.headers.host || req.hostname || "").split(":")[0].toLowerCase();
  return Boolean(host && !LOCAL_HOSTS.has(host) && !isIpAddress(host));
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}
