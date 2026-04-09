'use client';

import React from "react";
import Link from "next/link";

import { useTranslations } from "@/app/lib/i18n";
import { readAuthSession, subscribeToAuthChanges } from "@/app/lib/session";
import type { AuthSession } from "@/app/lib/types";

const Home = () => {
  const { t } = useTranslations();
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [sessionChecked, setSessionChecked] = React.useState(false);

  React.useEffect(() => {
    const syncSession = () => {
      setSession(readAuthSession());
      setSessionChecked(true);
    };

    syncSession();
    return subscribeToAuthChanges(syncSession);
  }, []);

  return (
    <main className="page-enter relative min-h-[calc(100vh-4.5rem)] overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-indigo-100/70 via-white/20 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="surface-panel rounded-[2rem] border border-white/70 p-6 sm:p-8 lg:p-10">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t("home.badge")}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {t("common.secure")}
            </span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {t("common.live")}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {t("common.ready")}
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {t("home.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            {t("home.description")}
          </p>
          {sessionChecked && !session ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/user/register">
                <span className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800">
                  {t("home.createAccount")}
                </span>
              </Link>
              <Link href="/user/login">
                <span className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
                  {t("home.signIn")}
                </span>
              </Link>
            </div>
          ) : null}

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{t("home.assigned")}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">128</p>
              <p className="mt-2 text-sm text-slate-600">{t("home.assignedHint")}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{t("home.available")}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">42</p>
              <p className="mt-2 text-sm text-slate-600">{t("home.availableHint")}</p>
            </div>
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{t("home.featureInventoryTitle")}</p>
              <p className="mt-2 text-sm text-slate-600">{t("home.featureInventoryDescription")}</p>
            </div>
          </div>
        </section>

        <section className="page-enter relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.36),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.18),transparent_28%)]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
                  {t("home.overviewTitle")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  {t("home.overviewSubtitle")}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100">
                {t("common.live")}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-white">{t("home.featureAccessTitle")}</p>
                <p className="mt-2 text-sm text-slate-300">{t("home.featureAccessDescription")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-white">{t("home.featureInventoryTitle")}</p>
                <p className="mt-2 text-sm text-slate-300">{t("home.featureInventoryDescription")}</p>
              </div>
              <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm font-semibold text-white">{t("home.recentActivity")}</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li className="flex items-start justify-between gap-4">
                    <span>{t("home.activityOne")}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                      {t("home.timeOne")}
                    </span>
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <span>{t("home.activityTwo")}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                      {t("home.timeTwo")}
                    </span>
                  </li>
                  <li className="flex items-start justify-between gap-4">
                    <span>{t("home.activityThree")}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                      {t("home.timeThree")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
