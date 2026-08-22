import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Activity, Award, BookOpen, CheckCircle2, ChevronLeft, CircleAlert, CirclePlay,
  Download, FileClock, GraduationCap, LayoutDashboard, Loader2, LogOut, Menu,
  RefreshCcw, Search, ShieldCheck, Users, Video, X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type AdminSection = "overview" | "learners" | "learnerDetail" | "certificates" | "videos" | "course" | "activity";
type DatePreset = "today" | "7d" | "30d" | "90d" | "all" | "custom";

const sectionFromPath = (path: string): AdminSection => {
  if (/^\/admin\/learners\/\d+$/.test(path)) return "learnerDetail";
  if (path === "/admin/learners") return "learners";
  if (path === "/admin/certificates") return "certificates";
  if (path === "/admin/videos") return "videos";
  if (path === "/admin/course") return "course";
  if (path === "/admin/activity") return "activity";
  return "overview";
};

const navigation: Array<{ id: AdminSection; path: string; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", path: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "learners", path: "/admin/learners", label: "الطلاب", icon: Users },
  { id: "certificates", path: "/admin/certificates", label: "الشهادات", icon: Award },
  { id: "videos", path: "/admin/videos", label: "الفيديوهات", icon: Video },
  { id: "course", path: "/admin/course", label: "المنهج", icon: BookOpen },
  { id: "activity", path: "/admin/activity", label: "سجل النشاط", icon: FileClock },
];

const courseVideos = [
  ["V01", "why-data-structures", "لماذا ننظّم البيانات؟", "PUBLISHED", "101 ثانية", "/manus-storage/V01-why-data-structures-ar-animated_191b6b5e.mp4"],
  ["V02", "array", "المصفوفة: رفّ مرقّم", "EXTERNAL_LICENSE_REQUIRED", "90.9 ثانية", null],
  ["V03", "singly-linked-basics", "القائمة المرتبطة: اتبع الرابط", "PUBLISHED", "117 ثانية", "/manus-storage/V03-linked-list-ar-animated_561fdacc.mp4"],
  ["V04", "singly-linked-operations", "عمليات القائمة: احفظ الطريق", "PUBLISHED", "137 ثانية", "/manus-storage/V04-linked-list-operations-ar-animated_1059b3a9.mp4"],
  ["V05", "doubly-linked", "القائمة المزدوجة: طريقان", "PUBLISHED", "136 ثانية", "/manus-storage/V05-linked-list-doubly-ar-animated_601c351c.mp4"],
  ["V06", "stack-array", "المكدس: قمة تتحرك", "PUBLISHED", "149 ثانية", "/manus-storage/V06-stack-array-ar-animated_fdc5faaf.mp4"],
  ["V07", "stack-linked", "المكدس بالقائمة: قمة مرنة", "PUBLISHED", "141 ثانية", "/manus-storage/V07-stack-linked-ar-animated_08380b83.mp4"],
  ["V08", "queue-array", "الطابور: دخول وخروج", "PUBLISHED", "122 ثانية", "/manus-storage/V08-queue-array-ar-animated_17686618.mp4"],
  ["V09", "queue-linked", "الطابور بالقائمة: بلا إزاحة", "VERIFIED", "142 ثانية", "/manus-storage/V09-queue-linked-ar-animated_9dd0454f.mp4"],
  ["V10", "recursion", "الاستدعاء الذاتي: مسألة أصغر", "PUBLISHED", "2:11", "/manus-storage/V10-recursion-ar-animated_1bdb3849.mp4"],
  ["V11", "trees", "شجرة البحث الثنائية: قرار عند كل عقدة", "VERIFIED", "1:54", "/manus-storage/V11-bst-ar-animated_4f05f65e.mp4"],
  ["V12", "graphs", "الرسم البياني: BFS وDFS", "PUBLISHED", "92 ثانية", "/manus-storage/V12-graph-traversal-ar_1001cd68.mp4"],
] as const;

const formatDate = (value?: Date | string | null) => value ? new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "لم يحدث بعد";
const initials = (name?: string | null) => (name || "؟").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("");
const actionLabel = (action: string) => ({
  "learner.account_created": "أُنشئ حساب متعلم",
  "learner.logged_in": "سجّل المتعلم دخوله",
  "learner.password_changed": "غُيّرت كلمة المرور",
  "learner.password_reset_requested": "طُلبت إعادة تعيين كلمة المرور",
  "learner.password_reset_completed": "اكتملت إعادة تعيين كلمة المرور",
  "learner.account_deleted": "حُذف حساب المتعلم",
  "learner.certificate_issued": "أُصدرت شهادة",
  "admin.logged_in": "سجّل المدير دخوله",
  "admin.logged_out": "سجّل المدير خروجه",
  "admin.learners_exported": "صُدّرت بيانات المتعلمين",
  "admin.learner_detail_viewed": "فُتحت تفاصيل متعلم",
  "admin.certificate_revoked": "أُلغي اعتماد شهادة",
  "admin.certificate_restored": "أُعيد اعتماد شهادة",
}[action] ?? action);

