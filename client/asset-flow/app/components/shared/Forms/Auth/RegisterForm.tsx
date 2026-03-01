'use client';
import React, { useState } from "react";

import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";

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
        try {
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

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            role: value,
            organizationId: value === "EMPLOYEE" ? prev.organizationId : 0,
        }));
    };
    
    return (
        <div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Work Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
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
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-200"
                            required
                        >
                            <option value="">Select role</option>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="LEADER">Leader</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="age">Age</Label>
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
                            <Label htmlFor="organizationId">Organization ID</Label>
                            <Input
                                id="organizationId"
                                name="organizationId"
                                type="number"
                                value={formData.organizationId}
                                onChange={handleChange}
                                min={0}
                            />
                        </div>
                    ) : null}
                    <div>

                    </div>
                </div>

                <div>
                    <Label htmlFor="assignmentIds">Assignment IDs</Label>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            id="assignmentIds"
                            name="assignmentIds"
                            type="text"
                            value={formData.assignmentIds.join(",")}
                            onChange={(e) => {
                                const text = e.target.value;
                                const arr = text
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                    .map((n) => Number(n))
                                    .filter((n) => !Number.isNaN(n));
                                setFormData((prev) => ({ ...prev, assignmentIds: arr }));
                            }}
                            placeholder="e.g. 1,2,3"
                            className="mt-0 flex-1"
                        />
                        <span className="text-xs text-slate-500">Separate IDs with commas</span>
                    </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Creating account…" : "Create account"}
                </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
                <p className="text-xs text-slate-500">Or continue with</p>
                <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoogleRegister}>
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    Register with Google
                </Button>
            </div>

            {error && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
            {success && (
                <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                    Registered successfully.
                </p>
            )}
        </div>
    );
}

export default RegisterForm;