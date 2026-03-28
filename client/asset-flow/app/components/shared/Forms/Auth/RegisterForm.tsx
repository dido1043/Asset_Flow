'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest, buildApiUrl, getErrorMessage } from "@/app/lib/api";
import { useTranslations } from "@/app/lib/i18n";
import type { OrganizationDto, Role, UserDto } from "@/app/lib/types";

import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";

type KnownOrganizationOption = {
  id: number;
  organizationName: string;
  leaderName: string | null;
};

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  role: Role | "";
  age: string;
  organizationId: string;
  assignmentIds: string;
}

const RegisterForm = () => {
  const router = useRouter();
  const { t } = useTranslations();
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    role: "",
    age: "",
    organizationId: "",
    assignmentIds: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [organizations, setOrganizations] = useState<KnownOrganizationOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadOrganizations = async () => {
      try {
        const users = await apiRequest<UserDto[]>("/auth/users", {
          auth: false,
        });

        const leaders = users.filter((user) => user.role === "LEADER" && typeof user.id === "number");
        const results = await Promise.allSettled(
          leaders.map(async (leader) => {
            const organization = await apiRequest<OrganizationDto>(`/org/leader/${leader.id}`, {
              auth: false,
            });

            return {
              leader,
              organization,
            };
          }),
        );

        if (cancelled) {
          return;
        }

        const nextOrganizations = results
          .flatMap((result) => {
            if (result.status !== "fulfilled") {
              return [];
            }

            const { leader, organization } = result.value;

            if (organization.id == null) {
              return [];
            }

            return [
              {
                id: organization.id,
                organizationName: organization.organizationName,
                leaderName: leader.fullName ?? null,
              },
            ];
          })
          .reduce<KnownOrganizationOption[]>((accumulator, organization) => {
            if (accumulator.some((item) => item.id === organization.id)) {
              return accumulator;
            }

            return [...accumulator, organization];
          }, []);

        setOrganizations(
          nextOrganizations.sort((left, right) => left.organizationName.localeCompare(right.organizationName)),
        );
      } catch {
        if (!cancelled) {
          setOrganizations([]);
        }
      }
    };

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    setFormData((previous) => ({
      ...previous,
      role: value as Role | "",
      organizationId: value === "EMPLOYEE" ? previous.organizationId : "",
      assignmentIds: value === "EMPLOYEE" ? previous.assignmentIds : "",
    }));
  };

  const buildPayload = (): UserDto => {
    const assignmentIds = formData.assignmentIds
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    return {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role || "EMPLOYEE",
      age: formData.age ? Number(formData.age) : null,
      organizationId: formData.role === "EMPLOYEE" && formData.organizationId ? Number(formData.organizationId) : null,
      assignmentIds: formData.role === "EMPLOYEE" ? assignmentIds : [],
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiRequest<UserDto>("/auth/register", {
        method: "POST",
        auth: false,
        json: buildPayload(),
      });
      setSuccess(true);
      window.setTimeout(() => {
        router.push("/user/login");
      }, 1200);
    } catch (submitError: unknown) {
      const message = getErrorMessage(submitError) || t("registerForm.errorFallback");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    window.location.href = buildApiUrl("/auth/oauth2/login");
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fullName">{t("registerForm.fullName")}</Label>
              <Input
                id="fullName"
                name="fullName"
                autoComplete="name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">{t("registerForm.email")}</Label>
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
                  {t("registerForm.password")}
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="role">{t("registerForm.role")}</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                required
              >
                <option value="">{t("registerForm.selectRole")}</option>
                <option value="EMPLOYEE">{t("registerForm.employee")}</option>
                <option value="LEADER">{t("registerForm.leader")}</option>
              </select>
            </div>

            <div>
              <Label htmlFor="age">{t("registerForm.age")}</Label>
              <Input id="age" name="age" type="number" min={0} value={formData.age} onChange={handleChange} />
            </div>

            {formData.role === "EMPLOYEE" ? (
              <div className="sm:col-span-2">
                <Label htmlFor="organizationId">{t("registerForm.company")}</Label>
                {organizations.length > 0 ? (
                  <>
                    <select
                      id="organizationId"
                      name="organizationId"
                      value={formData.organizationId}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          organizationId: event.target.value,
                        }))
                      }
                      className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200/90 bg-white/75 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="">{t("registerForm.selectCompany")}</option>
                      {organizations.map((organization) => (
                        <option key={organization.id} value={organization.id}>
                          {organization.organizationName}
                          {organization.leaderName ? ` • ${organization.leaderName}` : ""}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-slate-500">
                      {t("registerForm.companiesLoaded", { count: organizations.length })}
                    </p>
                  </>
                ) : (
                  <>
                    <Input
                      id="organizationId"
                      name="organizationId"
                      type="number"
                      value={formData.organizationId}
                      onChange={handleChange}
                      min={0}
                      placeholder={t("registerForm.companyFallbackPlaceholder")}
                    />
                    <p className="mt-2 text-xs text-slate-500">{t("registerForm.companyHint")}</p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {formData.role === "EMPLOYEE" ? (
          <details className="rounded-3xl border border-slate-200/80 bg-white/80 p-5">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
              {t("registerForm.assignmentIds")}
            </summary>
            <div className="mt-4">
              <Input
                id="assignmentIds"
                name="assignmentIds"
                type="text"
                value={formData.assignmentIds}
                onChange={handleChange}
                placeholder={t("registerForm.assignmentPlaceholder")}
                className="mt-0"
              />
              <p className="mt-2 text-xs text-slate-500">{t("registerForm.assignmentHint")}</p>
            </div>
          </details>
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? t("registerForm.submitting") : t("registerForm.submit")}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {t("registerForm.orContinue")}
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="mt-4 w-full"
          onClick={handleGoogleRegister}
          disabled={loading}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700">
            G
          </span>
          {t("registerForm.google")}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {t("registerForm.success")}
        </p>
      ) : null}
    </div>
  );
};

export default RegisterForm;
