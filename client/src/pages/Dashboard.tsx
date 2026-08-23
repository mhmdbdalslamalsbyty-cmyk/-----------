import { Award, BookOpen, CheckCircle2, CloudUpload, LogOut, RefreshCw, UserRound, Video } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import AccountSettings from "@/components/AccountSettings";

const TOTAL_LESSONS = 12;
const STORAGE = "dsa-academy-progress-v2";
const SYNC_QUEUE_STORAGE = "dsa-academy-progress-sync-queue-v1";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function done(value: unknown): boolean {
  const item = record(value);
  return value === true || item.completed === true || typeof item.completedAt === "string";
}

function videoDone(value: unknown): boolean {
  const item = record(value);
  const percent = typeof item.percent === "number" ? item.percent : typeof item.progress === "number" ? item.progress : 0;
  return value === true || item.completed === true || percent >= 80;
}

function bestScore(value: unknown): number {
  if (typeof value === "number") return Math.max(0, Math.min(100, Math.round(value)));
  const item = record(value);
  const direct = [item.bestScore, item.score, item.percent].filter((score): score is number => typeof score === "number");
  return direct.length ? Math.max(...direct.map(score => Math.max(0, Math.min(100, Math.round(score))))) : 0;
}

function localProgress() {
  try {
    const raw = localStorage.getItem(STORAGE);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const learner = trpc.learner.me.useQuery();
  const progress = trpc.progress.get.useQuery(undefined, { enabled: learner.data?.authenticated === true });
  const utils = trpc.useUtils();
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [syncTick, setSyncTick] = useState(0);
  const [name, setName] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const updateProfile = trpc.learner.updateProfile.useMutation({
    onSuccess: async data => {
      setName(data.account.displayName);
      setProfileMessage("تم حفظ الاسم المعروض.");
      await utils.learner.me.invalidate();
    },
  });
  const logout = trpc.learner.logout.useMutation({ onSuccess: () => window.location.assign("/") });
  const importProgress = trpc.progress.importLocal.useMutation({
    onSuccess: async () => { await utils.progress.get.invalidate(); },
  });

  useEffect(() => {
    if (!learner.isPending && !learner.isError && !learner.data?.authenticated) setLocation("/login");
    if (learner.data?.account?.displayName) setName(learner.data.account.displayName);
  }, [learner.data, learner.isError, learner.isPending, setLocation]);

  useEffect(() => {
    const markOnline = () => { setOnline(true); setSyncTick(value => value + 1); };
    const markOffline = () => { setOnline(false); setSyncTick(value => value + 1); };
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    const timer = window.setInterval(() => setSyncTick(value => value + 1), 5000);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
      window.clearInterval(timer);
    };
  }, []);

  const summary = useMemo(() => {
    const data = progress.data;
    const completed = Object.values(data?.completedLessons ?? {}).filter(done).length;
    const videos = Object.values(data?.watchedVideos ?? {}).filter(videoDone).length;
    const scores = Object.entries(data?.quizAttempts ?? {})
      .map(([id, value]) => ({ id, score: bestScore(value) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    return { completed, videos, scores, percent: Math.round((completed / TOTAL_LESSONS) * 100) };
  }, [progress.data]);
  const queuedCount = useMemo(() => {
    try {
      const items = JSON.parse(localStorage.getItem(SYNC_QUEUE_STORAGE) || "[]");
      return Array.isArray(items) ? items.length : 0;
    } catch {
      return 0;
    }
  }, [syncTick]);

  if (learner.isPending || (learner.data?.authenticated && progress.isPending)) {
    return <main className="grid min-h-screen place-items-center bg-[#071521] text-sm font-bold text-teal-100">جارٍ تحميل ملف المتعلم…</main>;
  }

  if (learner.isError || (learner.data?.authenticated && progress.isError)) {
    const error = learner.error ?? progress.error;
    return (
      <main className="grid min-h-screen place-items-center bg-[#071521] px-4 text-slate-100" dir="rtl">
        <section className="w-full max-w-md rounded-3xl border border-rose-300/20 bg-[#0d2637] p-6 text-center shadow-2xl shadow-black/20">
          <p className="text-sm font-bold text-rose-200">تعذر فتح ملف المتعلم</p>
          <h1 className="mt-2 text-xl font-extrabold text-white">لم نتمكن من جلب بيانات الحساب أو التقدم الآن.</h1>
          <p role="alert" className="mt-3 text-sm leading-7 text-slate-300">{error?.message || "تحقق من الاتصال ثم أعد المحاولة. لم نحذف أي تقدم محفوظ."}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => { void learner.refetch(); void progress.refetch(); }} className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-300 px-5 text-sm font-extrabold text-[#082330] transition hover:bg-teal-200 active:scale-[.98]">إعادة المحاولة</button>
            <a href="/" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-extrabold text-slate-100 transition hover:bg-white/10">العودة إلى الأكاديمية</a>
          </div>
        </section>
      </main>
    );
  }

  const hasLocal = Boolean(localProgress());
  const accountName = learner.data?.account?.displayName ?? learner.data?.user?.name ?? "المتعلم";
  const lastLesson = progress.data?.lastLessonId;
  const syncSummary = !online
    ? { label: "خارج الاتصال — سيُحفظ التقدم محليًا", tone: "border-amber-300/30 bg-amber-200/10 text-amber-100" }
    : progress.isError
      ? { label: "تعذرت المزامنة — لم يُحذف تقدمك", tone: "border-rose-300/30 bg-rose-200/10 text-rose-100" }
      : progress.isFetching || importProgress.isPending
        ? { label: "جارٍ مزامنة التقدم…", tone: "border-sky-300/30 bg-sky-200/10 text-sky-100" }
        : queuedCount > 0
          ? { label: `بانتظار مزامنة ${queuedCount} تحديث${queuedCount === 1 ? "" : "ات"}`, tone: "border-amber-300/30 bg-amber-200/10 text-amber-100" }
          : { label: "التقدم محفوظ ومتزامن", tone: "border-teal-300/30 bg-teal-200/10 text-teal-100" };

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    updateProfile.mutate({ displayName: name });
  }

  function importLocalState() {
    const local = localProgress();
    if (!local) return;
    importProgress.mutate({
      localState: {
        completed: record(local.completed),
        watched: record(local.watched),
        answered: record(local.answered),
        activeId: typeof local.activeId === "string" ? local.activeId : undefined,
        finalReview: record(local.finalReview),
      },
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071521] text-slate-100" dir="rtl">
      <header className="border-b border-white/10 bg-[#0b2232]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2 font-extrabold text-white"><BookOpen className="h-5 w-5 text-teal-300" /> أكاديمية هياكل البيانات</a>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-300 sm:inline">{accountName}</span>
            <button onClick={() => logout.mutate()} disabled={logout.isPending} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-bold text-slate-100 transition hover:bg-white/10 disabled:opacity-60"><LogOut className="h-4 w-4" /> خروج</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="rounded-3xl border border-teal-300/15 bg-[linear-gradient(120deg,#0e3040,#103b45_55%,#153158)] p-5 shadow-2xl shadow-black/15 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div className="min-w-0">
              <p className="text-sm font-bold text-teal-200">ملف المتعلم</p>
              <h1 className="mt-2 text-2xl font-extrabold leading-relaxed text-white sm:text-3xl">أهلًا {accountName}، تقدّمك محفوظ.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">تستند هذه اللوحة إلى السجل الخادمي لحسابك، وتعرض آخر حالة متزامنة بين أجهزتك.</p>
              <p aria-live="polite" className={`mt-3 inline-flex max-w-full rounded-full border px-3 py-1.5 text-xs font-bold ${syncSummary.tone}`}>{syncSummary.label}</p>
            </div>
            <button onClick={() => progress.refetch()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-300 px-4 text-sm font-extrabold text-[#082330] transition hover:bg-teal-200 active:scale-[.98]"><RefreshCw className="h-4 w-4" /> تحديث التقدم</button>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-black/20" aria-label={`تقدم الدورة ${summary.percent}%`}><div className="h-full rounded-full bg-teal-300 transition-[width] duration-300" style={{ width: `${summary.percent}%` }} /></div>
          <div className="mt-2 flex justify-between text-xs font-bold text-slate-300"><span>{summary.completed} من {TOTAL_LESSONS} درسًا مكتملًا</span><span>{summary.percent}%</span></div>
        </section>

        {hasLocal && !progress.data?.importedAt && (
          <section className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-200/10 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div><p className="font-extrabold text-amber-100">تقدم محلي قابل للاستيراد</p><p className="mt-1 text-sm leading-6 text-amber-50/80">وجدنا تقدمًا على هذا الجهاز. سيُدمج مع سجلك ولن يُحذف قبل نجاح النقل.</p></div>
            <button onClick={importLocalState} disabled={importProgress.isPending} className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-amber-200 px-4 text-sm font-extrabold text-[#513700] transition hover:bg-amber-100 disabled:opacity-60 sm:mt-0"><CloudUpload className="h-4 w-4" /> {importProgress.isPending ? "جارٍ الاستيراد…" : "استيراد التقدم"}</button>
          </section>
        )}
        {importProgress.isError && <p role="alert" className="mt-4 rounded-xl bg-rose-900/40 px-4 py-3 text-sm text-rose-100">{importProgress.error.message}</p>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<CheckCircle2 />} label="الدروس المكتملة" value={`${summary.completed}/${TOTAL_LESSONS}`} />
          <Stat icon={<Video />} label="الفيديوهات المكتملة" value={String(summary.videos)} />
          <Stat icon={<Award />} label="أفضل نتيجة" value={summary.scores[0] ? `${summary.scores[0].score}%` : "—"} />
          <Stat icon={<UserRound />} label="حالة الشهادة" value={progress.data?.certificateId ? "صادرة" : progress.data?.courseCompletedAt ? "جاهزة للإصدار" : "قيد الإكمال"} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-2xl border border-white/10 bg-[#0d2637] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-teal-200">تابع التعلم</p><h2 className="mt-1 text-xl font-extrabold text-white">{lastLesson ? `آخر درس: ${lastLesson}` : "ابدأ أول درس في المسار"}</h2></div><BookOpen className="h-7 w-7 text-teal-300" /></div>
            <p className="mt-3 text-sm leading-7 text-slate-300">سنأخذك إلى آخر درس حفظه حسابك. سيظهر التقدم المزامن عند فتح الأكاديمية.</p>
            <button onClick={() => { window.location.assign(lastLesson ? `/?lesson=${encodeURIComponent(lastLesson)}` : "/"); }} className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-extrabold text-[#0d2637] transition hover:bg-teal-100 active:scale-[.98]">{lastLesson ? "استئناف الدرس" : "ابدأ التعلم"}</button>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#0d2637] p-5 sm:p-6">
            <p className="text-sm font-bold text-teal-200">حالة الشهادة</p>
            {progress.data?.certificateId ? <><h2 className="mt-2 text-lg font-extrabold text-white">شهادتك مرتبطة بحسابك</h2><p className="mt-2 break-all font-mono text-sm text-slate-300">{progress.data.certificateId}</p><a href={`/verify?id=${encodeURIComponent(progress.data.certificateId)}`} className="mt-5 inline-flex text-sm font-extrabold text-teal-200 underline underline-offset-4">فتح التحقق العام</a></> : <><h2 className="mt-2 text-lg font-extrabold text-white">{progress.data?.courseCompletedAt ? "أكملت الدورة" : "أكمل المسار أولًا"}</h2><p className="mt-2 text-sm leading-7 text-slate-300">{progress.data?.courseCompletedAt ? "يمكنك إصدار الشهادة من بطاقة الشهادة داخل الأكاديمية." : "تصدر الشهادة بعد إكمال جميع الدروس واجتياز المراجعة النهائية."}</p></>}
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-[#0d2637] p-5 sm:p-6"><p className="text-sm font-bold text-teal-200">أفضل نتائج الاختبارات</p>{summary.scores.length ? <ul className="mt-4 space-y-3">{summary.scores.slice(0, 5).map(item => <li className="flex items-center justify-between gap-4 rounded-xl bg-white/[.04] px-4 py-3 text-sm" key={item.id}><span className="min-w-0 truncate text-slate-200">{item.id}</span><b className="shrink-0 text-teal-200">{item.score}%</b></li>)}</ul> : <p className="mt-4 text-sm leading-7 text-slate-400">ستظهر أفضل نتيجة لكل اختبار بعد حله.</p>}</article>
          <article className="rounded-2xl border border-white/10 bg-[#0d2637] p-5 sm:p-6"><p className="text-sm font-bold text-teal-200">الملف الشخصي</p><form onSubmit={submitProfile} className="mt-4"><label className="text-sm font-bold text-slate-200">الاسم المعروض<input value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={120} required className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-[#081b29] px-3 text-sm text-white outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10" /></label>{(profileMessage || updateProfile.error?.message) && <p role="status" className={`mt-3 text-sm ${updateProfile.error ? "text-rose-200" : "text-teal-200"}`}>{updateProfile.error?.message ?? profileMessage}</p>}<button disabled={updateProfile.isPending} className="mt-4 h-10 rounded-xl border border-teal-300/40 px-4 text-sm font-extrabold text-teal-100 transition hover:bg-teal-300/10 disabled:opacity-60">{updateProfile.isPending ? "جارٍ الحفظ…" : "حفظ الاسم"}</button></form></article>
        </section>
        <AccountSettings />
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <article className="min-w-0 rounded-2xl border border-white/10 bg-[#0d2637] p-4"><div className="flex items-center justify-between text-teal-200">{icon}<span className="text-xs font-bold text-slate-400">{label}</span></div><p className="mt-4 truncate text-2xl font-extrabold text-white">{value}</p></article>;
}
