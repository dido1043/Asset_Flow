'use client';
import React from "react";
import Link from "next/link";

import { clearAuthSession, readAuthSession, subscribeToAuthChanges } from "@/app/lib/session";
import type { AuthSession } from "@/app/lib/types";
import { Button } from "../ui/Button";

const Navigation = () => {
    const [mounted, setMounted] = React.useState(false);
    const [session, setSession] = React.useState<AuthSession | null>(null);

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
                        <p className="text-sm font-semibold text-slate-900">AssetFlow</p>
                        <p className="text-xs text-slate-500">Asset management</p>
                    </div>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link
                        href="/"
                        className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Home
                    </Link>

                    {mounted && isAuthed ? (
                        <>
                            <Link
                                href="/user/account"
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Workspace
                            </Link>
                            {session?.role && (
                                <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 sm:inline-flex">
                                    {session.role}
                                </span>
                            )}
                            <Button variant="outline" size="sm" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/user/login"
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Sign in
                            </Link>
                            <Link href="/user/register" className="inline-flex">
                                <span className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-black shadow-lg shadow-brand-200 transition hover:bg-brand-700">
                                    Get started
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
