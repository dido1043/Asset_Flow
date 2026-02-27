'use client';
import React, { useState } from "react";


interface RegisterFormData {
    fullName: string;
    email: string;
    password: string;
    role: string;
    age: number;
    organizationId: number;
    assignmentIds: Array<number>;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

const RegisterForm = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        fullName: "",
        email: "",
        password: "",
        role: "",
        age: 0,
        organizationId: 0,
        assignmentIds: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "age" || name === "organizationId" ? Number(value) : value,
        }));
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
    try{
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Registration failed");
            }
            setSuccess(true);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Registration failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleRegister = () => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        window.location.href = `${apiBaseUrl}/auth/oauth2/login`;
    }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl lg:flex-row">
            <div className="relative flex flex-col justify-between bg-slate-900 px-8 py-10 text-white lg:w-5/12">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">AssetFlow</p>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">Join your asset team workspace</h2>
                    <p className="mt-4 text-sm text-slate-200 sm:text-base">
                        Centralize assets, automate assignments, and keep every team member aligned in one modern platform.
                    </p>
                </div>
                <div className="mt-10 space-y-3 text-sm text-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        Secure access with role-based permissions
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        Real-time inventory insights
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        Audit-ready activity trails
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-10 sm:px-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
                        <p className="mt-1 text-sm text-slate-500">Start managing your assets in minutes.</p>
                    </div>
                    <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 sm:inline-flex">
                        Free trial
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Work Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                required
                            >
                                <option value="">Select role</option>
                                <option value="EMPLOYEE">Employee</option>
                                <option value="LEADER">Leader</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-slate-700">Age</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                min={0}
                            />
                        </div>

                        <div>
                            <label htmlFor="organizationId" className="block text-sm font-medium text-slate-700">Organization ID</label>
                            <input
                                type="number"
                                id="organizationId"
                                name="organizationId"
                                value={formData.organizationId}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                                min={0}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="assignmentIds" className="block text-sm font-medium text-slate-700">Assignment IDs</label>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                                type="text"
                                id="assignmentIds"
                                name="assignmentIds"
                                value={formData.assignmentIds.join(',')}
                                onChange={(e) => {
                                    const text = e.target.value;
                                    const arr = text
                                        .split(',')
                                        .map(s => s.trim())
                                        .filter(Boolean)
                                        .map(n => Number(n))
                                        .filter(n => !Number.isNaN(n));
                                    setFormData(prev => ({ ...prev, assignmentIds: arr }));
                                }}
                                placeholder="e.g. 1,2,3"
                                className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                            />
                            <span className="text-xs text-slate-500">Separate IDs with commas</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Create account"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-3">
                    <p className="text-xs text-slate-500">Or continue with</p>
                    <button
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        type="button"
                        onClick={handleGoogleRegister}
                    >
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        Register with Google
                    </button>
                </div>

                {error && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
                {success && <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-600">Registered successfully.</p>}

                {/* Optional: show current form state for debugging */}
                <pre className="mt-6 max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{JSON.stringify(formData, null, 2)}</pre>
            </div>
        </div>
    </div>
    );
}

export default RegisterForm;