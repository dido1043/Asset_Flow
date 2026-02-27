'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { cn } from "@/app/components/shared/utils/cn";

type LoginResponse = {
    token: string;
    expiresIn: number;
    role: string;
    userId: number;
};

const OAuthCallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const [error, setError] = useState<string | null>(null);
    const missingCode = !code;

    useEffect(() => {
        if (!code) {
            return;
        }

        //const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
        const controller = new AbortController();

        const exchangeCode = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/exchange`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                    signal: controller.signal,
                    cache: "no-store",
                });

                if (!response.ok) {
                    setError("OAuth exchange failed. Please try again.");
                    return;
                }

                const authPayload: LoginResponse = await response.json();
                localStorage.setItem("auth", JSON.stringify(authPayload));
                router.replace("/user/account");
            } catch (err) {
                if ((err as DOMException).name !== "AbortError") {
                    setError("Unable to complete OAuth sign-in. Please try again.");
                }
            }
        };

        exchangeCode();

        return () => controller.abort();
    }, [router, code]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 sm:px-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">AssetFlow</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Signing you in…</h2>
                    <p className="mt-1 text-sm text-slate-500">This will only take a moment.</p>
                </div>

                <div className="px-6 py-8 sm:px-10">
                    {missingCode && (
                        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
                            Missing OAuth code. Please try again.
                        </p>
                    )}
                    {!missingCode && error && (
                        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
                    )}

                    {(missingCode || error) && (
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/user/login"
                                className={cn(
                                    "inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto",
                                )}
                            >
                                Back to sign in
                            </Link>
                            <Link
                                href="/"
                                className={cn(
                                    "inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700 sm:w-auto",
                                )}
                            >
                                Go home
                            </Link>
                        </div>
                    )}

                    {!missingCode && !error && (
                        <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
                            <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500" />
                            Completing OAuth exchange…
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OAuthCallbackPage;
