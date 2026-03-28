'use client';

import React from "react";
import Link from "next/link";

import LoginForm from "@/app/components/shared/Forms/Auth/LoginForm";
import { useTranslations } from "@/app/lib/i18n";

const LoginPage = () => {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:flex-row">
                <div className="relative flex flex-col justify-between bg-slate-900 px-8 py-10 text-white lg:w-5/12">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">{t("common.appName")}</p>
                        <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{t("loginPage.heroTitle")}</h2>
                        <p className="mt-4 text-sm text-slate-200 sm:text-base">
                            {t("loginPage.heroDescription")}
                        </p>
                    </div>
                    <div className="mt-10 space-y-3 text-sm text-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            {t("loginPage.bulletOne")}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            {t("loginPage.bulletTwo")}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            {t("loginPage.bulletThree")}
                        </div>
                    </div>
                </div>

                <div className="flex-1 px-6 py-10 sm:px-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900">{t("loginPage.formTitle")}</h2>
                            <p className="mt-1 text-sm text-slate-500">{t("loginPage.formSubtitle")}</p>
                        </div>
                        <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 sm:inline-flex">
                            {t("common.secure")}
                        </span>
                    </div>

                    <LoginForm />

                    <p className="mt-6 text-sm text-slate-600">
                        {t("loginPage.footerText")}{" "}
                        <Link href="/user/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                            {t("loginPage.footerLink")}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
