'use client';

import React from "react";
import Link from "next/link";

import { useTranslations } from "@/app/lib/i18n";

const Home = () => {
  const { t } = useTranslations();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("home.badge")}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {t("home.title")}
            </h1>
            <p className="mt-4 max-w-prose text-base text-slate-600 sm:text-lg">
              {t("home.description")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/user/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
              >
                {t("home.createAccount")}
              </Link>
              <Link
                href="/user/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                {t("home.signIn")}
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{t("home.featureAccessTitle")}</p>
                <p className="text-sm text-slate-600">{t("home.featureAccessDescription")}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{t("home.featureInventoryTitle")}</p>
                <p className="text-sm text-slate-600">{t("home.featureInventoryDescription")}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/60 via-white to-emerald-200/50 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <p className="text-sm font-semibold text-slate-900">{t("home.overviewTitle")}</p>
                <p className="text-xs text-slate-500">{t("home.overviewSubtitle")}</p>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{t("home.assigned")}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">128</p>
                  <p className="mt-1 text-sm text-slate-600">{t("home.assignedHint")}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{t("home.available")}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">42</p>
                  <p className="mt-1 text-sm text-slate-600">{t("home.availableHint")}</p>
                </div>
                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{t("home.recentActivity")}</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center justify-between">
                      <span>{t("home.activityOne")}</span>
                      <span className="text-xs text-slate-400">{t("home.timeOne")}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>{t("home.activityTwo")}</span>
                      <span className="text-xs text-slate-400">{t("home.timeTwo")}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>{t("home.activityThree")}</span>
                      <span className="text-xs text-slate-400">{t("home.timeThree")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Home;
