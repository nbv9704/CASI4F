"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import LoadingState from "@/components/LoadingState";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  Calendar,
  Link as LinkIcon,
  Medal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { STATUS_OPTIONS } from "../constants";

const SOCIAL_KEYS = ["discord", "twitter", "twitch", "youtube"];
const SOCIAL_EMOJIS = {
  discord: "💬",
  twitter: "𝕏",
  twitch: "🎮",
  youtube: "▶️",
};

export default function PublicProfilePage({ params }) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams?.username || "");
  const { t, locale } = useLocale();
  const { user } = useUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const headers = { "Content-Type": "application/json" };
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (token) headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`/api/profile/public/${encodeURIComponent(username)}`, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        let data = null;
        try {
          data = await response.json();
        } catch (parseError) {
          /* ignore parse errors */
        }

        if (cancelled) return;

        if (!response.ok) {
          setError({
            status: response.status,
            code: data?.code || null,
            message: data?.message || null,
          });
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (fetchError) {
        if (cancelled || fetchError.name === "AbortError") return;
        setError({ status: 0, code: "NETWORK_ERROR" });
        setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (username) fetchProfile();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [revision, username]);

  const levelProgress = useMemo(() => {
    if (!profile) return 0;
    if (!profile.nextLevelExp || profile.nextLevelExp <= 0) return 100;
    const ratio = (profile.experience || 0) / profile.nextLevelExp;
    return Math.min(100, Math.max(0, Math.round(ratio * 100)));
  }, [profile]);

  const socialEntries = useMemo(() => {
    if (!profile?.socialLinks) return [];
    return SOCIAL_KEYS.map((key) => ({ key, value: profile.socialLinks[key] || "" }))
      .filter((entry) => Boolean(entry.value));
  }, [profile]);

  const stats = profile?.stats || {
    achievementsUnlocked: 0,
    achievementsTotal: 0,
    badgesOwned: 0,
  };

  const handleRetry = () => setRevision((value) => value + 1);

  if (!username) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState
          title={t("profile.public.notFound")}
          description={t("profile.public.invalidUsername")}
          onRetry={handleRetry}
          retryLabel={t("profile.public.retry")}
          backLabel={t("profile.public.back")}
        />
      </div>
    );
  }

  if (loading) {
    return <LoadingState message={t("profile.loading")} />;
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <ErrorState
          title={resolveErrorTitle(error, t)}
          description={resolveErrorDescription(error, t)}
          onRetry={handleRetry}
          retryLabel={t("profile.public.retry")}
          backLabel={t("profile.public.back")}
        />
      </div>
    );
  }

  const status = profile.status || {};
  const statusState = status.state || "online";
  const statusMessage = status.message || "";
  const statusIndicatorClass =
    STATUS_OPTIONS.find((option) => option.value === statusState)?.indicator ||
    "bg-emerald-500";
  const statusLabel = t(`profile.status.states.${statusState}`);
  const statusExpiresAtLabel = (() => {
    if (!statusMessage || !status.messageExpiresAt) return null;
    const expires = new Date(status.messageExpiresAt);
    if (Number.isNaN(expires.getTime())) return null;
    return expires.toLocaleString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  })();

  const isSelf = user?.username && user.username.toLowerCase() === username.toLowerCase();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.3),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur">
              <Image
                src={profile.avatar || "/default-avatar.png"}
                alt="Avatar"
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
              <span className="absolute inset-0 rounded-3xl border border-white/10" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">
                {t("profile.public.heroLabel")}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{profile.username}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${statusIndicatorClass}`} />
                  <span className="font-medium text-indigo-100">{statusLabel}</span>
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-200" />
                  <span>{t("profile.public.visibility", { mode: t(`profile.customize.visibility.${profile.profileVisibility}`) })}</span>
                </span>
                {profile.badges?.active && (
                  <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                    <BadgeCheck className="h-4 w-4 text-amber-200" />
                    <span className="font-medium text-amber-100">
                      {profile.badges.active.name}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/70">
              <span>{t("navbar.level.label")}: {profile.level}</span>
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
            <p className="mt-3 text-xs text-white/60">
              {t("profile.public.memberSince", {
                date: new Date(profile.createdAt || Date.now()).toLocaleDateString(locale),
              })}
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="relative z-10 mt-6 inline-flex max-w-3xl items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-indigo-50">
            <span className={`mt-1.5 flex h-2.5 w-2.5 shrink-0 rounded-full ${statusIndicatorClass}`} />
            <div>
              <p className="text-sm font-semibold text-indigo-50">{statusLabel}</p>
              <p className="mt-1 text-sm text-indigo-100">{statusMessage}</p>
              {statusExpiresAtLabel && (
                <p className="mt-2 text-xs uppercase tracking-wide text-indigo-200/70">
                  {t("profile.status.expiresAt", { time: statusExpiresAtLabel })}
                </p>
              )}
            </div>
          </div>
        )}

        {isSelf && (
          <div className="relative z-10 mt-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
            >
              {t("profile.public.manageOwn")}
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <Sparkles className="h-5 w-5 text-indigo-300" />
              <span>{t("profile.bio.heading")}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">
              {profile.bio ? profile.bio : t("profile.bio.empty")}
            </p>
          </section>

          <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-gray-200">
              {t("profile.socials.heading")}
            </h2>
            {socialEntries.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">
                {t("profile.socials.empty")}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {socialEntries.map(({ key, value }) => {
                  const isUrl = /^https?:\/\//i.test(value);
                  const label = t(`profile.socials.labels.${key}`);
                  const content = (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg">
                          {SOCIAL_EMOJIS[key] || "🔗"}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{label}</p>
                          <p className="mt-1 w-full max-w-xs truncate text-xs text-white/70">{value}</p>
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
                      {content}
                    </a>
                  ) : (
                    <div
                      key={key}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-200">
                {t("profile.showcase.heading")}
              </h2>
              <span className="text-xs uppercase tracking-wide text-white/50">
                {t("profile.customize.showcaseSelected", {
                  count: profile.achievements?.showcase?.length || 0,
                  limit: 3,
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
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-white/70">{item.description}</p>
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

          <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-200">
                {t("profile.achievements.heading")}
              </h2>
              <span className="text-xs uppercase tracking-wide text-white/50">
                {t("profile.achievements.summary", {
                  completed: profile.achievements?.totals?.completed || 0,
                  total: profile.achievements?.totals?.total || 0,
                })}
              </span>
            </div>
            {profile.achievements?.list?.length ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {profile.achievements.list.map((achievement) => (
                  <div
                    key={achievement.code}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{achievement.name}</p>
                        <p className="mt-1 text-sm text-white/70">{achievement.description}</p>
                      </div>
                      <Award className="h-5 w-5 text-emerald-300" />
                    </div>
                    {achievement.earnedAt && (
                      <p className="mt-3 text-xs text-white/60">
                        {t("profile.achievements.earnedOn", {
                          date: new Date(achievement.earnedAt).toLocaleDateString(locale),
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/60">
                {t("profile.achievements.empty")}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <BadgeCheck className="h-5 w-5 text-amber-300" />
              <span>{t("profile.badges.heading")}</span>
            </div>
            <div className="mt-5 space-y-3">
              <p className="text-xs uppercase tracking-wide text-white/60">
                {t("profile.badges.active")}
              </p>
              <p className="text-sm text-white/80">
                {profile.badges?.active
                  ? profile.badges.active.name
                  : t("profile.badges.none")}
              </p>
              <p className="mt-4 text-xs uppercase tracking-wide text-white/60">
                {t("profile.badges.owned")}
              </p>
              {profile.badges?.owned?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.badges.owned.map((badge) => (
                    <span
                      key={badge.code}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        badge.code === profile.badges?.active?.code
                          ? "bg-amber-400/20 text-amber-100 border border-amber-500/40"
                          : "bg-white/10 text-white/70 border border-white/10"
                      }`}
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-white/60">
                  {t("profile.badges.empty")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <Medal className="h-5 w-5 text-indigo-300" />
              <span>{t("profile.stats.heading")}</span>
            </div>
            <div className="mt-5 space-y-4">
              <StatItem
                label={t("profile.stats.achievements")}
                value={`${stats.achievementsUnlocked} / ${stats.achievementsTotal}`}
              />
              <StatItem
                label={t("profile.stats.badges")}
                value={stats.badgesOwned}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 text-sm text-white/70 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <Calendar className="h-5 w-5 text-indigo-300" />
              <span>{t("profile.public.metaHeading")}</span>
            </div>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-wide text-white/60">
                <dt>{t("profile.public.joinedLabel")}</dt>
                <dd className="text-white/80">
                  {new Date(profile.createdAt || Date.now()).toLocaleDateString(locale)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function ErrorState({ title, description, onRetry, retryLabel, backLabel }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center text-white shadow-xl backdrop-blur">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
        <AlertTriangle className="h-6 w-6 text-red-300" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-white/70">{description}</p>
      )}
      <button
        type="button"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
        onClick={onRetry}
      >
        {retryLabel}
      </button>
      <Link
        href="/game"
        className="mt-3 block text-xs font-semibold uppercase tracking-wide text-indigo-200 hover:text-indigo-100"
      >
        {`← ${backLabel}`}
      </Link>
    </div>
  );
}

function resolveErrorTitle(error, t) {
  if (!error) return t("profile.public.errorTitle");
  if (error.status === 404) return t("profile.public.notFound");
  if (error.status === 403 || error.code === "PROFILE_NOT_VISIBLE") {
    return t("profile.public.private");
  }
  if (error.status === 401) return t("profile.public.unauthorized");
  return t("profile.public.errorTitle");
}

function resolveErrorDescription(error, t) {
  if (!error) return t("profile.public.errorDescription");
  if (error.status === 404) return t("profile.public.errorDescription");
  if (error.status === 403 || error.code === "PROFILE_NOT_VISIBLE") {
    return t("profile.public.privateDescription");
  }
  if (error.status === 401) return t("profile.public.unauthorizedDescription");
  if (error.code === "NETWORK_ERROR") return t("profile.public.networkError");
  return t("profile.public.errorDescription");
}
