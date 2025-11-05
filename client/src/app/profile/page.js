// client/src/app/profile/page.js
"use client";

import RequireAuth from "@/components/RequireAuth";
import { useUser } from "../../context/UserContext";
import Loading from "../../components/Loading";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useLocale } from "../../context/LocaleContext";
import {
  Calendar,
  Copy,
  History as HistoryIcon,
  Mail,
  Settings as SettingsIcon,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

function ProfilePage() {
  const { user } = useUser();
  const { t, locale } = useLocale();
  const tipList = t("profile.tips");
  const safetyTips = Array.isArray(tipList) ? tipList : [];

  if (!user) return <Loading text={t("profile.loading")} />;

  const handleCopyId = () => {
    if (!user?.id || typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error(t("common.copyUnsupported"));
      return;
    }

    navigator.clipboard
      .writeText(user.id)
      .then(() => toast.success(t("common.copyShortSuccess")))
      .catch(() => toast.error(t("common.copyFailure")));
  };

  const birthDate = user.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString(locale)
    : t("profile.birthDateFallback");

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.3),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur">
              <Image
                src={user.avatar || "/default-avatar.png"}
                alt="Avatar"
                fill
                sizes="112px"
                className="object-cover"
                priority
                unoptimized
              />
              <span className="absolute inset-0 rounded-3xl border border-white/10" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">
                {t("profile.heroAccent")}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {user.username}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-200" />
                  <span className="font-medium capitalize">
                    {t("settings.badges.role")}: {user.role || "user"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
                >
                  <Copy className="h-4 w-4" />
                  <span>
                    {t("settings.badges.copyButton", { id: user.id })}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-white/5 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
            <UserCircle2 className="h-5 w-5 text-indigo-300" />
            <span>{t("profile.accountInfo")}</span>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">
                Email
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-100">
                <Mail className="h-4 w-4 text-indigo-200" />
                <span>{user.email || t("profile.emailFallback")}</span>
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">
                {t("profile.birthDate")}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-100">
                <Calendar className="h-4 w-4 text-indigo-200" />
                <span>{birthDate}</span>
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">
                {t("profile.status")}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-100">
                <ShieldCheck className="h-4 w-4 text-indigo-200" />
                <span>{t("profile.statusValue")}</span>
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">
                {t("profile.security")}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-100">
                <ShieldCheck className="h-4 w-4 text-indigo-200" />
                <span>{t("profile.securityValue")}</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 p-6 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold text-gray-200">
              {t("profile.quickActions")}
            </p>
            <div className="mt-4 space-y-3">
              <Link
                href="/settings"
                className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
              >
                <span className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  <span>{t("profile.settings")}</span>
                </span>
                <span>→</span>
              </Link>
              <Link
                href="/history"
                className="flex items-center justify-between gap-3 rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
              >
                <span className="flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4" />
                  <span>{t("profile.history")}</span>
                </span>
                <span>→</span>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 p-6 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold text-gray-200">
              {t("profile.safetyTips")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70 list-disc list-inside">
              {safetyTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default RequireAuth(ProfilePage);
