import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

type AuthMode = "login" | "register";

function academyReturnTarget() {
  const requested = new URLSearchParams(window.location.search).get("returnTo");
  if (!requested) return "/";

  try {
    const candidate = new URL(requested, window.location.origin);
    return candidate.origin === window.location.origin && (candidate.pathname === "/" || candidate.pathname === "/dashboard")
      ? `${candidate.pathname}${candidate.search}${candidate.hash}`
      : "/";
  } catch {
    return "/";
  }
}

function authRoute(pathname: string, returnTo: string) {
  return returnTo === "/" ? pathname : `${pathname}?returnTo=${encodeURIComponent(returnTo)}`;
}

function safeAuthError(message: string | undefined, isRegister: boolean) {
  if (!message) return undefined;
  if (/abort|timeout|timed out/i.test(message)) return "انتهت مهلة الاتصال. تحقق من الشبكة ثم أعد المحاولة.";
  if (message === "البريد الإلكتروني أو كلمة المرور غير صحيحين." || message === "البريد الإلكتروني مستخدم بالفعل.") return message;
  return isRegister ? "تعذر إنشاء الحساب الآن. أعد المحاولة بعد لحظات." : "تعذر تسجيل الدخول الآن. أعد المحاولة بعد لحظات.";
}

export default function LearnerAuth({ mode }: { mode: AuthMode }) {
  const me = trpc.learner.me.useQuery();
  const returnTo = academyReturnTarget();
  const login = trpc.learner.login.useMutation({ onSuccess: () => { window.location.assign(returnTo); } });
  const register = trpc.learner.register.useMutation({ onSuccess: () => { window.location.assign(returnTo); } });
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!me.isPending && me.data?.authenticated) window.location.assign(returnTo);
  }, [me.data?.authenticated, me.isPending, returnTo]);

  const isRegister = mode === "register";
  const isPending = login.isPending || register.isPending;
  const error = safeAuthError(login.error?.message || register.error?.message, isRegister);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isRegister) register.mutate({ displayName, email, password });
    else login.mutate({ email, password });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071521] text-slate-100" dir="rtl">
      <div className="mx-auto grid min-h-screen max-w-6xl items-stretch lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative overflow-hidden bg-[#0c2638] px-5 py-10 sm:px-10 lg:px-14">
          <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_15%_20%,rgba(55,209,178,.28),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(76,140,255,.28),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <a href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-white">
              <ArrowRight className="h-4 w-4" /> العودة إلى الأكاديمية
            </a>
            <div className="max-w-xl">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-300 text-[#082233] shadow-lg shadow-teal-950/30">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="mb-3 text-sm font-semibold tracking-[.18em] text-teal-200">أكاديمية هياكل البيانات</p>
              <h1 className="text-3xl font-bold leading-[1.55] text-white sm:text-4xl">
                تقدّمك التعليمي، محفوظ معك أينما تابعت.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-8 text-slate-300 sm:text-base">
                اربط إنجاز الدروس، مشاهدة الفيديوهات، نتائج الاختبارات، وشهادتك بحسابك. لا تُحفظ كلمة المرور إلا بصيغة مشفّرة آمنة.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4 text-sm leading-7 text-slate-200">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />
              <span>يمكنك البدء من هاتفك ومتابعة الدرس نفسه من أي جهاز بعد تسجيل الدخول.</span>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#f7fafc] px-5 py-10 text-slate-900 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-bold text-teal-700">حساب المتعلم</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              {isRegister ? "أنشئ حسابك" : "مرحبًا بعودتك"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {isRegister ? "أدخل بيانات بسيطة لحفظ تقدمك ومتابعته عبر الأجهزة." : "سجّل الدخول لاستعادة تقدمك وملفك التعليمي."}
            </p>

            <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
              {isRegister && (
                <label className="block text-sm font-bold text-slate-800">
                  الاسم المعروض
                  <input value={displayName} onChange={event => setDisplayName(event.target.value)} required minLength={2} maxLength={120} autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-right outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100" placeholder="مثال: أحمد علي" />
                </label>
              )}
              <label className="block text-sm font-bold text-slate-800">
                البريد الإلكتروني
                <input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" dir="ltr" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-left outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100" placeholder="name@example.com" />
              </label>
              <label className="block text-sm font-bold text-slate-800">
                كلمة المرور
                <input type="password" value={password} onChange={event => setPassword(event.target.value)} required minLength={isRegister ? 12 : 1} maxLength={128} autoComplete={isRegister ? "new-password" : "current-password"} dir="ltr" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-left outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100" placeholder={isRegister ? "12 حرفًا على الأقل" : "كلمة المرور"} />
              </label>
              {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{error}</p>}
              <button disabled={isPending} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#0d6e68] px-5 text-sm font-extrabold text-white shadow-lg shadow-teal-900/15 transition hover:bg-[#095c57] disabled:cursor-wait disabled:opacity-60 active:scale-[.98]" type="submit">
                {isPending ? "جارٍ المتابعة…" : isRegister ? "إنشاء الحساب والمتابعة" : "تسجيل الدخول"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب بعد؟"}{" "}
              <Link href={authRoute(isRegister ? "/login" : "/register", returnTo)} className="font-bold text-teal-700 underline decoration-teal-300 underline-offset-4">
                {isRegister ? "سجّل الدخول" : "أنشئ حسابًا"}
              </Link>
            </p>
            {!isRegister && <p className="mt-4 text-center text-sm"><Link href="/forgot-password" className="font-bold text-teal-700 underline decoration-teal-300 underline-offset-4">نسيت كلمة المرور؟</Link></p>}
          </div>
        </section>
      </div>
    </main>
  );
}
