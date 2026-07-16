'use client';

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { cn } from "@/app/components/shared/utils/cn";
import { apiRequest, getErrorMessage } from "@/app/lib/api";
import { useTranslations } from "@/app/lib/i18n";

type Status = "loading" | "success" | "expired" | "invalid" | "already" | "error";

const verificationRequests = new Map<string, Promise<void>>();

function verifyToken(token: string) {
  const existing = verificationRequests.get(token);
  if (existing) {
    return existing;
  }
  const request = apiRequest<unknown>("/auth/verify-email", {
    method: "GET",
    auth: false,
    searchParams: { token },
  })
    .then(() => undefined)
    .catch((error) => {
      verificationRequests.delete(token);
      throw error;
    });
  verificationRequests.set(token, request);
  return request;
}

function statusFromError(error: unknown): Status {
  const message = getErrorMessage(error).toLowerCase();
  if (message.includes("expire")) return "expired";
  if (message.includes("already")) return "already";
  if (message.includes("invalid") || message.includes("not found")) return "invalid";
  return "error";
}

function VerifyEmailCard() {
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(token ? "loading" : "invalid");
  const [resendEmail, setResendEmail] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    verifyToken(token)
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((error) => {
        if (!cancelled) setStatus(statusFromError(error));
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const canResend = status === "expired" || status === "invalid" || status === "error";

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResending(true);
    setResendMessage(null);
    setResendError(null);
    try {
      await apiRequest<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        auth: false,
        json: { email: resendEmail.trim() },
      });
      setResendMessage(t("verifyEmail.resendSuccess"));
    } catch (err) {
      setResendError(getErrorMessage(err) || t("verifyEmail.resendError"));
    } finally {
      setResending(false);
    }
  };

  const heading = {
    loading: t("verifyEmail.headingLoading"),
    success: t("verifyEmail.headingSuccess"),
    expired: t("verifyEmail.headingExpired"),
    invalid: t("verifyEmail.headingInvalid"),
    already: t("verifyEmail.headingAlready"),
    error: t("verifyEmail.headingError"),
  }[status];

  const body = {
    loading: t("verifyEmail.bodyLoading"),
    success: t("verifyEmail.bodySuccess"),
    expired: t("verifyEmail.bodyExpired"),
    invalid: t("verifyEmail.bodyInvalid"),
    already: t("verifyEmail.bodyAlready"),
    error: t("verifyEmail.bodyError"),
  }[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            {t("common.appName")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{heading}</h2>
          <p className="mt-1 text-sm text-slate-500">{body}</p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          {status === "loading" && (
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-600" />
              {t("verifyEmail.working")}
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/user/login"
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:w-auto",
                )}
              >
                {t("verifyEmail.goToLogin")}
              </Link>
            </div>
          )}

          {status === "already" && (
            <Link
              href="/user/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              {t("verifyEmail.goToLogin")}
            </Link>
          )}

          {canResend && (
            <form onSubmit={handleResend} className="mt-2 space-y-3">
              <label htmlFor="resend-email" className="block text-sm font-medium text-slate-700">
                {t("verifyEmail.resendLabel")}
              </label>
              <input
                id="resend-email"
                type="email"
                required
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                disabled={resending || !resendEmail}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {resending ? t("verifyEmail.resending") : t("verifyEmail.resendButton")}
              </button>
              {resendMessage && (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                  {resendMessage}
                </p>
              )}
              {resendError && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {resendError}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyEmailCard />
    </Suspense>
  );
}
