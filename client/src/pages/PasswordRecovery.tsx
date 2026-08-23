import { ArrowRight, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function PasswordRecovery({ mode }: { mode: "request" | "reset" }) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const requestReset = trpc.learner.requestPasswordReset.useMutation({
    onSuccess: result => setMessage(result.deliveryAvailable
      ? "إذا كان البريد مرتبطًا بحساب، ستصل تعليمات الاستعادة إليه خلال دقائق."
      : "خدمة البريد لإعادة التعيين غير مفعّلة حاليًا. لا تم إنشاء رابط بديل أو عرض أي بيانات حساب."),
  });
  const resetPassword = trpc.learner.resetPassword.useMutation({ onSuccess: () => setLocation("/login") });
  const isRequest = mode === "request";
  const pending = requestReset.isPending || resetPassword.isPending;
  const rawError = requestReset.error?.message || resetPassword.error?.message;
  const isTimeout = /abort|timeout|timed out/i.test(rawError ?? "");
  const error = rawError
    ? isTimeout
      ? "انتهت مهلة الاتصال. تحقق من الشبكة ثم أعد المحاولة."
      : isRequest
      ? "تعذر إتمام طلب الاستعادة الآن. حاول لاحقًا دون أن يكشف ذلك حالة البريد."
      : "رمز الاستعادة أو كلمة المرور غير صالحين أو انتهت صلاحية الرمز."
    : "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (isRequest) {
      requestReset.mutate({ email });
      return;
    }
    if (password !== confirmPassword) {
      setMessage("تأكيد كلمة المرور الجديدة غير مطابق.");
      return;
    }
    if (token.trim().length < 32) {
      setMessage("رمز الاستعادة غير صالح أو غير مكتمل.");
      return;
    }
    resetPassword.mutate({ token, password });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071521] text-slate-100" dir="rtl">
      <div className="mx-auto grid min-h-screen max-w-6xl items-stretch xl:grid-cols-[.9fr_1.1fr]">
        <section className="relative overflow-hidden bg-[#0c2638] px-5 py-10 sm:px-10 xl:px-14">
          <div aria-hidden="true" className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_20%,rgba(55,209,178,.28),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(76,140,255,.24),transparent_35%)]" />
          <div className="relative flex h-full flex-col justify-between gap-12"><a href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-white"><ArrowRight className="h-4 w-4" />العودة إلى الأكاديمية</a><div><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-300 text-[#082233]"><KeyRound className="h-6 w-6" /></div><p className="text-sm font-semibold tracking-[.18em] text-teal-200">أمان حساب المتعلم</p><h1 className="mt-3 text-3xl font-bold leading-[1.55] text-white sm:text-4xl">{isRequest ? "استعادة وصول آمنة وواضحة." : "عيّن كلمة مرور جديدة."}</h1><p className="mt-5 max-w-lg text-sm leading-8 text-slate-300">رموز الاستعادة لا تُخزن إلا مجزّأة، تنتهي صلاحيتها، وتُستهلك مرة واحدة فقط. تغيير كلمة المرور يبطل الجلسات المحلية السابقة.</p></div><div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4 text-sm leading-7 text-slate-200"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-200" />لا يكشف هذا المسار إن كان البريد مسجلًا في النظام.</div></div>
        </section>
        <section className="flex items-center bg-[#f7fafc] px-5 py-10 text-slate-900 sm:px-10 xl:px-14"><div className="mx-auto w-full max-w-md"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700"><MailCheck className="h-5 w-5" /></div><p className="mt-5 text-sm font-bold text-teal-700">استعادة كلمة المرور</p><h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">{isRequest ? "اطلب تعليمات الاستعادة" : "استخدم رمز الاستعادة"}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{isRequest ? "اكتب بريدك للحصول على التعليمات من قناة البريد المفعلة في المنصة." : "ألصق الرمز الذي وصل إليك، ثم اختر كلمة مرور لا تقل عن 12 حرفًا."}</p>
          <form className="mt-8 space-y-5" onSubmit={submit} noValidate>{isRequest ? <label className="block text-sm font-bold text-slate-800">البريد الإلكتروني<input required type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" dir="ltr" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-left outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" placeholder="name@example.com" /></label> : <><label className="block text-sm font-bold text-slate-800">رمز الاستعادة<input required value={token} onChange={event => setToken(event.target.value)} minLength={32} maxLength={256} autoComplete="one-time-code" dir="ltr" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-left outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" /></label><label className="block text-sm font-bold text-slate-800">كلمة المرور الجديدة<input required type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={12} maxLength={128} autoComplete="new-password" dir="ltr" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-left outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" /></label><label className="block text-sm font-bold text-slate-800">تأكيد كلمة المرور<input required type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} minLength={12} maxLength={128} autoComplete="new-password" dir="ltr" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-left outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" /></label></>}</form>
          {(message || error) && <p role={error ? "alert" : "status"} className={`mt-4 rounded-xl px-4 py-3 text-sm leading-6 ${error ? "bg-rose-50 text-rose-700" : "bg-teal-50 text-teal-800"}`}>{error || message}</p>}
          <button onClick={submit as unknown as () => void} disabled={pending} className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#0d6e68] px-5 text-sm font-extrabold text-white shadow-lg shadow-teal-900/15 transition hover:bg-[#095c57] disabled:cursor-wait disabled:opacity-60 active:scale-[.98]" type="button">{pending ? "جارٍ المعالجة…" : isRequest ? "طلب تعليمات الاستعادة" : "تعيين كلمة المرور"}</button>
          <p className="mt-7 text-center text-sm text-slate-600"><Link href="/login" className="font-bold text-teal-700 underline decoration-teal-300 underline-offset-4">العودة إلى تسجيل الدخول</Link>{isRequest && <><span className="px-2 text-slate-300">•</span><Link href="/reset-password" className="font-bold text-teal-700 underline decoration-teal-300 underline-offset-4">لدي رمز بالفعل</Link></>}</p></div></section>
      </div>
    </main>
  );
}