function MetricCard({ icon: Icon, label, value, detail, tone = "cyan" }: { icon: typeof Users; label: string; value: number; detail: string; tone?: "cyan" | "violet" | "emerald" | "amber" }) {
  const tones = {
    cyan: "border-cyan-400/15 bg-cyan-400/10 text-cyan-200",
    violet: "border-violet-400/15 bg-violet-400/10 text-violet-200",
    emerald: "border-emerald-400/15 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-400/15 bg-amber-400/10 text-amber-200",
  };
  return <article className="rounded-2xl border border-white/8 bg-slate-950/55 p-4 shadow-lg shadow-black/10">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-400">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-white">{value.toLocaleString("ar")}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl border ${tones[tone]}`}><Icon className="h-5 w-5" /></span></div>
    <p className="mt-3 text-xs text-slate-500">{detail}</p>
  </article>;
}

function StatusBadge({ status }: { status: string }) {
  const config = status === "valid" || status === "PUBLISHED"
    ? ["bg-emerald-400/10 text-emerald-300 ring-emerald-400/20", status === "valid" ? "سارية" : "منشور"]
    : status === "revoked" ? ["bg-rose-400/10 text-rose-300 ring-rose-400/20", "ملغاة"]
      : ["bg-amber-400/10 text-amber-200 ring-amber-400/20", "ترخيص خارجي مطلوب"];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${config[0]}`}>{config[1]}</span>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-8 text-center"><div><CircleAlert className="mx-auto h-6 w-6 text-slate-500" /><h3 className="mt-3 font-bold text-slate-200">{title}</h3><p className="mt-1 max-w-sm text-sm text-slate-500">{detail}</p></div></div>;
}

function saveServerCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function localDayTimestamp(value: string, endOfDay = false) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0).getTime();
}

