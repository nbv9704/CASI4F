"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, ArrowLeft, Medal, Package2 } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import LoadingState from "@/components/LoadingState";
import useApi from "@/hooks/useApi";
import { useUser } from "@/context/UserContext";
import { useLocale } from "@/context/LocaleContext";
import CollectionsPanel from "../profile/components/CollectionsPanel";

function CollectionsPage() {
  const { user } = useUser();
  const { t } = useLocale();
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
        /* useApi handles errors globally */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [get, user]);

  const stats = useMemo(() => {
    const achievements = profile?.achievements;
    const badges = profile?.badges;

    const completed = achievements?.totals?.completed ?? 0;
    const total = achievements?.totals?.total ?? completed;
    const badgeCount = badges?.owned?.length ?? 0;

    return {
      achievementsLabel: t("collections.stats.achievements", {
        completed,
        total,
      }),
      badgesLabel: t("collections.stats.badges", { count: badgeCount }),
      achievements,
      badges,
    };
  }, [profile, t]);

  if (!user || loading || !profile) {
    return <LoadingState message={t("collections.loading")} />;
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-900 p-8 text-white shadow-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),_transparent_55%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 flex flex-col gap-8">
          <Link
            href="/profile"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("collections.back")}</span>
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-indigo-200">
                <Package2 className="h-5 w-5" />
                <span>{t("collections.heading")}</span>
              </div>
              <p className="text-lg text-indigo-100 md:text-xl">
                {t("collections.subtitle")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-4 lg:self-start lg:-mt-12">
              <HeroStat icon={Award} label={stats.achievementsLabel} className="lg:w-[260px]" />
              <HeroStat icon={Medal} label={stats.badgesLabel} className="lg:w-[260px]" />
            </div>
          </div>
        </div>
      </section>

      <CollectionsPanel achievements={stats.achievements} badges={stats.badges} />
    </div>
  );
}

const HeroStat = ({ icon: Icon, label, className = "" }) => (
  <div
    className={`flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left ${className}`}
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
      <Icon className="h-5 w-5 text-white" />
    </span>
    <p className="text-sm font-semibold text-white/80">{label}</p>
  </div>
);

export default RequireAuth(CollectionsPage);
