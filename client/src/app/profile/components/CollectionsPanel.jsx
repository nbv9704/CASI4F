"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Award, Package2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

const TAB_ACHIEVEMENTS = "achievements";
const TAB_INVENTORY = "inventory";

const normalizeCode = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

function formatDate(locale, value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(locale || "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch (error) {
    return "";
  }
}

export default function CollectionsPanel({ achievements, badges }) {
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState(TAB_ACHIEVEMENTS);

  const achievementOverrides = useMemo(() => {
    const value = t("collections.catalog.achievements");
    return value && typeof value === "object" ? value : {};
  }, [t]);

  const badgeOverrides = useMemo(() => {
    const value = t("collections.catalog.badges");
    return value && typeof value === "object" ? value : {};
  }, [t]);

  const achievementList = useMemo(() => {
    const list = achievements?.list || [];

    return list.map((item) => {
      const code = normalizeCode(item.code);
      const override = achievementOverrides[code] || {};

      return {
        ...item,
        code,
        displayName: override.name || item.name || code,
        displayDescription:
          override.description ?? item.description ?? "",
      };
    });
  }, [achievements, achievementOverrides]);

  const unlockedCount =
    achievements?.totals?.completed ??
    achievementList.filter((entry) => entry.completed).length;
  const totalCount =
    achievements?.totals?.total ?? achievementList.length;

  const inventory = useMemo(() => {
    if (!badges) return [];

    const catalogIndex = new Map(
      (badges.catalog || []).map((entry) => {
        const code = normalizeCode(entry.code);
        const override = badgeOverrides[code] || {};

        return [
          code,
          {
            ...entry,
            code,
            name: override.name || entry.name || code,
            description:
              override.description ?? entry.description ?? "",
            icon: entry.icon || "",
            tier: entry.tier || "common",
          },
        ];
      }),
    );

    return (badges.owned || [])
      .map((ownedBadge) => {
        const code = normalizeCode(ownedBadge.code);
        const catalogMeta = catalogIndex.get(code) || {};
        const override = badgeOverrides[code] || {};

        return {
          code,
          name:
            override.name ||
            ownedBadge.name ||
            catalogMeta.name ||
            code,
          description:
            override.description ??
            ownedBadge.description ??
            catalogMeta.description ??
            "",
          icon: ownedBadge.icon || catalogMeta.icon || "",
          tier: ownedBadge.tier || catalogMeta.tier || "common",
          owned: true,
          unlockedAt: ownedBadge.unlockedAt || null,
        };
      })
      .sort((a, b) => {
        const aTime = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const bTime = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [badges, badgeOverrides]);

  const resolveBadgeName = (code) => {
    const normalized = normalizeCode(code);
    if (!normalized) return "";
    return badgeOverrides[normalized]?.name || normalized;
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
          <Package2 className="h-5 w-5 text-indigo-300" />
          <span>{t("profile.collections.heading")}</span>
        </div>
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs font-semibold uppercase tracking-wide text-white/70">
          <button
            type="button"
            onClick={() => setActiveTab(TAB_ACHIEVEMENTS)}
            className={`rounded-full px-3 py-1 transition ${
              activeTab === TAB_ACHIEVEMENTS
                ? "bg-indigo-500 text-white"
                : "hover:bg-white/10"
            }`}
            aria-pressed={activeTab === TAB_ACHIEVEMENTS}
          >
            {t("profile.collections.tabs.achievements")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_INVENTORY)}
            className={`rounded-full px-3 py-1 transition ${
              activeTab === TAB_INVENTORY
                ? "bg-indigo-500 text-white"
                : "hover:bg-white/10"
            }`}
            aria-pressed={activeTab === TAB_INVENTORY}
          >
            {t("profile.collections.tabs.inventory")}
          </button>
        </div>
      </div>

      {activeTab === TAB_ACHIEVEMENTS ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-white/50">
            {t("profile.collections.achievementsSummary", {
              completed: unlockedCount,
              total: totalCount,
            })}
          </p>
          {achievementList.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {achievementList.map((achievement) => (
                <div
                  key={achievement.code}
                  className={`rounded-xl border p-4 ${
                    achievement.completed
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {achievement.displayName}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        {achievement.displayDescription ||
                          t("profile.collections.achievementNoDescription")}
                      </p>
                    </div>
                    <Award
                      className={`h-5 w-5 ${
                        achievement.completed ? "text-emerald-300" : "text-white/30"
                      }`}
                    />
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-wide">
                    {achievement.completed ? (
                      <span className="text-emerald-200">
                        {t("profile.collections.achievementCompleted")}
                      </span>
                    ) : (
                      <span className="text-white/50">
                        {t("profile.collections.achievementLocked")}
                      </span>
                    )}
                  </div>
                  {achievement.completed && achievement.earnedAt && (
                    <p className="mt-2 text-xs text-white/60">
                      {t("profile.collections.unlockedAt", {
                        date: formatDate(locale, achievement.earnedAt),
                      })}
                    </p>
                  )}
                  {achievement.badgeReward && (
                    <p className="mt-2 text-xs text-indigo-200">
                      {t("profile.collections.badgeReward", {
                        badge: resolveBadgeName(achievement.badgeReward),
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/60">
              {t("profile.collections.achievementsEmpty")}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5">
          {inventory.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {inventory.map((badge) => (
                <div
                  key={badge.code}
                  className={`relative flex gap-3 rounded-xl border p-4 ${
                    badge.owned
                      ? "border-amber-400/40 bg-amber-400/10"
                      : "border-white/10 bg-white/5 opacity-60"
                  }`}
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                    {badge.icon ? (
                      <Image
                        src={badge.icon}
                        alt={badge.name}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                        {badge.code.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {badge.name || badge.code}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      {t("profile.collections.badgeTier", { tier: badge.tier })}
                    </p>
                    {badge.description && (
                      <p className="text-sm text-white/70">{badge.description}</p>
                    )}
                    <p className="text-xs text-white/50">
                      {badge.unlockedAt
                        ? t("profile.collections.badgeOwnedSince", {
                            date: formatDate(locale, badge.unlockedAt),
                          })
                        : t("profile.collections.badgeOwned")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">
              {t("profile.collections.inventoryEmpty")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
