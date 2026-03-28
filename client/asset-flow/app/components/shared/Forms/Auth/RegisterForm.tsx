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
        assignmentIds: ""
    });
    const [loading, setLoading] = useState(false);
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

                const nextOrganizations = results.flatMap((result) => {
                    if (result.status !== "fulfilled") {
                        return [];
                    }

                    const { leader, organization } = result.value;

                    if (organization.id == null) {
                        return [];
                    }

                    return [{
                        id: organization.id,
                        organizationName: organization.organizationName,
                        leaderName: leader.fullName ?? null,
                    }];
                }).reduce<KnownOrganizationOption[]>((accumulator, organization) => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

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

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
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
        } catch (error: unknown) {
            const message = getErrorMessage(error) || t("registerForm.errorFallback");
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleRegister = () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        window.location.href = buildApiUrl("/auth/oauth2/login");
    }

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            role: value as Role | "",
            organizationId: value === "EMPLOYEE" ? prev.organizationId : "",
            assignmentIds: value === "EMPLOYEE" ? prev.assignmentIds : "",
        }));
    };
    
    return (
        <div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Label htmlFor="fullName">{t("registerForm.fullName")}</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">{t("registerForm.email")}</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div>
                        <Label htmlFor="password">{t("registerForm.password")}</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="role">{t("registerForm.role")}</Label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                            required
                        >
                            <option value="">{t("registerForm.selectRole")}</option>
                            <option value="EMPLOYEE">{t("registerForm.employee")}</option>
                            <option value="LEADER">{t("registerForm.leader")}</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="age">{t("registerForm.age")}</Label>
                        <Input
                            id="age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleChange}
                            min={0}
                        />
                    </div>
                    {formData.role === "EMPLOYEE" ? (
                        <div>
                            <Label htmlFor="organizationId">{t("registerForm.company")}</Label>
                            {organizations.length > 0 ? (
                                <>
                                    <select
                                        id="organizationId"
                                        name="organizationId"
                                        value={formData.organizationId}
                                        onChange={(event) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                organizationId: event.target.value,
                                            }))
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
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
                                        {t("registerForm.companyHint")}
                                    </p>
                                </>
                            ) : (
                                <Input
                                    id="organizationId"
                                    name="organizationId"
                                    type="number"
                                    value={formData.organizationId}
                                    onChange={handleChange}
                                    min={0}
                                    placeholder={t("registerForm.companyFallbackPlaceholder")}
                                />
                            )}
                        </div>


                    ) : null}
                    <div>

                    </div>
                </div>
                {
                    formData.role === "EMPLOYEE" ? (
                        <div>
                    <Label htmlFor="assignmentIds">{t("registerForm.assignmentIds")}</Label>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            id="assignmentIds"
                            name="assignmentIds"
                            type="text"
                            value={formData.assignmentIds}
                            onChange={handleChange}
                            placeholder={t("registerForm.assignmentPlaceholder")}
                            className="mt-0 flex-1"
                        />
                        <span className="text-xs text-slate-500">{t("registerForm.assignmentHint")}</span>
                    </div>
                </div>
                    ) : null
                }
                

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                >
                    {loading ? t("registerForm.submitting") : t("registerForm.submit")}
                </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
                <p className="text-xs text-slate-500">{t("registerForm.orContinue")}</p>
                <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoogleRegister}>
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    {t("registerForm.google")}
                </Button>
            </div>

            {error && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
            {success && (
                <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                    {t("registerForm.success")}
                </p>
            )}
        </div>
    );
}

export default RegisterForm;
