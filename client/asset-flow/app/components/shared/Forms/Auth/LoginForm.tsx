'use client';
import React from "react";

import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";

interface LoginFormData {   
    name: string;
    email: string;
    password: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

const LoginForm = () => {

    const [formData, setFormData] = React.useState<LoginFormData>({
        name: "",
        email: "",
        password: "",
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Login failed. Please check your credentials.");
            }

            const authPayload = await response.json();
            localStorage.setItem("auth", JSON.stringify(authPayload));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unable to login. Please try again.";
            setError(message);
            console.error("Login failed:", err);
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = () => {
        window.location.href = `${apiBaseUrl}/auth/oauth2/login`;
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div>
                        <Label htmlFor="email">Work Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
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
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                </Button>
            </form>

            {error && (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                </p>
            )}

            <div className="mt-6 flex flex-col gap-3">
                <p className="text-xs text-slate-500">Or continue with</p>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    Sign in with Google
                </Button>
            </div>
        </>
    );
}   

export default LoginForm;