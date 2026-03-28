'use client';

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/app/components/shared/utils/cn";
import { apiRequest } from "@/app/lib/api";
import { useTranslations } from "@/app/lib/i18n";
import { saveAuthSession } from "@/app/lib/session";
import type { LoginResponse } from "@/app/lib/types";

function OAuthCallbackCard({
  error,
  missingCode,
  loading,
}: {
  error: string | null;
  missingCode: boolean;
  loading: boolean;
}) {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{t("common.appName")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t("oauth.heading")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("oauth.subheading")}</p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          {missingCode && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
              {t("oauth.missingCode")}
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
                {t("oauth.backToSignIn")}
              </Link>
              <Link
                href="/"
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:w-auto",
                )}
              >
                {t("oauth.goHome")}
              </Link>
            </div>
          )}

          {!missingCode && !error && loading && (
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-600" />
              {t("oauth.completing")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const code = searchParams.get("code");
  const [error, setError] = useState<string | null>(null);
  const missingCode = !code;
  const [loading, setLoading] = useState(!missingCode);

  useEffect(() => {
    if (!code) {
      return;
    }

    const controller = new AbortController();

    const exchangeCode = async () => {
      try {
        const authPayload = await apiRequest<LoginResponse>("/auth/oauth/exchange", {
          method: "POST",
          auth: false,
          json: { code },
          signal: controller.signal,
        });

        saveAuthSession(authPayload);
        router.replace("/user/account");
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          setError(t("oauth.errorFallback"));
          setLoading(false);
        }
      }
    };

    void exchangeCode();

    return () => controller.abort();
  }, [router, code, t]);

  return <OAuthCallbackCard error={error} missingCode={missingCode} loading={loading} />;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<OAuthCallbackCard error={null} missingCode={false} loading />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
