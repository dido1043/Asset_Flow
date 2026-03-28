'use client';
import React from "react";
import Link from "next/link";

import { clearAuthSession, readAuthSession, subscribeToAuthChanges } from "@/app/lib/session";
import type { AuthSession } from "@/app/lib/types";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";
import { Button } from "../ui/Button";

const Navigation = () => {
    const [mounted, setMounted] = React.useState(false);
    const [session, setSession] = React.useState<AuthSession | null>(null);
    const { language, setLanguage, t } = useTranslations();

    React.useEffect(() => {
        setMounted(true);
        setSession(readAuthSession());

        return subscribeToAuthChanges(() => {
            setSession(readAuthSession());
        });
    }, []);

    const logout = () => {
        clearAuthSession();
        window.location.href = "/user/login";
    };

    const isAuthed = Boolean(session);

    return(
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                        AF
                    </span>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-slate-900">{t("common.appName")}</p>
                        <p className="text-xs text-slate-500">{t("home.overviewTitle")}</p>
                    </div>
                </Link>

                <nav className="flex flex-wrap items-center justify-end gap-2">
                    <div className="mr-1 inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                language === "en" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                            onClick={() => setLanguage("en")}
                            aria-label={t("common.language")}
                        >
                            {t("common.languageEnglish")}
                        </button>
                        <button
                            type="button"
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                language === "bg" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                            }`}
                            onClick={() => setLanguage("bg")}
                            aria-label={t("common.language")}
                        >
                            {t("common.languageBulgarian")}
                        </button>
                    </div>
                    <Link
                        href="/"
                        className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        {t("common.home")}
                    </Link>

                    {mounted && isAuthed ? (
                        <>
                            <Link
                                href="/user/account"
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                {t("common.workspace")}
                            </Link>
                            {session?.role && (
                                <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 md:inline-flex">
                                    {getRoleLabel(session.role, t)}
                                </span>
                            )}
                            <Button variant="outline" size="sm" onClick={logout}>
                                {t("nav.logout")}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/user/login"
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                {t("common.signIn")}
                            </Link>
                            <Link href="/user/register" className="inline-flex">
                                <span className="inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
                                    {t("common.getStarted")}
                                </span>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Navigation;
