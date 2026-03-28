'use client';

import React from "react";
import { useRouter } from "next/navigation";

import { apiRequest, buildApiUrl, getErrorMessage } from "@/app/lib/api";
import { useTranslations } from "@/app/lib/i18n";
import { saveAuthSession } from "@/app/lib/session";
import type { LoginResponse } from "@/app/lib/types";

import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";

interface LoginFormData {
  name: string;
  email: string;
  password: string;
}

const LoginForm = () => {
  const router = useRouter();
  const { t } = useTranslations();

  const [formData, setFormData] = React.useState<LoginFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const authPayload = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        auth: false,
        json: formData,
      });

      saveAuthSession(authPayload);
      router.replace("/user/account");
    } catch (err: unknown) {
      const message = getErrorMessage(err) || t("loginForm.errorFallback");
      setError(message);
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = buildApiUrl("/auth/oauth2/login");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5">
          <div>
            <Label htmlFor="email">{t("loginForm.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="mb-0">
                {t("loginForm.password")}
              </Label>
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? t("common.hide") : t("common.show")}
              </button>
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="pr-20"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? t("loginForm.submitting") : t("loginForm.submit")}
        </Button>
      </form>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {t("loginForm.orContinue")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-4 w-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
            G
          </span>
          {t("loginForm.google")}
        </Button>
      </div>
    </>
  );
};

export default LoginForm;
