"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import RequireAuth from "@/components/RequireAuth";
import LoadingState from "@/components/LoadingState";
import { useLocale } from "@/context/LocaleContext";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

import {
  SHOWCASE_LIMIT,
  SOCIAL_EMOJIS,
  SOCIAL_KEYS,
  SOCIAL_PLACEHOLDERS,
  STATUS_OPTIONS,
  STATUS_MESSAGE_DURATION_OPTIONS,
  DEFAULT_STATUS_DURATION_MINUTES,
} from "../constants";

const VISIBILITY_OPTIONS = ["public", "friends", "private"];

function CustomizeProfilePage() {
  const { t } = useLocale();
  const { user, fetchUser } = useUser();
  const { get, patch } = useApi();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    get("/profile/me")
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        const derived = deriveFormState(data);
        setFormState(derived);
        setInitialState(derived);
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

  const isDirty = useMemo(() => {
    if (!formState || !initialState) return false;
    return JSON.stringify(formState) !== JSON.stringify(initialState);
  }, [formState, initialState]);

  const unlockedAchievements = useMemo(
    () =>
      (profile?.achievements?.list || [])
        .filter((achievement) => achievement.completed)
        .map((achievement) => ({
          code: achievement.code,
          name: achievement.name,
        })),
    [profile]
  );

  const showcaseSelected = formState?.achievementShowcase || [];

  const handleFieldChange = (field, value) => {
    setFormState((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSocialChange = (field, value) => {
    setFormState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: value,
        },
      };
    });
  };

  const handleShowcaseToggle = (code) => {
    setFormState((prev) => {
      if (!prev) return prev;
      const current = prev.achievementShowcase;
      const has = current.includes(code);

      if (has) {
        return {
          ...prev,
          achievementShowcase: current.filter((item) => item !== code),
        };
      }

      if (current.length >= SHOWCASE_LIMIT) {
        toast.error(
          t("profile.customize.toastShowcaseLimit", { limit: SHOWCASE_LIMIT })
        );
        return prev;
      }

      return {
        ...prev,
        achievementShowcase: [...current, code],
      };
    });
  };

  const handleDurationChange = (rawMinutes) => {
    setFormState((prev) => {
      if (!prev) return prev;
      const numeric = Number(rawMinutes);
      const allowed = STATUS_MESSAGE_DURATION_OPTIONS.map((option) => option.value);
      const fallback = DEFAULT_STATUS_DURATION_MINUTES;
      const nextValue = Number.isFinite(numeric) && allowed.includes(numeric)
        ? numeric
        : fallback;
      return { ...prev, statusMessageDurationMinutes: nextValue };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formState || saving) return;

    setSaving(true);
    try {
      const payload = buildPayload(formState);
      const updated = await patch("/profile/me", payload);
      setProfile(updated);
      const derived = deriveFormState(updated);
      setFormState(derived);
      setInitialState(derived);
      fetchUser?.();
      toast.success(t("profile.customize.toastSuccess"));
    } catch (error) {
      /* handled by useApi */
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading || !profile || !formState) {
    return <LoadingState message={t("profile.loading")} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-6 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-purple-200">
              {t("profile.customize.heroAccent")}
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {t("profile.customize.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              {t("profile.customize.description")}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              startTransition(() => {
                if (typeof window !== "undefined") {
                  window.history.back();
                }
              })
            }
            disabled={isPending}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:text-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("profile.customize.backToProfile")}</span>
          </button>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
            <Sparkles className="h-5 w-5 text-indigo-300" />
            <span>{t("profile.customize.identitySection")}</span>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-white">
                <span>{t("profile.customize.bioLabel")}</span>
                <span className="text-xs text-white/40">
                  {formState.bio.length}/300
                </span>
              </label>
              <textarea
                value={formState.bio}
                onChange={(event) => handleFieldChange("bio", event.target.value)}
                rows={4}
                maxLength={300}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
                placeholder={t("profile.customize.bioPlaceholder")}
                disabled={saving}
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-white">
                <span>{t("profile.customize.statusStateLabel")}</span>
                <span className="text-xs text-white/40">
                  {t("profile.customize.statusStateHint")}
                </span>
              </label>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {STATUS_OPTIONS.map((option) => {
                  const selected = formState.statusState === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFieldChange("statusState", option.value)}
                      disabled={saving}
                      aria-pressed={selected}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                        selected
                          ? "border-indigo-400/60 bg-indigo-500/20 text-white shadow-[0_0_25px_rgba(99,102,241,0.35)]"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${option.indicator}`} />
                      <span>{t(`profile.status.states.${option.value}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>{t("profile.customize.statusMessageLabel")}</span>
                  <span className="text-xs text-white/40">
                    {(formState.statusMessage || "").length}/140
                  </span>
                </label>
                <input
                  type="text"
                  value={formState.statusMessage}
                  onChange={(event) =>
                    handleFieldChange("statusMessage", event.target.value)
                  }
                  maxLength={140}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
                  placeholder={t("profile.customize.statusMessagePlaceholder")}
                  disabled={saving}
                />
                <p className="mt-1 text-xs text-white/50">
                  {t("profile.customize.statusMessageHint")}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-white">
                  {t("profile.customize.statusDurationLabel")}
                </label>
                <select
                  value={String(formState.statusMessageDurationMinutes)}
                  onChange={(event) => handleDurationChange(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
                  disabled={saving || !(formState.statusMessage && formState.statusMessage.length)}
                >
                  {STATUS_MESSAGE_DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                      {t(`profile.customize.statusDuration.options.${option.value}`)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-white/50">
                  {formState.statusMessage
                    ? t("profile.customize.statusDurationHintActive", {
                        duration: t(
                          `profile.customize.statusDuration.options.${formState.statusMessageDurationMinutes}`
                        ),
                      })
                    : t("profile.customize.statusDurationHintDisabled")}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-white">
                {t("profile.customize.visibilityLabel")}
              </label>
              <select
                value={formState.profileVisibility}
                onChange={(event) =>
                  handleFieldChange("profileVisibility", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
                disabled={saving}
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option} value={option} className="text-gray-900">
                    {t(`profile.customize.visibility.${option}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-white">
                {t("profile.customize.activeBadgeLabel")}
              </label>
              <select
                value={formState.activeBadge}
                onChange={(event) =>
                  handleFieldChange("activeBadge", event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
                disabled={saving}
              >
                <option value="" className="text-gray-900">
                  {t("profile.customize.activeBadgeNone")}
                </option>
                {profile.badges?.owned?.map((badge) => (
                  <option key={badge.code} value={badge.code} className="text-gray-900">
                    {badge.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
            <ShieldCheck className="h-5 w-5 text-indigo-300" />
            <span>{t("profile.customize.socialSection")}</span>
          </div>

          <p className="mt-1 text-xs text-white/50">
            {t("profile.customize.socialLinksHint")}
          </p>

          <div className="mt-4 space-y-3">
            {SOCIAL_KEYS.map((key) => (
              <div key={key}>
                <label className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>{t(`profile.socials.labels.${key}`)}</span>
                  <span className="text-xs text-white/40">
                    {t("profile.customize.optionalLabel")}
                  </span>
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
                    {SOCIAL_EMOJIS[key] || "🔗"}
                  </span>
                  <input
                    type="text"
                    value={formState.socialLinks[key]}
                    onChange={(event) => handleSocialChange(key, event.target.value)}
                    maxLength={200}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
                    placeholder={SOCIAL_PLACEHOLDERS[key] || ""}
                    disabled={saving}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <Sparkles className="h-5 w-5 text-emerald-300" />
              <span>{t("profile.customize.showcaseLabel")}</span>
            </div>
            <span className="text-xs uppercase tracking-wide text-white/50">
              {t("profile.customize.showcaseSelected", {
                count: showcaseSelected.length,
                limit: SHOWCASE_LIMIT,
              })}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/50">
            {t("profile.customize.showcaseHint", { limit: SHOWCASE_LIMIT })}
          </p>

          {unlockedAchievements.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {unlockedAchievements.map((achievement) => {
                const selected = showcaseSelected.includes(achievement.code);
                return (
                  <button
                    key={achievement.code}
                    type="button"
                    onClick={() => handleShowcaseToggle(achievement.code)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-100"
                        : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                    disabled={saving}
                  >
                    {achievement.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/60">
              {t("profile.customize.showcaseEmpty")}
            </p>
          )}
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link href="/profile" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
            {t("profile.customize.cancelButton")}
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-500/50"
            disabled={!isDirty || saving}
          >
            {saving ? t("profile.customize.saving") : t("profile.customize.saveButton")}
          </button>
        </div>
      </form>
    </div>
  );
}

const deriveFormState = (profile) => {
  const status = profile.status || {};
  const statusMessage = status.message || "";
  const expiresAt = status.messageExpiresAt ? new Date(status.messageExpiresAt) : null;
  const now = Date.now();
  const durations = STATUS_MESSAGE_DURATION_OPTIONS.map((option) => option.value);
  const pickClosestDuration = (targetMinutes) => {
    if (!durations.length) return DEFAULT_STATUS_DURATION_MINUTES;
    const normalized = Math.max(0, Math.round(targetMinutes));
    let closest = durations[0];
    let minDiff = Math.abs(durations[0] - normalized);
    for (let i = 1; i < durations.length; i += 1) {
      const diff = Math.abs(durations[i] - normalized);
      if (diff < minDiff) {
        closest = durations[i];
        minDiff = diff;
      }
    }
    return closest;
  };

  const inferredDuration = (() => {
    if (!statusMessage || !expiresAt || Number.isNaN(expiresAt.getTime())) {
      return DEFAULT_STATUS_DURATION_MINUTES;
    }
    const diffMinutes = Math.max(0, Math.round((expiresAt.getTime() - now) / 60000));
    if (diffMinutes === 0) return DEFAULT_STATUS_DURATION_MINUTES;
    return pickClosestDuration(diffMinutes);
  })();

  return {
    bio: profile.bio || "",
    statusState: status.state || "online",
    statusMessage,
    statusMessageDurationMinutes: inferredDuration,
    profileVisibility: profile.profileVisibility || "public",
    activeBadge: profile.badges?.active?.code || "",
    socialLinks: SOCIAL_KEYS.reduce((acc, key) => {
      acc[key] = profile.socialLinks?.[key] || "";
      return acc;
    }, {}),
    achievementShowcase: Array.isArray(profile.achievements?.showcase)
      ? profile.achievements.showcase.map((item) => item.code)
      : [],
  };
};

const buildPayload = (form) => {
  const trim = (value) => (typeof value === "string" ? value.trim() : value);
  const socialLinks = SOCIAL_KEYS.reduce((acc, key) => {
    acc[key] = trim(form.socialLinks?.[key] ?? "");
    return acc;
  }, {});

  const statusValues = new Set(STATUS_OPTIONS.map((option) => option.value));
  const durationValues = STATUS_MESSAGE_DURATION_OPTIONS.map((option) => option.value);
  const normalizeDuration = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return DEFAULT_STATUS_DURATION_MINUTES;
    if (durationValues.includes(numeric)) return numeric;
    return DEFAULT_STATUS_DURATION_MINUTES;
  };

  const trimmedStatusMessage = trim(form.statusMessage ?? "");

  return {
    bio: trim(form.bio ?? ""),
    statusState: statusValues.has(form.statusState) ? form.statusState : "online",
    statusMessage: trimmedStatusMessage,
    statusMessageDurationMinutes: trimmedStatusMessage
      ? normalizeDuration(form.statusMessageDurationMinutes)
      : null,
    profileVisibility: form.profileVisibility,
    activeBadge: form.activeBadge ? form.activeBadge : null,
    socialLinks,
    achievementShowcase: Array.isArray(form.achievementShowcase)
      ? form.achievementShowcase.filter(Boolean)
      : [],
  };
};

export default RequireAuth(CustomizeProfilePage);