function timezoneLabel() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export default function AdminCenter() {
  const { user, loading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const section = sectionFromPath(location);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [learnerQuery, setLearnerQuery] = useState("");
  const [learnerPage, setLearnerPage] = useState(1);
  const [certificateQuery, setCertificateQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [certificateAction, setCertificateAction] = useState<{ id: string; kind: "revoke" | "restore" } | null>(null);
  const [revocationReason, setRevocationReason] = useState("");
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const dateRange = useMemo(() => {
    const timezoneOffsetMinutes = new Date().getTimezoneOffset();
    if (datePreset !== "custom") return { preset: datePreset, timezoneOffsetMinutes } as const;
    if (!customFrom || !customTo) return { preset: "all", timezoneOffsetMinutes } as const;
    return { preset: "custom" as const, from: localDayTimestamp(customFrom), to: localDayTimestamp(customTo, true), timezoneOffsetMinutes };
  }, [customFrom, customTo, datePreset]);
  const learnerId = useMemo(() => {
    const match = location.match(/^\/admin\/learners\/(\d+)$/);
    return match ? Number(match[1]) : null;
  }, [location]);
  const overview = trpc.admin.overview.useQuery({ dateRange }, { enabled: isAdmin, retry: false });
  const learners = trpc.admin.learnersPage.useQuery({ query: learnerQuery || undefined, limit: 20, page: learnerPage, dateRange }, { enabled: isAdmin && section === "learners", retry: false });
  const learnerDetail = trpc.admin.learnerDetail.useQuery({ userId: learnerId ?? 1, dateRange }, { enabled: isAdmin && section === "learnerDetail" && learnerId !== null, retry: false });
  const certificates = trpc.admin.certificates.useQuery({ query: certificateQuery || undefined, limit: 50, dateRange }, { enabled: isAdmin, retry: false });
  const audit = trpc.admin.audit.useQuery({ limit: 50, dateRange }, { enabled: isAdmin, retry: false });
  const restore = trpc.admin.restoreCertificate.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.certificates.invalidate(), utils.admin.overview.invalidate(), utils.admin.audit.invalidate()]); setCertificateAction(null); } });
  const revoke = trpc.certificate.revoke.useMutation({ onSuccess: async () => { await Promise.all([utils.admin.certificates.invalidate(), utils.admin.overview.invalidate(), utils.admin.audit.invalidate()]); setCertificateAction(null); setRevocationReason(""); } });
  const exportLearners = trpc.admin.exportLearnersCSV.useMutation({
    onSuccess: async result => {
      saveServerCsv(result.csv, result.filename);
      await utils.admin.audit.invalidate();
    },
  });
  const busy = restore.isPending || revoke.isPending || exportLearners.isPending;
  const publishedVideos = courseVideos.filter(([, , , status]) => status === "PUBLISHED").length;
  const currentPage = section === "learnerDetail" ? "تفاصيل المتعلم" : navigation.find(item => item.id === section)?.label ?? "نظرة عامة";

  const recentActivity = useMemo(() => overview.data?.audit ?? audit.data ?? [], [overview.data?.audit, audit.data]);
  if (loading) return <div className="min-h-screen bg-slate-950 grid place-items-center text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!user) return <div dir="rtl" className="min-h-screen bg-slate-950 grid place-items-center p-6 text-center"><div className="max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8"><ShieldCheck className="mx-auto h-10 w-10 text-cyan-300" /><h1 className="mt-4 text-xl font-black text-white">يلزم تسجيل الدخول</h1><p className="mt-2 text-sm leading-6 text-slate-400">مركز التحكم مخصص لحسابات الإدارة المعتمدة فقط.</p><Button className="mt-6 w-full" onClick={() => setLocation("/login")}>الانتقال لتسجيل الدخول</Button></div></div>;
  if (!isAdmin) return <div dir="rtl" className="min-h-screen bg-slate-950 grid place-items-center p-6 text-center"><div className="max-w-md rounded-3xl border border-rose-400/20 bg-slate-900 p-8"><ShieldCheck className="mx-auto h-10 w-10 text-rose-300" /><h1 className="mt-4 text-xl font-black text-white">لا تملك صلاحية الإدارة</h1><p className="mt-2 text-sm leading-6 text-slate-400">هذا المسار محمي أيضًا من الخادم، ولا يتيح عرض بيانات المتعلمين أو الشهادات دون دور إداري.</p><Button variant="outline" className="mt-6 w-full border-white/10 text-slate-100" onClick={() => setLocation("/")}>العودة إلى الأكاديمية</Button></div></div>;

  const navigate = (path: string) => { setLocation(path); setMobileNavOpen(false); };
  const renderOverview = () => {
    const metrics = overview.data?.metrics;
    const overviewData = overview.data;
    if (overview.isLoading) return <LoadingPanel />;
    if (!metrics || !overviewData) return <EmptyState title="تعذر تحميل المؤشرات" detail="تحقق من اتصال قاعدة البيانات ثم أعد المحاولة." />;
    return <div className="space-y-6">
      <DateRangeFilter preset={datePreset} onPresetChange={setDatePreset} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={Users} label="إجمالي الطلاب" value={metrics.totalLearners} detail={`نشط خلال 30 يومًا: ${metrics.activeLearners30d.toLocaleString("ar")}`} />
        <MetricCard icon={GraduationCap} label="إكمال المنهج" value={metrics.courseCompletions} detail={`${metrics.totalCompletedLessons.toLocaleString("ar")} درس محفوظ في التقدم`} tone="violet" />
        <MetricCard icon={Award} label="الشهادات السارية" value={metrics.validCertificates} detail={`إجمالي صادر: ${metrics.issuedCertificates.toLocaleString("ar")}`} tone="emerald" />
        <MetricCard icon={Activity} label="محاولات الاختبارات" value={metrics.totalQuizAttempts} detail={`شهادات ملغاة: ${metrics.revokedCertificates.toLocaleString("ar")}`} tone="amber" />
        <MetricCard icon={CirclePlay} label="إكمالات الفيديو" value={metrics.videoCompletions} detail="مستخلصة من تقدم المشاهدة المحفوظ" tone="violet" />
        <MetricCard icon={Activity} label="متوسط التقدم" value={metrics.averageProgressPercent} detail="متوسط الدروس المكتملة للطلاب (٪)" tone="emerald" />
        <MetricCard icon={CheckCircle2} label="اجتياز المراجعة النهائية" value={metrics.finalReviewPassRate} detail={`${metrics.finalReviewPasses.toLocaleString("ar")} من ${metrics.submittedFinalReviews.toLocaleString("ar")} مراجعة مكتملة (٪)`} tone="cyan" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5"><div className="flex items-center justify-between"><div><h2 className="font-black text-white">أحدث نشاط للطلاب</h2><p className="mt-1 text-xs text-slate-500">يعرض نشاط الدخول والتقدم الحقيقي المحفوظ.</p></div><Button variant="ghost" className="text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200" onClick={() => navigate("/admin/learners")}>عرض الكل <ChevronLeft className="mr-1 h-4 w-4" /></Button></div>
          <div className="mt-4 divide-y divide-white/6">{overviewData.recentLearners.length ? overviewData.recentLearners.map(learner => <button key={learner.userId} onClick={() => navigate(`/admin/learners/${learner.userId}`)} className="flex w-full items-center gap-3 py-3 text-right hover:bg-white/[0.02]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-200">{initials(learner.displayName)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-200">{learner.displayName}</span><span className="mt-0.5 block text-xs text-slate-500">آخر دخول: {formatDate(learner.lastLoginAt)}</span></span><span className="text-xs text-slate-400">{learner.completedLessons.toLocaleString("ar")}/12</span></button>) : <EmptyState title="لا يوجد نشاط بعد" detail="ستظهر بيانات الحسابات عند تسجيل المتعلمين واستخدامهم المنصة." />}</div>
        </article>
        <article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-300" /><div><h2 className="font-black text-white">سلامة المكتبة</h2><p className="mt-1 text-xs text-slate-500">حالة أصول الفيديو المعتمدة.</p></div></div><div className="mt-5 space-y-4"><div><div className="flex justify-between text-xs"><span className="text-slate-400">الفيديوهات المنشورة</span><span className="font-bold text-emerald-300">{publishedVideos}/12</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/7"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(publishedVideos / 12) * 100}%` }} /></div></div><div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 text-xs leading-5 text-amber-100">V02 مسجل بوضوح كـ <strong>ترخيص خارجي مطلوب</strong>، ولا يظهر له مشغل أو رابط بديل.</div><Button variant="outline" onClick={() => navigate("/admin/videos")} className="w-full border-white/10 text-slate-100 hover:bg-white/5">فتح إدارة الفيديوهات</Button></div></article>
      </section>
    </div>;
  };

  const renderLearners = () => <section className="min-w-0 max-w-full space-y-4"><PageTitle title="إدارة الطلاب" description="بحث خادمي بالاسم أو البريد أو معرّف المتعلم، مع صفحات محدودة لا تُحمّل كل الحسابات إلى المتصفح." action={<Button variant="outline" className="border-white/10 text-slate-100" disabled={exportLearners.isPending} onClick={() => exportLearners.mutate({ query: learnerQuery || undefined, dateRange })}>{exportLearners.isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}تصدير CSV</Button>} />
    <div className="min-w-0 max-w-full rounded-2xl border border-white/8 bg-slate-950/55 p-4">
      <DateRangeFilter preset={datePreset} onPresetChange={setDatePreset} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />
      <SearchBox value={learnerQuery} onChange={value => { setLearnerQuery(value); setLearnerPage(1); }} placeholder="ابحث بالاسم أو البريد أو معرّف المتعلم" />
      <div className="mt-4 w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="border-b border-white/8 text-xs text-slate-500"><tr><th className="px-3 py-3 font-medium">الطالب</th><th className="px-3 py-3 font-medium">التقدم</th><th className="px-3 py-3 font-medium">الاختبارات</th><th className="px-3 py-3 font-medium">آخر دخول</th><th className="px-3 py-3 font-medium">الحالة</th><th className="px-3 py-3" /></tr></thead>
          <tbody className="divide-y divide-white/6">{learners.isLoading ? <TableLoading columns={6} /> : learners.data?.items.length ? learners.data.items.map(learner => <tr key={learner.userId} className="hover:bg-white/[0.025]"><td className="px-3 py-3"><button className="flex items-center gap-2 text-right" onClick={() => navigate(`/admin/learners/${learner.userId}`)}><span className="grid h-8 w-8 place-items-center rounded-full bg-violet-400/10 text-xs font-bold text-violet-200">{initials(learner.displayName)}</span><span><span className="block font-bold text-slate-200">{learner.displayName}</span><span className="block max-w-48 truncate text-xs text-slate-500">{learner.email}</span></span></button></td><td className="px-3 py-3 text-slate-300">{learner.completedLessons.toLocaleString("ar")}/12</td><td className="px-3 py-3 text-slate-300">{learner.quizAttempts.toLocaleString("ar")}</td><td className="px-3 py-3 text-xs text-slate-400">{formatDate(learner.lastActivityAt)}</td><td className="px-3 py-3">{learner.courseCompletedAt ? <StatusBadge status="valid" /> : <span className="text-xs text-slate-500">قيد التعلم</span>}</td><td className="px-3 py-3"><Button variant="ghost" size="sm" className="text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100" onClick={() => navigate(`/admin/learners/${learner.userId}`)}>التفاصيل</Button></td></tr>) : <tr><td colSpan={6} className="py-8"><EmptyState title="لا توجد نتائج" detail="جرّب عبارة بحث أخرى أو انتظر تسجيل متعلم جديد." /></td></tr>}</tbody>
        </table>
      </div>
      <Pagination page={learners.data?.page ?? learnerPage} totalPages={learners.data?.totalPages ?? 1} total={learners.data?.total ?? 0} disabled={learners.isFetching} onPrevious={() => setLearnerPage(current => Math.max(1, current - 1))} onNext={() => setLearnerPage(current => Math.min(learners.data?.totalPages ?? current, current + 1))} />
    </div>
  </section>;

  const renderLearnerDetail = () => {
    const learner = learnerDetail.data;
    if (learnerDetail.isLoading) return <LoadingPanel />;
    if (!learner || learnerDetail.isError) return <EmptyState title="تعذر تحميل تفاصيل المتعلم" detail="قد يكون المعرّف غير موجود أو أن الوصول إلى البيانات مرفوض." />;
    const certificate = learner.certificates[0];
    return <section className="min-w-0 max-w-5xl space-y-5"><PageTitle title="تفاصيل المتعلم" description="ملخص إداري خادمي للتقدم والنشاط، ولا يعرض كلمات المرور أو الجلسات أو الرموز أو الإجابات الخام." action={<Button variant="outline" className="border-white/10 text-slate-100" onClick={() => navigate("/admin/learners")}>العودة إلى الطلاب <ChevronLeft className="mr-1 h-4 w-4" /></Button>} />
      <DateRangeFilter preset={datePreset} onPresetChange={setDatePreset} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />
      <section className="grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5 md:col-span-2"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-violet-400/10 font-black text-violet-200">{initials(learner.profile.displayName)}</span><div><h2 className="font-black text-white">{learner.profile.displayName}</h2><p className="mt-1 text-sm text-slate-500">{learner.profile.email}</p><p className="mt-2 font-mono text-[11px] text-slate-600">معرّف المتعلم: {learner.profile.userId}</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><InfoTile label="تاريخ التسجيل" value={formatDate(learner.profile.createdAt)} /><InfoTile label="آخر نشاط" value={formatDate(learner.profile.lastActivityAt)} /><InfoTile label="حالة المنهج" value={learner.progress.courseCompletedAt ? "مكتمل" : "قيد التعلم"} /></div></article><article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5"><h2 className="font-black text-white">الشهادة</h2>{certificate ? <div className="mt-4 space-y-2"><StatusBadge status={certificate.status} /><p className="font-mono text-xs text-cyan-200">{certificate.certificateId}</p><p className="text-xs text-slate-500">صدرت: {formatDate(certificate.issuedAt)}</p></div> : <p className="mt-4 text-sm text-slate-500">لا توجد شهادة مرتبطة بهذا المتعلم.</p>}</article></section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={GraduationCap} label="الدروس المكتملة" value={learner.progress.completedLessons} detail={`من 12 درسًا (${learner.progress.progressPercent.toLocaleString("ar")}٪)`} tone="violet" /><MetricCard icon={CirclePlay} label="الفيديوهات المكتملة" value={learner.progress.completedVideos} detail={`تقدم الفيديو: ${learner.progress.videoProgressPercent.toLocaleString("ar")}٪`} tone="cyan" /><MetricCard icon={Activity} label="محاولات الاختبارات" value={learner.progress.quizAttempts} detail="عدد المحاولات المحفوظة" tone="amber" /><MetricCard icon={CheckCircle2} label="أفضل نتيجة" value={learner.progress.bestQuizScore} detail="أفضل درجة اختبار محفوظة" tone="emerald" /></section>
      <article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5"><h2 className="font-black text-white">النشاط الأخير</h2><p className="mt-1 text-xs text-slate-500">يتأثر نطاقه بالمرشح الزمني أعلاه؛ لا تظهر التفاصيل الوصفية الحساسة.</p>{learner.recentActivity.length ? <ol className="mt-5 space-y-3">{learner.recentActivity.map(activity => <li key={activity.id} className="flex flex-col gap-1 rounded-xl border border-white/6 bg-white/[0.018] p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-slate-200">{actionLabel(activity.action)}</p><p className="mt-1 text-xs text-slate-500">النتيجة: {auditResultLabel(activity.result)}</p></div><time className="text-xs text-slate-500">{formatDate(activity.createdAt)}</time></li>)}</ol> : <p className="mt-5 text-sm text-slate-500">لا يوجد نشاط ضمن النطاق الزمني المحدد.</p>}</article>
    </section>;
  };

  const renderCertificates = () => <section className="min-w-0 max-w-full space-y-4"><PageTitle title="إدارة الشهادات" description="ابحث في الشهادات العامة وألغِ الاعتماد أو أعده بسجل تدقيق يحمل هوية المدير." /><div className="min-w-0 max-w-full rounded-2xl border border-white/8 bg-slate-950/55 p-4"><DateRangeFilter preset={datePreset} onPresetChange={setDatePreset} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} /><SearchBox value={certificateQuery} onChange={setCertificateQuery} placeholder="ابحث برقم الشهادة أو اسم المتعلم" /><div className="mt-4 w-full max-w-full overflow-x-auto"><table className="w-full min-w-[760px] text-right text-sm"><thead className="border-b border-white/8 text-xs text-slate-500"><tr><th className="px-3 py-3 font-medium">رقم الشهادة</th><th className="px-3 py-3 font-medium">المتعلم</th><th className="px-3 py-3 font-medium">الإصدار</th><th className="px-3 py-3 font-medium">الحالة</th><th className="px-3 py-3 font-medium">الإجراء</th></tr></thead><tbody className="divide-y divide-white/6">{certificates.isLoading ? <TableLoading columns={5} /> : certificates.data?.length ? certificates.data.map(certificate => <tr key={certificate.certificateId} className="hover:bg-white/[0.025]"><td className="px-3 py-3 font-mono text-xs text-cyan-200">{certificate.certificateId}</td><td className="px-3 py-3 font-bold text-slate-200">{certificate.learnerName}</td><td className="px-3 py-3 text-xs text-slate-400">{formatDate(certificate.issuedAt)}</td><td className="px-3 py-3"><StatusBadge status={certificate.status} /></td><td className="px-3 py-3">{certificate.status === "valid" ? <Button variant="ghost" size="sm" className="text-rose-300 hover:bg-rose-400/10 hover:text-rose-200" onClick={() => setCertificateAction({ id: certificate.certificateId, kind: "revoke" })}>إلغاء الاعتماد</Button> : <Button variant="ghost" size="sm" className="text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-200" onClick={() => setCertificateAction({ id: certificate.certificateId, kind: "restore" })}>إعادة الاعتماد</Button>}</td></tr>) : <tr><td colSpan={5} className="py-8"><EmptyState title="لا توجد شهادات مطابقة" detail="لا تنشأ الشهادات من هذه الشاشة؛ تقتصر الإدارة على التحقق والإبطال والاستعادة." /></td></tr>}</tbody></table></div></div></section>;

  const renderVideos = () => <section className="space-y-4"><PageTitle title="إدارة الفيديوهات" description="فهرس إنتاجي يقرأ من مصفوفة الفيديو المعتمدة؛ لا ينشئ مشغلات وهمية أو روابط بديلة." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{courseVideos.map(([id, lessonId, title, status, duration, source]) => <article key={id} className="overflow-hidden rounded-2xl border border-white/8 bg-slate-950/55"><div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-950">{source ? <video className="h-full w-full object-cover" controls preload="metadata" src={source} aria-label={`معاينة ${title}`} /> : <div className="grid h-full place-items-center p-5 text-center"><CircleAlert className="h-7 w-7 text-amber-300" /><p className="mt-2 text-xs font-bold text-amber-100">لا يوجد مشغل لهذا السجل</p></div>}<span className="absolute right-3 top-3 rounded-lg bg-slate-950/85 px-2 py-1 font-mono text-xs font-bold text-white backdrop-blur">{id}</span></div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-black text-white">{title}</h3><p className="mt-1 font-mono text-[11px] text-slate-500">{lessonId}</p></div><StatusBadge status={status} /></div><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{duration}</span><span>{source ? "أصل MP4 موثق" : "مطلوب ترخيص خارجي"}</span></div></div></article>)}</div></section>;

  const renderCourse = () => <section className="space-y-4"><PageTitle title="نظرة المنهج" description="ترتيب الدروس المرئي وفهرس الوسائط المعتمد، من دون تغيير المحتوى أو ترتيب المنهج من هذه النسخة." /><div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5"><h2 className="font-black text-white">ملخص المنهج</h2><dl className="mt-5 space-y-4"><StatLine label="عدد الدروس" value="12" /><StatLine label="أصول MP4 منشورة" value={`${publishedVideos}`} /><StatLine label="درس يحتاج ترخيصًا خارجيًا" value="1" /><StatLine label="شروط الشهادة" value="التقدم + المراجعة النهائية" /></dl><div className="mt-6 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-3 text-xs leading-5 text-cyan-100">اكتمال فيديو واحد لا يمنح شهادة وحده؛ تظل سياسة الأهلية خاضعة للتحقق الخادمي القائم.</div></article><article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5"><h2 className="font-black text-white">ترتيب الدروس والوسائط</h2><ol className="mt-4 space-y-1">{courseVideos.map(([id, lessonId, title, status]) => <li key={id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.025]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/5 font-mono text-[11px] text-slate-300">{id.slice(1)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-200">{title}</span><span className="font-mono text-[10px] text-slate-500">{lessonId}</span></span><StatusBadge status={status} /></li>)}</ol></article></div></section>;

  const renderActivity = () => <section className="space-y-4"><PageTitle title="سجل النشاط" description="سجل تشغيلي للأحداث الحساسة والإدارية من دون كلمات مرور أو رموز استعادة أو بيانات اعتماد." /><article className="rounded-2xl border border-white/8 bg-slate-950/55 p-5"><DateRangeFilter preset={datePreset} onPresetChange={setDatePreset} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} />{audit.isLoading ? <LoadingPanel /> : audit.data?.length ? <ol className="relative mr-2 border-r border-white/10 pr-6">{audit.data.map(item => <li key={item.id} className="relative pb-6 last:pb-0"><span className="absolute -right-[31px] top-1 grid h-4 w-4 place-items-center rounded-full border border-slate-950 bg-cyan-300"><span className="h-1.5 w-1.5 rounded-full bg-slate-950" /></span><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="font-bold text-slate-200">{actionLabel(item.action)}</p><time className="text-xs text-slate-500">{formatDate(item.createdAt)}</time></div><p className="mt-1 text-xs text-slate-500">الهدف: {item.targetType}{item.targetId ? ` · ${item.targetId}` : ""}{item.actorUserId ? ` · المنفّذ #${item.actorUserId}` : ""} · النتيجة: <span className={item.result === "success" ? "text-emerald-300" : item.result === "denied" ? "text-amber-300" : "text-rose-300"}>{auditResultLabel(item.result)}</span></p></li>)}</ol> : <EmptyState title="لا توجد أحداث مسجلة بعد" detail="ستظهر هنا عمليات الحساب والشهادات التي تقع بعد تفعيل السجل." />}</article></section>;

  const content = section === "overview" ? renderOverview() : section === "learners" ? renderLearners() : section === "learnerDetail" ? renderLearnerDetail() : section === "certificates" ? renderCertificates() : section === "videos" ? renderVideos() : section === "course" ? renderCourse() : renderActivity();
  return <div dir="rtl" className="fixed inset-0 z-10 h-[100dvh] w-screen max-w-none overflow-x-hidden overflow-y-auto bg-[#08111f] text-slate-100"><div className="fixed inset-0 -z-0 overflow-hidden"><div className="absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-3xl" /><div className="absolute -bottom-48 left-0 h-[30rem] w-[30rem] rounded-full bg-violet-500/10 blur-3xl" /></div>
    <div className="relative z-10 flex min-h-screen w-full min-w-0"><aside className="hidden w-64 shrink-0 border-l border-white/8 bg-slate-950/65 p-4 backdrop-blur xl:flex xl:flex-col"><Brand /><nav className="mt-8 space-y-1">{navigation.map(item => <NavItem key={item.id} item={item} active={section === item.id || (section === "learnerDetail" && item.id === "learners")} onClick={() => navigate(item.path)} />)}</nav><div className="mt-auto border-t border-white/8 pt-4"><UserBox name={user.name} email={user.email} onLogout={logout} /></div></aside>
      <main className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/8 bg-[#08111f]/85 px-4 backdrop-blur md:px-7"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="xl:hidden text-slate-200 hover:bg-white/5" onClick={() => setMobileNavOpen(true)}><Menu className="h-5 w-5" /><span className="sr-only">فتح التنقل</span></Button><div><p className="text-[11px] font-bold tracking-wide text-cyan-300">DATA STRUCTURES ACADEMY</p><h1 className="text-sm font-black text-white sm:text-base">{currentPage}</h1></div></div><div className="flex items-center gap-2"><span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-200 sm:inline-flex">مدير</span><Button variant="ghost" size="icon" onClick={() => void Promise.all([overview.refetch(), learners.refetch(), learnerDetail.refetch(), certificates.refetch(), audit.refetch()])} className="text-slate-300 hover:bg-white/5" aria-label="تحديث البيانات"><RefreshCcw className="h-4 w-4" /></Button></div></header>
        <div className="p-4 pb-12 md:p-7">{content}</div>
      </main></div>
    {mobileNavOpen && <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm xl:hidden"><aside className="h-full w-[min(20rem,88vw)] border-l border-white/10 bg-slate-950 p-4 shadow-2xl"><div className="flex items-center justify-between"><Brand compact /><Button variant="ghost" size="icon" className="text-slate-300" onClick={() => setMobileNavOpen(false)}><X className="h-5 w-5" /></Button></div><nav className="mt-7 space-y-1">{navigation.map(item => <NavItem key={item.id} item={item} active={section === item.id || (section === "learnerDetail" && item.id === "learners")} onClick={() => navigate(item.path)} />)}</nav><div className="mt-8 border-t border-white/8 pt-4"><UserBox name={user.name} email={user.email} onLogout={logout} /></div></aside></div>}
    {certificateAction && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"><div className="flex items-start gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${certificateAction.kind === "revoke" ? "bg-rose-400/10 text-rose-300" : "bg-emerald-400/10 text-emerald-300"}`}><Award className="h-5 w-5" /></span><div><h2 className="font-black text-white">{certificateAction.kind === "revoke" ? "إلغاء اعتماد الشهادة" : "إعادة اعتماد الشهادة"}</h2><p className="mt-1 text-sm text-slate-400">{certificateAction.id}</p></div></div>{certificateAction.kind === "revoke" && <label className="mt-5 block text-sm font-bold text-slate-200">سبب الإلغاء<textarea value={revocationReason} onChange={event => setRevocationReason(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none ring-cyan-400/50 focus:ring-2" placeholder="اكتب سببًا واضحًا لا يقل عن 4 أحرف" maxLength={240} /></label>}<p className="mt-4 text-xs leading-5 text-slate-500">سيُسجل اسم الإجراء وهوية المدير وحالة الشهادة في سجل التدقيق، من دون حفظ كلمة مرور أو رمز.</p><div className="mt-6 flex gap-3"><Button variant="outline" className="flex-1 border-white/10 text-slate-200" disabled={busy} onClick={() => { setCertificateAction(null); setRevocationReason(""); }}>إلغاء</Button><Button className={`flex-1 ${certificateAction.kind === "revoke" ? "bg-rose-500 hover:bg-rose-400" : "bg-emerald-500 hover:bg-emerald-400"}`} disabled={busy || (certificateAction.kind === "revoke" && revocationReason.trim().length < 4)} onClick={() => certificateAction.kind === "revoke" ? revoke.mutate({ certificateId: certificateAction.id, reason: revocationReason.trim() }) : restore.mutate({ certificateId: certificateAction.id })}>{busy && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}{certificateAction.kind === "revoke" ? "تأكيد الإلغاء" : "تأكيد الاستعادة"}</Button></div></section></div>}
  </div>;
}

function Brand({ compact = false }: { compact?: boolean }) { return <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20"><ShieldCheck className="h-5 w-5" /></span>{!compact && <div><p className="font-black text-white">أكاديمية الهياكل</p><p className="text-[10px] text-slate-500">مركز التحكم الإداري</p></div>}</div>; }
function NavItem({ item, active, onClick }: { item: (typeof navigation)[number]; active: boolean; onClick: () => void }) { const Icon = item.icon; return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-bold transition-colors ${active ? "bg-cyan-400/12 text-cyan-100" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}><Icon className="h-4 w-4" />{item.label}</button>; }
function UserBox({ name, email, onLogout }: { name?: string | null; email?: string | null; onLogout: () => void }) { return <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-white/8 text-xs font-bold text-slate-200">{initials(name)}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-200">{name}</span><span className="block truncate text-[10px] text-slate-500">{email}</span></span><Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><LogOut className="h-4 w-4" /></Button></div>; }
function PageTitle({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-black tracking-tight text-white">{title}</h2><p className="mt-1 text-sm text-slate-400">{description}</p></div>{action}</div>; }
function auditResultLabel(result: "success" | "denied" | "failed") { return result === "success" ? "ناجح" : result === "denied" ? "مرفوض" : "فشل"; }
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 text-slate-500 focus-within:border-cyan-400/45"><Search className="h-4 w-4" /><Input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="h-10 border-0 bg-transparent px-0 text-slate-100 placeholder:text-slate-600 focus-visible:ring-0" /></label>; }
function Pagination({ page, totalPages, total, disabled, onPrevious, onNext }: { page: number; totalPages: number; total: number; disabled: boolean; onPrevious: () => void; onNext: () => void }) { return <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-slate-500">الصفحة <strong className="text-slate-200">{page.toLocaleString("ar")}</strong> من <strong className="text-slate-200">{totalPages.toLocaleString("ar")}</strong> · إجمالي النتائج: <strong className="text-slate-200">{total.toLocaleString("ar")}</strong></p><div className="flex gap-2"><Button variant="outline" size="sm" className="border-white/10 text-slate-200" disabled={disabled || page <= 1} onClick={onPrevious}>السابق</Button><Button variant="outline" size="sm" className="border-white/10 text-slate-200" disabled={disabled || page >= totalPages} onClick={onNext}>التالي</Button></div></div>; }
function DateRangeFilter({ preset, onPresetChange, customFrom, customTo, onCustomFromChange, onCustomToChange }: { preset: DatePreset; onPresetChange: (value: DatePreset) => void; customFrom: string; customTo: string; onCustomFromChange: (value: string) => void; onCustomToChange: (value: string) => void }) {
  return <div className="mb-4 rounded-xl border border-white/8 bg-white/[0.018] p-3">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <label className="grid gap-1.5 text-xs font-bold text-slate-300">
        <span>الفترة الزمنية</span>
        <select value={preset} onChange={event => onPresetChange(event.target.value as DatePreset)} className="h-10 min-w-52 rounded-lg border border-white/10 bg-slate-950 px-3 text-sm font-normal text-slate-100 outline-none ring-cyan-400/50 focus:ring-2">
          <option value="today">اليوم</option><option value="7d">آخر 7 أيام</option><option value="30d">آخر 30 يومًا</option><option value="90d">آخر 90 يومًا</option><option value="all">كل الوقت</option><option value="custom">نطاق مخصص</option>
        </select>
      </label>
      <p className="text-xs leading-5 text-slate-500">تُخزن التواريخ بتوقيت UTC وتُعرض بتوقيت جهازك: <span className="font-mono text-slate-400">{timezoneLabel()}</span></p>
    </div>
    {preset === "custom" && <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1.5 text-xs font-bold text-slate-300"><span>من</span><Input type="date" value={customFrom} onChange={event => onCustomFromChange(event.target.value)} className="border-white/10 bg-slate-950 text-slate-100 [color-scheme:dark]" /></label>
      <label className="grid gap-1.5 text-xs font-bold text-slate-300"><span>إلى</span><Input type="date" value={customTo} onChange={event => onCustomToChange(event.target.value)} className="border-white/10 bg-slate-950 text-slate-100 [color-scheme:dark]" /></label>
    </div>}
  </div>;
}
function TableLoading({ columns }: { columns: number }) { return <tr><td colSpan={columns} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-cyan-300" /></td></tr>; }
function LoadingPanel() { return <div className="grid min-h-48 place-items-center rounded-2xl border border-white/8 bg-slate-950/55"><Loader2 className="h-6 w-6 animate-spin text-cyan-300" /></div>; }
function StatLine({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 border-b border-white/7 pb-3 text-sm"><dt className="text-slate-400">{label}</dt><dd className="font-bold text-slate-100">{value}</dd></div>; }
function InfoTile({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/8 bg-slate-950/55 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-200">{value}</p></div>; }
