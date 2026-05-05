'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


import { readAuthSession, subscribeToAuthChanges } from "@/app/lib/session";
import { signOut } from "@/app/lib/api";
import type { AuthSession } from "@/app/lib/types";
import { getRoleLabel, useTranslations } from "@/app/lib/i18n";

import { Button } from "../ui/Button";

const Navigation = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const { language, setLanguage, t } = useTranslations();

  React.useEffect(() => {
    setMounted(true);
    setSession(readAuthSession());

    return subscribeToAuthChanges(() => {
      setSession(readAuthSession());
    });
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const logout = () => {
    signOut();
    window.location.href = "/user/login";
  };

  const isAuthed = Boolean(session);
  const workspaceActive = pathname?.startsWith("/user/account");
  const links = [
    { href: "/", label: t("common.home"), active: pathname === "/" },
    ...(mounted && isAuthed
      ? [{ href: "/user/account", label: t("common.workspace"), active: Boolean(workspaceActive) }]
      : []),
  ];

  const languageSwitcher = (
    <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-sm">
      <button
        type="button"
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          language === "en" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
        }`}
        onClick={() => setLanguage("en")}
        aria-label={t("common.language")}
      >
        {t("common.languageEnglish")}
      </button>
      <button
        type="button"
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          language === "bg" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
        }`}
        onClick={() => setLanguage("bg")}
        aria-label={t("common.language")}
      >
        {t("common.languageBulgarian")}
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-2xl border border-transparent px-2 py-1 transition hover:border-slate-200/80 hover:bg-white/80"
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-slate-900/10">
            AF
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-slate-900">{t("common.appName")}</p>
            <p className="truncate text-xs text-slate-500">{t("nav.subtitle")}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <nav className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  link.active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {languageSwitcher}

          {mounted && isAuthed ? (
            <div className="flex items-center gap-2">
              {session?.role ? (
                <span className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 lg:inline-flex">
                  {getRoleLabel(session.role, t)}
                </span>
              ) : null}
              <Button variant="outline" size="sm" onClick={logout}>
                {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/user/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {t("common.signIn")}
              </Link>
              <Link href="/user/register">
                <Button size="sm" variant="secondary">
                  {t("common.getStarted")}
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {languageSwitcher}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          </Button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div id="mobile-navigation" className="border-t border-slate-200/80 bg-white/90 px-4 py-4 md:hidden sm:px-6">
          <div className="mx-auto max-w-7xl space-y-4">
            <nav className="grid gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    link.active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {mounted && isAuthed ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {t("nav.accountLabel")}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                    {getRoleLabel(session?.role, t)}
                  </span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    {t("nav.logout")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link href="/user/login">
                  <Button variant="outline" className="w-full">
                    {t("common.signIn")}
                  </Button>
                </Link>
                <Link href="/user/register">
                  <Button variant="secondary" className="w-full">
                    {t("common.getStarted")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navigation;
