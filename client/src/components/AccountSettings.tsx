import { Download, KeyRound, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LOCAL_PROGRESS_STORAGE = "dsa-academy-progress-v2";
const SYNC_QUEUE_STORAGE = "dsa-academy-progress-sync-queue-v1";
const PENDING_IMPORT_STORAGE = "dsa-academy-pending-server-import-v1";

function downloadJson(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dsa-learner-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AccountSettings() {
  const [, setLocation] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const changePassword = trpc.learner.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("تم تغيير كلمة المرور وإبطال الجلسات القديمة الأخرى.");
    },
  });
  const exportData = trpc.learner.exportData.useQuery(undefined, { enabled: false, retry: false });
  const deleteAccount = trpc.learner.deleteAccount.useMutation({
    onSuccess: () => {
      localStorage.removeItem(LOCAL_PROGRESS_STORAGE);
      localStorage.removeItem(SYNC_QUEUE_STORAGE);
      localStorage.removeItem(PENDING_IMPORT_STORAGE);
      setDeleteDialogOpen(false);
      setLocation("/register");
    },
  });

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("تأكيد كلمة المرور الجديدة غير مطابق.");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  }

  async function exportMyData() {
    const result = await exportData.refetch();
    if (result.data) downloadJson(result.data);
  }

  function confirmDelete() {
    setDeleteMessage("");
    if (deleteConfirmation !== "حذف حسابي") {
      setDeleteMessage("اكتب «حذف حسابي» حرفيًا لتأكيد هذا الإجراء.");
      return;
    }
    deleteAccount.mutate({ confirmation: "حذف حسابي" });
  }

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-2" aria-label="إعدادات الحساب">
      <article className="rounded-2xl border border-white/10 bg-[#0d2637] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-bold text-teal-200">إعدادات الحساب</p><h2 className="mt-1 text-xl font-extrabold text-white">كلمة المرور والبيانات</h2></div>
          <KeyRound className="h-6 w-6 shrink-0 text-teal-300" />
        </div>
        <form className="mt-5 space-y-4" onSubmit={submitPassword} noValidate>
          <label className="block text-sm font-bold text-slate-200">كلمة المرور الحالية<input required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} type="password" autoComplete="current-password" dir="ltr" className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-[#081b29] px-3 text-left text-sm text-white outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-200">كلمة المرور الجديدة<input required value={newPassword} onChange={event => setNewPassword(event.target.value)} type="password" minLength={12} maxLength={128} autoComplete="new-password" dir="ltr" className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-[#081b29] px-3 text-left text-sm text-white outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10" /></label>
            <label className="block text-sm font-bold text-slate-200">تأكيد كلمة المرور<input required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} type="password" minLength={12} maxLength={128} autoComplete="new-password" dir="ltr" className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-[#081b29] px-3 text-left text-sm text-white outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300/10" /></label>
          </div>
          {(passwordMessage || changePassword.error?.message) && <p role="status" className={`text-sm leading-6 ${changePassword.error ? "text-rose-200" : "text-teal-200"}`}>{changePassword.error?.message ?? passwordMessage}</p>}
          <button type="submit" disabled={changePassword.isPending} className="inline-flex h-10 items-center gap-2 rounded-xl border border-teal-300/40 px-4 text-sm font-extrabold text-teal-100 transition hover:bg-teal-300/10 disabled:opacity-60"><KeyRound className="h-4 w-4" />{changePassword.isPending ? "جارٍ التحديث…" : "تغيير كلمة المرور"}</button>
        </form>
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-sm font-bold text-slate-100">نسخة من بياناتك</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">حمّل ملف JSON يتضمن ملفك وتقدمك ومراجع شهاداتك، من دون كلمات المرور أو الجلسات أو الأسرار.</p>
          {exportData.error && <p role="alert" className="mt-3 text-sm text-rose-200">{exportData.error.message}</p>}
          <button type="button" onClick={() => void exportMyData()} disabled={exportData.isFetching} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-extrabold text-slate-100 transition hover:bg-white/10 disabled:opacity-60"><Download className="h-4 w-4" />{exportData.isFetching ? "جارٍ تجهيز الملف…" : "تصدير بياناتي"}</button>
        </div>
      </article>

      <article className="rounded-2xl border border-rose-300/20 bg-[#0d2637] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-rose-200">منطقة حساسة</p><h2 className="mt-1 text-xl font-extrabold text-white">حذف الحساب</h2></div><Trash2 className="h-6 w-6 shrink-0 text-rose-200" /></div>
        <p className="mt-4 text-sm leading-7 text-slate-300">سيُحذف ملف حسابك وتقدمك الخاص ورموز الاستعادة. تبقى الشهادات العامة الصادرة قابلة للتحقق، لكنها لن ترتبط بحسابك المحذوف.</p>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <button type="button" onClick={() => setDeleteDialogOpen(true)} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-rose-300/35 px-4 text-sm font-extrabold text-rose-100 transition hover:bg-rose-300/10"><Trash2 className="h-4 w-4" />حذف الحساب…</button>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader><AlertDialogTitle>هل تريد حذف الحساب نهائيًا؟</AlertDialogTitle><AlertDialogDescription>لن يمكن استعادة تقدمك أو ملفك بعد الإكمال. لن تتغير بيانات التحقق العلنية للشهادات التي صدرت مسبقًا.</AlertDialogDescription></AlertDialogHeader>
            <label className="block text-sm font-bold text-slate-700">اكتب «حذف حسابي» للتأكيد<input value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" /></label>
            {(deleteMessage || deleteAccount.error?.message) && <p role="alert" className="text-sm text-rose-700">{deleteAccount.error?.message ?? deleteMessage}</p>}
            <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction disabled={deleteAccount.isPending} onClick={confirmDelete} className="bg-rose-600 text-white hover:bg-rose-700">{deleteAccount.isPending ? "جارٍ الحذف…" : "حذف الحساب"}</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </article>
    </section>
  );
}
