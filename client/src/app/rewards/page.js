"use client";

import RequireAuth from "@/components/RequireAuth";
import { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "../../hooks/useApi";
import { useUser } from "../../context/UserContext";
import LoadingState from "@/components/LoadingState";
import { toast } from "react-hot-toast";
import {
  DAILY_CHECKIN_EXP,
  LEVEL_TIERS,
  getExpToNextLevel,
} from "../../utils/level";
import { useLocale } from "../../context/LocaleContext";
import { Gift } from "lucide-react";

const COOLDOWN_MS = {
  checkin: 24 * 3600 * 1000,
  hourly: 3600 * 1000,
  daily: 24 * 3600 * 1000,
  weekly: 7 * 24 * 3600 * 1000,
};

const REWARD_ORDER = ["checkin", "hourly", "daily", "weekly"];
const PERIODIC_TYPES = ["hourly", "daily", "weekly"];
const PERIODIC_AMOUNTS = { hourly: 10, daily: 100, weekly: 1000 };

function formatTime(seconds) {
  if (seconds <= 0) return "0s";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  let result = "";
  if (days) result += `${days}d`;
  if (hours) result += `${hours}h`;
  if (minutes) result += `${minutes}m`;
  if (secs || !result) result += `${secs}s`;
  return result;
}

function formatLevelRange(from, to) {
  if (from === to) return `${from}`;
  return `${from}-${to}`;
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function RewardsPage() {
  const { user, updateBalance, updateProgress } = useUser();
  const { get, post } = useApi();
  const { t, locale } = useLocale();

  const resolveMessage = useCallback(
    (key, fallback) => {
      const value = t(key);
      return typeof value === "string" && value !== key ? value : fallback;
    },
    [t],
  );

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale || "en-US"),
    [locale],
  );

  const [status, setStatus] = useState({
    checkin: 0,
    hourly: 0,
    daily: 0,
    weekly: 0,
  });
  const [remaining, setRemaining] = useState({
    checkin: 0,
    hourly: 0,
    daily: 0,
    weekly: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [activeTab, setActiveTab] = useState("periodic");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [levelRewards, setLevelRewards] = useState(null);
  const [levelRewardsLoading, setLevelRewardsLoading] = useState(true);
  const [levelRewardsError, setLevelRewardsError] = useState("");
  const [claimingLevel, setClaimingLevel] = useState(null);

  const tabOptions = useMemo(
    () => [
      { id: "periodic", label: t("rewardsPage.tabs.periodic") },
      { id: "checkin", label: t("rewardsPage.tabs.checkin") },
      { id: "level", label: t("rewardsPage.tabs.level") },
    ],
    [t],
  );

  const periodicConfig = useMemo(
    () => ({
      hourly: {
        label: t("rewardsPage.periodic.cards.hourly.label"),
        description: t("rewardsPage.periodic.cards.hourly.description", {
          amount: numberFormatter.format(PERIODIC_AMOUNTS.hourly),
        }),
        amountFormatted: numberFormatter.format(PERIODIC_AMOUNTS.hourly),
      },
      daily: {
        label: t("rewardsPage.periodic.cards.daily.label"),
        description: t("rewardsPage.periodic.cards.daily.description", {
          amount: numberFormatter.format(PERIODIC_AMOUNTS.daily),
        }),
        amountFormatted: numberFormatter.format(PERIODIC_AMOUNTS.daily),
      },
      weekly: {
        label: t("rewardsPage.periodic.cards.weekly.label"),
        description: t("rewardsPage.periodic.cards.weekly.description", {
          amount: numberFormatter.format(PERIODIC_AMOUNTS.weekly),
        }),
        amountFormatted: numberFormatter.format(PERIODIC_AMOUNTS.weekly),
      },
    }),
    [numberFormatter, t],
  );

  const weekdayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const base = new Date(2024, 0, 7 + index);
      return new Intl.DateTimeFormat(locale || "en-US", {
        weekday: "short",
      }).format(base);
    });
  }, [locale]);

  const calendarLabel = useMemo(() => {
    return new Intl.DateTimeFormat(locale || "en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(calendarMonth.year, calendarMonth.month, 1));
  }, [calendarMonth, locale]);

  const historyStorageKey = useMemo(() => {
    if (!user?.id) return null;
    return `casi4f-checkins-${user.id}`;
  }, [user?.id]);

  const registerCheckinDate = useCallback((inputDate) => {
    if (!inputDate) return;
    const key = getDateKey(inputDate);
    setCheckinHistory((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      next.sort();
      return next;
    });
  }, []);

  const calendarWeeks = useMemo(() => {
    const { month, year } = calendarMonth;
    const firstOfMonth = new Date(year, month, 1);
    const leadingDays = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < leadingDays; i += 1) {
      const date = new Date(year, month, i - leadingDays + 1);
      cells.push({ date, inMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(year, month, day), inMonth: true });
    }

    while (cells.length % 7 !== 0) {
      const lastDate = cells[cells.length - 1].date;
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + 1);
      cells.push({ date: nextDate, inMonth: false });
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [calendarMonth]);

  const checkinDate = useMemo(
    () => (status.checkin ? new Date(status.checkin) : null),
    [status.checkin],
  );
  const checkinHistorySet = useMemo(
    () => new Set(checkinHistory),
    [checkinHistory],
  );
  const today = new Date();
  const todayKey = getDateKey(today);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const isViewingCurrentMonth =
    calendarMonth.year === today.getFullYear() &&
    calendarMonth.month === today.getMonth();

  const lastCheckInLabel = useMemo(() => {
    if (!checkinDate) return null;
    return new Intl.DateTimeFormat(locale || "en-US", {
      dateStyle: "medium",
    }).format(checkinDate);
  }, [checkinDate, locale]);

  const isCheckinInView =
    !!checkinDate &&
    checkinDate.getFullYear() === calendarMonth.year &&
    checkinDate.getMonth() === calendarMonth.month;

  const goToPrevMonth = () =>
    setCalendarMonth((prev) => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });

  const goToNextMonth = () =>
    setCalendarMonth((prev) => {
      if (
        prev.year === today.getFullYear() &&
        prev.month === today.getMonth()
      ) {
        return prev;
      }
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });

  const goToCurrentMonth = () => {
    setCalendarMonth({ month: today.getMonth(), year: today.getFullYear() });
  };

  useEffect(() => {
    if (!historyStorageKey || typeof window === "undefined") {
      setCheckinHistory([]);
      return;
    }
    try {
      const raw = window.localStorage.getItem(historyStorageKey);
      if (!raw) {
        setCheckinHistory([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCheckinHistory(parsed);
      } else {
        setCheckinHistory([]);
      }
    } catch (error) {
      console.error("Failed to load check-in history", error);
      setCheckinHistory([]);
    }
  }, [historyStorageKey]);

  useEffect(() => {
    if (!historyStorageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        historyStorageKey,
        JSON.stringify(checkinHistory),
      );
    } catch (error) {
      console.error("Failed to persist check-in history", error);
    }
  }, [checkinHistory, historyStorageKey]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    get("/rewards")
      .then((data) => {
        setStatus({
          checkin: data.checkIn ? new Date(data.checkIn).getTime() : 0,
          hourly: data.hourly ? new Date(data.hourly).getTime() : 0,
          daily: data.daily ? new Date(data.daily).getTime() : 0,
          weekly: data.weekly ? new Date(data.weekly).getTime() : 0,
        });

        if (data.checkIn) {
          registerCheckinDate(new Date(data.checkIn));
        }

        if (data && data.level != null && data.experience != null) {
          updateProgress({
            level: data.level,
            experience: data.experience,
            nextLevelExp: data.nextLevelExp,
          });
        }

        setFetchError("");
      })
      .catch((err) => {
        console.error("Fetch rewards error:", err);
        setFetchError(err.message || "Failed to fetch rewards");
      })
      .finally(() => setLoading(false));
  }, [get, registerCheckinDate, updateProgress, user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadLevelRewards = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setLevelRewards(null);
          setLevelRewardsError("");
          setLevelRewardsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLevelRewardsLoading(true);
        setLevelRewardsError("");
      }

      try {
        const data = await get("/rewards/level");
        if (!cancelled) {
          setLevelRewards(data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setLevelRewards(null);
          setLevelRewardsError(
            err?.__payload?.message ||
              err?.message ||
              t("rewardsPage.levelRewards.error"),
          );
        }
      } finally {
        if (!cancelled) {
          setLevelRewardsLoading(false);
        }
      }
    };

    loadLevelRewards();

    return () => {
      cancelled = true;
    };
  }, [user?.id, get, t]);

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      setRemaining(() => {
        const next = {};
        for (const type of REWARD_ORDER) {
          const last = status[type] || 0;
          const cooldown = COOLDOWN_MS[type];
          if (!cooldown) {
            next[type] = 0;
            continue;
          }
          const diff = cooldown - (now - last);
          next[type] = Math.max(0, Math.ceil(diff / 1000));
        }
        return next;
      });
    };

    updateTimers();
    const intervalId = setInterval(updateTimers, 1000);
    return () => clearInterval(intervalId);
  }, [status]);

  const handleCollect = (type) => {
    const endpoint =
      type === "checkin" ? "/rewards/checkin" : `/rewards/${type}`;

    post(endpoint)
      .then((data) => {
        const now = Date.now();
        setStatus((prev) => ({ ...prev, [type]: now }));

        if (type === "checkin") {
          registerCheckinDate(new Date(now));
          updateProgress({
            level: data.level,
            experience: data.experience,
            nextLevelExp: data.nextLevelExp,
          });
          goToCurrentMonth();
          toast.success(
            t("rewardsPage.checkin.toast", { exp: DAILY_CHECKIN_EXP }),
          );
          if (data.leveledUp) {
            toast.success(
              t("rewardsPage.checkin.levelUpToast", { level: data.level }),
            );
          }
        } else {
          if (typeof data.balance === "number") {
            updateBalance(data.balance);
          }
          const config = periodicConfig[type];
          toast.success(
            t("rewardsPage.periodic.toast", {
              amount: config?.amountFormatted || "",
            }),
          );
        }
      })
      .catch((err) => {
        const data = err.response?.data;
        if (data?.nextAvailable && COOLDOWN_MS[type]) {
          const next = new Date(data.nextAvailable).getTime();
          const lastCollect = next - COOLDOWN_MS[type];
          setStatus((prev) => ({ ...prev, [type]: lastCollect }));
        }
        toast.error(data?.error || err.message);
      });
  };

    const handleClaimLevelReward = useCallback(
      async (targetLevel) => {
        setClaimingLevel(targetLevel);
        try {
          const response = await post(`/rewards/level/${targetLevel}`);

          setLevelRewards((prev) => {
            if (!prev) return prev;

            const claimedSet = new Set(
              Array.isArray(response?.claimed) ? response.claimed : prev.claimed || [],
            );
            claimedSet.add(targetLevel);

            const updatedRewards = (prev.rewards || []).map((entry) => {
              if (!entry) return entry;

              if (claimedSet.has(entry.level) || entry.level === targetLevel) {
                return { ...entry, status: "claimed" };
              }

              const currentLevel = response?.level ?? prev.level ?? 0;
              if (currentLevel >= entry.level && entry.status === "locked") {
                return { ...entry, status: "available" };
              }

              return entry;
            });

            return {
              ...prev,
              level: response?.level ?? prev.level,
              experience: response?.experience ?? prev.experience,
              nextLevelExp: response?.nextLevelExp ?? prev.nextLevelExp,
              rewards: updatedRewards,
              claimed: Array.from(claimedSet).sort((a, b) => a - b),
            };
          });

          if (typeof response?.balance === "number") {
            updateBalance(response.balance);
          }

          if (
            Number.isFinite(response?.level) ||
            Number.isFinite(response?.experience) ||
            response?.nextLevelExp !== undefined
          ) {
            updateProgress({
              level: response.level,
              experience: response.experience,
              nextLevelExp: response.nextLevelExp,
            });
          }

          setLevelRewardsError("");
          toast.success(
            t("rewardsPage.levelRewards.toastClaimSuccess", { level: targetLevel }),
          );
        } catch (err) {
          const message =
            err?.__payload?.message ||
            err?.message ||
            t("rewardsPage.levelRewards.toastClaimError");
          toast.error(message);
        } finally {
          setClaimingLevel(null);
        }
      },
      [post, updateBalance, updateProgress, t],
    );

  if (!user) {
    const loginMessage = resolveMessage(
      "rewardsPage.loginRequired",
      "Please sign in to view rewards.",
    );
    return <LoadingState message={loginMessage} />;
  }

  if (loading) {
    const loadingMessage = resolveMessage(
      "rewardsPage.loading",
      "Loading rewards…",
    );
    return <LoadingState message={loadingMessage} />;
  }

  const baseLevel = user.level || 1;
  const baseExperience = Number.isFinite(user.experience) ? user.experience : 0;
  const baseNextLevelExp = user.nextLevelExp ?? getExpToNextLevel(baseLevel);

  const effectiveLevel = levelRewards?.level ?? baseLevel;
  const effectiveExperience = Number.isFinite(levelRewards?.experience)
    ? levelRewards.experience
    : baseExperience;
  const effectiveNextLevelExp =
    levelRewards?.nextLevelExp !== undefined && levelRewards?.nextLevelExp !== null
      ? levelRewards.nextLevelExp
      : baseNextLevelExp;

  const isMaxLevel = effectiveNextLevelExp == null;
  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.round((effectiveExperience / effectiveNextLevelExp) * 100));
  const expRemaining = !isMaxLevel
    ? Math.max(0, effectiveNextLevelExp - effectiveExperience)
    : 0;
  const canInteract = !loading && !fetchError;

  const periodicReady = (type) => canInteract && remaining[type] === 0;
  const checkinReady = canInteract && remaining.checkin === 0;
  const checkinStatusText = checkinReady
    ? t("rewardsPage.checkin.statusReady")
    : t("rewardsPage.checkin.statusWait", {
        time: formatTime(remaining.checkin),
      });
  const checkinButtonLabel = checkinReady
    ? t("rewardsPage.checkin.buttonReady")
    : t("rewardsPage.checkin.buttonWait", {
        time: formatTime(remaining.checkin),
      });
  const nextButtonDisabled = isViewingCurrentMonth;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300">
          {t("rewardsPage.header.accent")}
        </p>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-semibold text-white lg:text-3xl">
            {t("rewardsPage.header.title")}
          </h1>
          <p className="max-w-xl text-sm text-slate-300 lg:text-base">
            {t("rewardsPage.header.subtitle")}
          </p>
        </div>
      </div>

      {fetchError && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          {t("rewardsPage.alertFallback")}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {t("rewardsPage.progress.title")}
            </h2>
            <p className="text-sm text-slate-300">
              {t("rewardsPage.progress.subtitle")}
            </p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
            {t("navbar.level.label")} {effectiveLevel}
          </span>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-800/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-200">
          {isMaxLevel
            ? t("navbar.level.maxMessage")
            : `${numberFormatter.format(effectiveExperience)} / ${numberFormatter.format(
                effectiveNextLevelExp,
              )} EXP`}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/80 p-2 shadow-lg shadow-black/20">
        <div className="flex gap-2">
          {tabOptions.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-900"
                }`}
                aria-pressed={active}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "periodic" && (
        <section className="space-y-4">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-white">
              {t("rewardsPage.periodic.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {t("rewardsPage.periodic.description")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PERIODIC_TYPES.map((type) => {
              const config = periodicConfig[type];
              const ready = periodicReady(type);
              return (
                <div
                  key={type}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 text-left shadow-lg shadow-black/20"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {config.label}
                      </h3>
                      <p className="mt-1 text-sm text-slate-300">
                        {config.description}
                      </p>
                    </div>
                    <span className="rounded-lg bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                      +{config.amountFormatted}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCollect(type)}
                    disabled={!ready}
                    className={`mt-5 w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                      ready
                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                        : "cursor-not-allowed bg-slate-800 text-slate-400"
                    }`}
                  >
                    {ready
                      ? t("rewardsPage.periodic.ctaReady")
                      : t("rewardsPage.periodic.ctaWait", {
                          time: formatTime(remaining[type]),
                        })}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "checkin" && (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-white">
                {t("rewardsPage.checkin.title")}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {t("rewardsPage.checkin.description")}
              </p>
              <p
                className={`mt-2 text-xs ${
                  checkinReady ? "text-emerald-200" : "text-slate-300"
                }`}
              >
                {checkinStatusText}
              </p>
              {lastCheckInLabel && (
                <p className="mt-1 text-xs text-slate-400">
                  {t("rewardsPage.checkin.lastCheck", {
                    date: lastCheckInLabel,
                  })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleCollect("checkin")}
              disabled={!checkinReady}
              className={`w-full rounded-xl px-6 py-3 text-sm font-semibold transition lg:w-auto ${
                checkinReady
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "cursor-not-allowed bg-slate-800 text-slate-400"
              }`}
            >
              {checkinButtonLabel}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {t("rewardsPage.checkin.calendar.title")}
                </h3>
                <p className="text-xs text-slate-300">
                  {t("rewardsPage.checkin.calendar.subtitle")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  {t("rewardsPage.checkin.calendar.prev")}
                </button>
                <span className="min-w-[150px] text-center text-sm font-semibold capitalize text-white">
                  {calendarLabel}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  disabled={nextButtonDisabled}
                  className={`rounded-lg border border-slate-800 px-2 py-1 text-xs font-medium transition ${
                    nextButtonDisabled
                      ? "cursor-not-allowed bg-slate-900 text-slate-600"
                      : "bg-slate-900 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {t("rewardsPage.checkin.calendar.next")}
                </button>
                <button
                  type="button"
                  onClick={goToCurrentMonth}
                  className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-200 transition hover:bg-indigo-500/20"
                >
                  {t("rewardsPage.checkin.calendar.today")}
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              {weekdayLabels.map((label, index) => (
                <span key={`${label}-${index}`} className="text-center">
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarWeeks.map((week, weekIndex) =>
                week.map((cell, cellIndex) => {
                  const cellKey = getDateKey(cell.date);
                  const isChecked = checkinHistorySet.has(cellKey);
                  const isTodayCell = todayKey === cellKey;
                  const isPast = cell.date < todayStart;

                  const classes = [
                    "flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-sm transition",
                    cell.inMonth
                      ? "border-slate-800 bg-slate-900/60 text-slate-100"
                      : "border-transparent bg-slate-900/20 text-slate-600",
                  ];

                  if (cell.inMonth && isPast && !isChecked && !isTodayCell) {
                    classes.push("text-slate-500");
                  }
                  if (isTodayCell) {
                    classes.push("border-indigo-400 text-white");
                  }
                  if (isChecked) {
                    classes.push(
                      "border-emerald-400 bg-emerald-500/20 text-white shadow-inner shadow-emerald-400/40",
                    );
                  }

                  return (
                    <div
                      key={`${weekIndex}-${cellIndex}-${cellKey}`}
                      className={classes.join(" ")}
                    >
                      <span className="text-base font-semibold">
                        {cell.date.getDate()}
                      </span>
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${
                          isChecked
                            ? "bg-emerald-400"
                            : isTodayCell
                              ? "bg-indigo-400"
                              : "bg-transparent"
                        }`}
                      />
                    </div>
                  );
                }),
              )}
            </div>

            {checkinDate && !isCheckinInView && (
              <p className="mt-4 text-xs text-slate-400">
                {t("rewardsPage.checkin.calendar.outsideNotice", {
                  date: lastCheckInLabel,
                })}
              </p>
            )}

            {!checkinDate && checkinHistory.length === 0 && (
              <p className="mt-4 text-xs text-slate-400">
                {t("rewardsPage.checkin.calendar.empty")}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {t("rewardsPage.checkin.calendar.legend.checked")}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                {t("rewardsPage.checkin.calendar.legend.today")}
              </span>
            </div>
          </div>
        </section>
      )}

      {activeTab === "level" && (
        <section className="space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-xl font-semibold text-white">
              {t("rewardsPage.level.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {t("rewardsPage.level.description")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-lg shadow-black/20">
            <p className="text-sm text-slate-200">
              {isMaxLevel
                ? t("rewardsPage.level.capLabel")
                : t("rewardsPage.level.nextLabel", {
                    exp: numberFormatter.format(expRemaining),
                  })}
            </p>
          </div>

          {levelRewardsLoading ? (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 text-sm text-white/70 shadow-lg shadow-black/20">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 animate-spin text-amber-300" />
                <span>{t("rewardsPage.levelRewards.loading")}</span>
              </div>
            </div>
          ) : levelRewardsError ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-100 shadow-lg shadow-black/20">
              {levelRewardsError}
            </div>
          ) : levelRewards?.rewards?.length ? (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-lg shadow-black/20">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                  <Gift className="h-5 w-5" />
                  <span>{t("rewardsPage.levelRewards.heading")}</span>
                </div>
                <span className="text-xs uppercase tracking-wide text-white/50">
                  {t("rewardsPage.levelRewards.currentLevel", { level: effectiveLevel })}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {levelRewards.rewards.map((reward) => {
                  const coins = reward?.rewards?.coins || 0;
                  const xp = reward?.rewards?.xp || 0;
                  const isAvailable = reward?.status === "available";
                  const isClaimed = reward?.status === "claimed";
                  const disabled = !isAvailable || claimingLevel === reward.level;
                  const statusLabel = isClaimed
                    ? t("rewardsPage.levelRewards.claimed")
                    : isAvailable
                      ? t("rewardsPage.levelRewards.available")
                      : t("rewardsPage.levelRewards.locked");
                  const badgeClass = isClaimed
                    ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                    : isAvailable
                      ? "border border-indigo-400/40 bg-indigo-500/15 text-indigo-200"
                      : "border border-white/10 bg-slate-800/40 text-slate-300";

                  return (
                    <article
                      key={reward.level}
                      className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t("rewardsPage.levelRewards.levelLabel", { level: reward.level })}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-white/50">{statusLabel}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-white/70">
                        <p>
                          {t("rewardsPage.levelRewards.rewardCoins", {
                            amount: numberFormatter.format(coins),
                            unit: t("common.coins"),
                          })}
                        </p>
                        <p>
                          {t("rewardsPage.levelRewards.rewardXp", {
                            amount: numberFormatter.format(xp),
                          })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleClaimLevelReward(reward.level)}
                        disabled={disabled}
                        className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          disabled
                            ? "cursor-not-allowed border border-white/10 text-white/40"
                            : "border border-emerald-400/60 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                        }`}
                      >
                        {claimingLevel === reward.level
                          ? t("rewardsPage.levelRewards.claiming")
                          : t("rewardsPage.levelRewards.claimButton")}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/80 p-6 text-sm text-white/60 shadow-lg shadow-black/20">
              {t("rewardsPage.levelRewards.empty")}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/80 shadow-lg shadow-black/20">
            <table className="min-w-full divide-y divide-slate-800/70 text-sm text-slate-200">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">
                    {t("rewardsPage.level.table.range")}
                  </th>
                  <th className="px-4 py-3 text-left">
                    {t("rewardsPage.level.table.exp")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {LEVEL_TIERS.map((tier) => {
                  const active = effectiveLevel >= tier.from && effectiveLevel <= tier.to;
                  return (
                    <tr
                      key={tier.from}
                      className={
                        active
                          ? "bg-amber-500/10 text-amber-100"
                          : "odd:bg-slate-950/60 even:bg-slate-950/30"
                      }
                    >
                      <td className="px-4 py-3 font-medium">
                        {formatLevelRange(tier.from, tier.to)}
                      </td>
                      <td className="px-4 py-3">
                        {numberFormatter.format(tier.exp)} EXP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default RequireAuth(RewardsPage);
