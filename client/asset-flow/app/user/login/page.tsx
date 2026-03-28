'use client';

import React from "react";
import Link from "next/link";

import LoginForm from "@/app/components/shared/Forms/Auth/LoginForm";
import { useTranslations } from "@/app/lib/i18n";

const LoginPage = () => {
  const { t } = useTranslations();

  return (
    <div className="page-enter min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_32px_90px_rgba(15,23,42,0.2)] sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.36),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {t("common.appName")}
              </div>
              <h1 className="mt-6 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">
                {t("loginPage.heroTitle")}
              </h1>
              <p className="mt-4 max-w-lg text-sm text-slate-200 sm:text-base">
                {t("loginPage.heroDescription")}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {t("common.secure")}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {t("common.workspace")}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-slate-100">{t("loginPage.bulletOne")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-slate-100">{t("loginPage.bulletTwo")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm text-slate-100">{t("loginPage.bulletThree")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-panel rounded-[2rem] border border-white/70 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {t("common.secure")}
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">{t("loginPage.formTitle")}</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">{t("loginPage.formSubtitle")}</p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <LoginForm />
          </div>

          <p className="mt-6 text-sm text-slate-600">
            {t("loginPage.footerText")}{" "}
            <Link href="/user/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              {t("loginPage.footerLink")}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
