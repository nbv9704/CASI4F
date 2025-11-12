// client/src/app/profile/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import RequireAuth from "@/components/RequireAuth";
import LoadingState from "@/components/LoadingState";
import useApi from "@/hooks/useApi";
import { useUser } from "@/context/UserContext";
import { useLocale } from "@/context/LocaleContext";
import {
  Award,
  BadgeCheck,
  Calendar,
  Copy,
  History as HistoryIcon,
  Layers,
  Link as LinkIcon,
  Medal,
  Package2,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { SHOWCASE_LIMIT, SOCIAL_EMOJIS, SOCIAL_KEYS, STATUS_OPTIONS } from "./constants";

function ProfilePage() {
  const { user } = useUser();
  const { t, locale } = useLocale();
  const { get } = useApi();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    get("/profile/me")
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
      })
      .catch(() => {
        /* handled by useApi */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [get, user]);

  const handleCopyId = () => {
    const id = profile?.id || user?.id;
    if (!id || typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error(t("common.copyUnsupported"));
      return;
    }

    navigator.clipboard
      .writeText(id)
      .then(() => toast.success(t("common.copyShortSuccess")))
      .catch(() => toast.error(t("common.copyFailure")));
  };

  const levelProgress = useMemo(() => {
    if (!profile) return 0;
    if (!profile.nextLevelExp || profile.nextLevelExp <= 0) return 100;
    const ratio = (profile.experience || 0) / profile.nextLevelExp;
    return Math.min(100, Math.max(0, Math.round(ratio * 100)));
  }, [profile]);

  const tipsValue = t("profile.tips");
  const safetyTips = Array.isArray(tipsValue) ? tipsValue : [];

  const birthDate = user?.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString(locale)
    : t("profile.birthDateFallback");

  const socialEntries = SOCIAL_KEYS.map((key) => ({
    key,
    value: profile?.socialLinks?.[key] || "",
  })).filter((entry) => entry.value);

  const stats = profile?.stats || {
    achievementsUnlocked: 0,
    achievementsTotal: 0,
    badgesOwned: 0,
  };
  const showcaseCount = profile?.achievements?.showcase?.length || 0;

  if (!user || loading || !profile) {
    return <LoadingState message={t("profile.loading")} />;
  }

  const status = profile.status || {};
  const statusState = status.state || "online";
  const statusIndicatorClass =
    STATUS_OPTIONS.find((option) => option.value === statusState)?.indicator ||
    "bg-emerald-500";
  const statusLabel = t(`profile.status.states.${statusState}`);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.3),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur">
              <Image
                src={profile.avatar || user.avatar || "/default-avatar.png"}
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
                {profile.username || user.username}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${statusIndicatorClass}`} />
                  <span className="font-medium text-indigo-100">{statusLabel}</span>
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-200" />
                  <span className="font-medium capitalize">
                    {t("settings.badges.role")}: {user.role || "user"}
                  </span>
                </span>
                {profile.badges?.active && (
                  <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <BadgeCheck className="h-4 w-4 text-amber-200" />
                    <span className="font-medium text-amber-100">
                      {profile.badges.active.name}
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
                >
                  <Copy className="h-4 w-4" />
                  <span>{t("settings.badges.copyButton", { id: profile.id })}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
              <span>
                {t("navbar.level.label")}: {profile.level}
              </span>
              <span>
                {profile.nextLevelExp && profile.nextLevelExp > 0
                  ? t("profile.levelProgressValue", {
                      current: profile.experience,
                      total: profile.nextLevelExp,
                    })
                  : t("profile.levelMax")}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status message hidden per requirements */}
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <UserCircle2 className="h-5 w-5 text-indigo-300" />
              <span>{t("profile.accountInfo")}</span>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <InfoCard
                label="Email"
                value={user.email || t("profile.emailFallback")}
              />
              <InfoCard
                label={t("profile.birthDate")}
                value={birthDate}
                icon={Calendar}
              />
              <InfoCard
                label={t("profile.status.label")}
                value={statusLabel}
                icon={ShieldCheck}
              />
              <InfoCard
                label={t("profile.security")}
                value={t("profile.securityValue")}
                icon={ShieldCheck}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-gray-200">
              {t("profile.bio.heading")}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">
              {profile.bio ? profile.bio : t("profile.bio.empty")}
            </p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-200">
                {t("profile.socials.heading")}
              </h3>
              {socialEntries.length === 0 ? (
                <p className="mt-2 text-sm text-white/60">
                  {t("profile.socials.empty")}
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {socialEntries.map(({ key, value }) => {
                    const isUrl = /^https?:\/\//i.test(value);
                    const label = t(`profile.socials.labels.${key}`);
                    const display = (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg">
                            {SOCIAL_EMOJIS[key] || "🔗"}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {label}
                            </p>
                            <p className="mt-1 w-full max-w-xs truncate text-xs text-white/70">
                              {value}
                            </p>
                          </div>
                        </div>
                        {isUrl && (
                          <span className="flex items-center gap-1 text-xs text-indigo-200">
                            <LinkIcon className="h-4 w-4" />
                            {t("profile.socials.visit")}
                          </span>
                        )}
                      </div>
                    );

                    return isUrl ? (
                      <a
                        key={key}
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                      >
                        {display}
                      </a>
                    ) : (
                      <div
                        key={key}
                        className="rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        {display}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-200">
                {t("profile.showcase.heading")}
              </h2>
              <span className="text-xs uppercase tracking-wide text-white/50">
                {t("profile.customize.showcaseSelected", {
                  count: showcaseCount,
                  limit: SHOWCASE_LIMIT,
                })}
              </span>
            </div>
            {profile.achievements?.showcase?.length ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {profile.achievements.showcase.map((item) => (
                  <div
                    key={item.code}
                    className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-white/70">
                          {item.description}
                        </p>
                      </div>
                      <Sparkles className="h-5 w-5 text-amber-200" />
                    </div>
                    {item.earnedAt && (
                      <p className="mt-3 text-xs text-white/60">
                        {t("profile.achievements.earnedOn", {
                          date: new Date(item.earnedAt).toLocaleDateString(locale),
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/60">
                {t("profile.showcase.empty")}
              </p>
            )}
          </section>

        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold text-gray-200">
              {t("profile.quickActions")}
            </p>
            <div className="mt-4 space-y-3">
              <Link
                href="/profile/customize"
                className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/20"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{t("profile.customize.quickAction")}</span>
                </span>
                <span>→</span>
              </Link>
              <Link
                href="/collections"
                className="flex items-center justify-between gap-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
              >
                <span className="flex items-center gap-2">
                  <Package2 className="h-4 w-4" />
                  <span>{t("profile.collections.quickAction")}</span>
                </span>
                <span>→</span>
              </Link>
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
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <Layers className="h-5 w-5 text-indigo-300" />
              <span>{t("profile.stats.heading")}</span>
            </div>
            <div className="mt-5 space-y-4">
              <StatItem
                label={t("profile.stats.achievements")}
                value={`${stats.achievementsUnlocked} / ${stats.achievementsTotal}`}
                icon={Award}
              />
              <StatItem
                label={t("profile.stats.badges")}
                value={stats.badgesOwned}
                icon={Medal}
              />
            </div>
          </div>


          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <p className="text-sm font-semibold text-gray-200">
              {t("profile.safetyTips")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
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

function MailIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const InfoCard = ({ label, value, icon: Icon = MailIcon }) => (
  <div className="space-y-1 rounded-xl border border-white/5 bg-white/5 p-4">
    <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
    <div className="flex items-center gap-2 text-sm text-gray-100">
      {Icon && <Icon className="h-4 w-4 text-indigo-200" />}
      <span>{value}</span>
    </div>
  </div>
);

const StatItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
    <Icon className="h-6 w-6 text-indigo-200" />
  </div>
);

export default RequireAuth(ProfilePage);
